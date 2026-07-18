import { Router } from 'express';
import { pool } from '../db/pool.js';
import { registerClient } from '../services/sse-broadcast.js';
import { optionalAuth } from '../middleware/auth.js';
import { validateLatLon } from '../lib/validate.js';

const router = Router();

// Valid origins for SSE (panduan §24: WAJIB validasi Origin)
const ALLOWED_SSE_ORIGINS = [
  process.env.CORS_ORIGIN || 'http://localhost:5173',
  process.env.PROD_ORIGIN,
].filter(Boolean);

// GET /events/radar — SSE stream for buyers (geo-filtered)
// Uses optionalAuth: buyer anonymous OK, but token accepted if present
router.get('/radar', optionalAuth, async (req, res) => {
  // Validate Origin header (panduan §24, Rule 1)
  const origin = req.headers.origin;
  if (origin && !ALLOWED_SSE_ORIGINS.includes(origin)) {
    return res.status(403).json({ status: 403, error: 'Forbidden', message: 'Origin tidak diizinkan' });
  }

  const { lat, lon } = req.query;

  // Validate lat/lon range (panduan §2, Rule 4)
  const coords = validateLatLon(lat, lon);
  if (!coords.valid) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: coords.error });
  }
  const buyerLat = coords.lat;
  const buyerLon = coords.lon;

  // SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  // Register client for geo-filtered broadcasts
  const clientId = registerClient(res, buyerLat, buyerLon);

  // Send initial vendor list
  try {
    const result = await pool.query(
      `SELECT
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
        ST_Distance(s.current_location, ST_MakePoint($1, $2)::geography) AS estimasi_jarak
       FROM merchant_radar_signals s
       JOIN merchants m ON s.merchant_id = m.id
       WHERE s.is_radar_active = TRUE
         AND s.last_updated_at > NOW() - INTERVAL '15 minutes'
         AND ST_DWithin(s.current_location, ST_MakePoint($1, $2)::geography, 2000)
       ORDER BY
         CASE WHEN m.current_tier = 'pro' THEN 1 WHEN m.current_tier = 'standard' THEN 2 ELSE 3 END,
         estimasi_jarak ASC`,
      [buyerLon, buyerLat]
    );

    // Enrich with ratings for pro merchants
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

    const vendors = result.rows.map((r) => ({
      merchant_id: r.merchant_id,
      business_name: r.business_name,
      category: r.category,
      price_baseline: parseFloat(r.price_baseline),
      menu_spanduk_url: r.menu_spanduk_url,
      current_tier: r.current_tier,
      status_gerak: r.status_gerak,
      lat: r.lat,
      lon: r.lon,
      estimasi_jarak_meter: Math.round(parseFloat(r.estimasi_jarak)),
      reputasi: ratingsMap[r.merchant_id] || null,
      metode_pembayaran: ['CASH', ...(r.qris_tip_destination ? ['QRIS'] : [])],
    }));

    res.write(`event: vendor-list\ndata: ${JSON.stringify(vendors)}\n\n`);
  } catch (err) {
    console.error('SSE initial fetch error:', err);
  }

  // Keep-alive ping every 30s
  const keepAlive = setInterval(() => {
    res.write(':keepalive\n\n');
  }, 30000);

  // Cleanup on disconnect
  req.on('close', () => {
    clearInterval(keepAlive);
  });
});

export default router;
