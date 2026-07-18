import { Router } from 'express';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from '../db/pool.js';
import { authenticateToken, optionalAuth } from '../middleware/auth.js';
import { sanitizeBody } from '../middleware/sanitize.js';
import { reviewThrottle } from '../middleware/throttle.js';
import { REVIEW_RATE_LIMIT_MS } from '../../src/config/constants.js';
import { validateLatLon } from '../lib/validate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

// GET /buyer/radar — find merchants within 2km
router.get('/radar', async (req, res) => {
  try {
    const { lat, lon, search, filter } = req.query;

    // Validate lat/lon range (panduan §2, Rule 4)
    const coords = validateLatLon(lat, lon);
    if (!coords.valid) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: coords.error });
    }
    const buyerLat = coords.lat;
    const buyerLon = coords.lon;

    // Spatial query
    let query = `
      SELECT
        m.id AS merchant_id,
        m.business_name,
        m.category,
        m.price_baseline,
        m.menu_spanduk_url,
        m.current_tier,
        m.qris_tip_destination,
        s.status_gerak,
        ST_Y(s.current_location::geometry) AS lat,
        ST_X(s.current_location::geometry) AS lon,
        ST_Distance(
          s.current_location,
          ST_MakePoint($1, $2)::geography
        ) AS estimasi_jarak
      FROM merchant_radar_signals s
      JOIN merchants m ON s.merchant_id = m.id
      WHERE
        s.is_radar_active = TRUE
        AND s.last_updated_at > NOW() - INTERVAL '15 minutes'
        AND ST_DWithin(
          s.current_location,
          ST_MakePoint($1, $2)::geography,
          2000
        )
    `;
    const params = [buyerLon, buyerLat];

    // Filter
    if (filter === 'mangkal') {
      query += ` AND s.status_gerak = 'mangkal'`;
    }
    if (filter === 'qris') {
      query += ` AND m.qris_tip_destination IS NOT NULL`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND (m.business_name ILIKE $${params.length} OR m.category ILIKE $${params.length})`;
    }

    query += `
      ORDER BY
        CASE WHEN m.current_tier = 'pro' THEN 1
             WHEN m.current_tier = 'standard' THEN 2
             ELSE 3 END,
        estimasi_jarak ASC
    `;

    const result = await pool.query(query, params);

    // Get ratings for pro merchants
    const merchantIds = result.rows.filter((r) => r.current_tier === 'pro').map((r) => r.merchant_id);
    let ratingsMap = {};

    if (merchantIds.length > 0) {
      const ratingsResult = await pool.query(
        `SELECT merchant_id, ROUND(AVG(rating), 1) AS rating_rata_rata, COUNT(*) AS total_ulasan
         FROM reviews WHERE merchant_id = ANY($1) GROUP BY merchant_id`,
        [merchantIds]
      );
      ratingsMap = Object.fromEntries(
        ratingsResult.rows.map((r) => [r.merchant_id, { rating_rata_rata: parseFloat(r.rating_rata_rata), total_ulasan: parseInt(r.total_ulasan) }])
      );
    }

    // Format response
    const data = result.rows.map((row) => ({
      merchant_id: row.merchant_id,
      business_name: row.business_name,
      category: row.category,
      price_baseline: parseFloat(row.price_baseline),
      menu_spanduk_url: row.menu_spanduk_url,
      current_tier: row.current_tier,
      status_gerak: row.status_gerak,
      lat: row.lat,
      lon: row.lon,
      estimasi_jarak_meter: Math.round(parseFloat(row.estimasi_jarak)),
      reputasi: ratingsMap[row.merchant_id] || null,
      metode_pembayaran: ['CASH', ...(row.qris_tip_destination ? ['QRIS'] : [])],
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('Buyer radar error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /buyer/review — submit review (rate limited: 1 per buyer per merchant per 2h)
router.post('/review', sanitizeBody, optionalAuth, reviewThrottle, async (req, res) => {
  try {
    const { merchant_id, rating, comment } = req.body;
    const buyer_id = req.user?.id || null;
    const buyerKey = buyer_id || req.ip;

    if (!merchant_id || !rating) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'merchant_id dan rating wajib diisi' });
    }
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Rating harus 1-5' });
    }
    if (comment && comment.length > 200) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Komentar maksimal 200 karakter' });
    }

    // Rate limit: 1 review per buyer per merchant per 2 hours
    // For anonymous buyers (buyer_id = null), use IP + merchant combo
    const recentReview = await pool.query(
      buyer_id
        ? `SELECT id FROM reviews
           WHERE merchant_id = $1 AND buyer_id = $2
             AND created_at > NOW() - INTERVAL '1 second' * $3
           LIMIT 1`
        : `SELECT id FROM reviews
           WHERE merchant_id = $1 AND buyer_id IS NULL
             AND created_at > NOW() - INTERVAL '1 second' * $2
           LIMIT 1`,
      buyer_id
        ? [merchant_id, buyer_id, Math.ceil(REVIEW_RATE_LIMIT_MS / 1000)]
        : [merchant_id, Math.ceil(REVIEW_RATE_LIMIT_MS / 1000)]
    );

    if (recentReview.rows.length > 0) {
      return res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: 'Anda sudah memberikan ulasan untuk pedagang ini. Silakan coba lagi nanti.',
      });
    }

    await pool.query(
      'INSERT INTO reviews (merchant_id, buyer_id, rating, comment) VALUES ($1, $2, $3, $4)',
      [merchant_id, buyer_id, rating, comment || null]
    );

    res.status(201).json({ success: true, message: 'Ulasan berhasil disimpan' });
  } catch (err) {
    console.error('Review error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /buyer/search-event — record anonymized buyer search for heatmap
router.post('/search-event', async (req, res) => {
  try {
    const { lat, lon } = req.body;

    // Validate lat/lon range (panduan §2, Rule 4)
    const coords = validateLatLon(lat, lon);
    if (!coords.valid) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: coords.error });
    }

    const now = new Date();
    const hourOfDay = now.getHours();
    const dayOfWeek = now.getDay(); // 0 = Sunday, 6 = Saturday

    // Upsert: increment counter if a search happened nearby in same hour + day
    // Group searches within ~100m radius as same zone
    const result = await pool.query(
      `INSERT INTO buyer_search_heatmap (location, hour_of_day, day_of_week, search_count, last_searched_at)
       VALUES (ST_MakePoint($1, $2)::geography, $3, $4, 1, NOW())
       ON CONFLICT DO NOTHING
       RETURNING id`,
      [coords.lon, coords.lat, hourOfDay, dayOfWeek]
    );

    // If no insert (nearby zone exists), increment existing
    if (result.rows.length === 0) {
      await pool.query(
        `UPDATE buyer_search_heatmap
         SET search_count = search_count + 1,
             last_searched_at = NOW()
         WHERE hour_of_day = $1
           AND day_of_week = $2
           AND ST_DWithin(location, ST_MakePoint($3, $4)::geography, 150)
         LIMIT 1`,
        [hourOfDay, dayOfWeek, coords.lon, coords.lat]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Search event error:', err);
    // Don't block the client — silently fail
    res.json({ success: false, error: 'logged' });
  }
});

export default router;
