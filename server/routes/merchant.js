import { Router } from 'express';
import { pool } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { pingThrottle } from '../middleware/throttle.js';
import { sanitizeBody } from '../middleware/sanitize.js';
import { broadcastToNearby } from '../services/sse-broadcast.js';
import { activateTier, deductFreeQuota, hasPaidTier } from '../services/quota-manager.js';
import { STANDARD_COST_PER_DAY, PRO_COST_PER_DAY } from '../../src/config/constants.js';
import { validateLatLon } from '../lib/validate.js';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { open } from 'fs/promises';

const router = Router();

// Multer config for menu spanduk upload
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const uploadsDir = join(__dirname, '..', '..', 'public', 'uploads');

if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = '.webp';
    cb(null, `spanduk-${randomUUID()}${ext}`);
  },
});

// Magic bytes signatures for allowed image formats (panduan §16, Rule 4)
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
};

/**
 * Validate file starts with correct magic bytes
 */
function validateMagicBytes(filePath, claimedMime) {
  const signatures = MAGIC_BYTES[claimedMime];
  if (!signatures) return false;

  try {
    const buffer = readFileSync(filePath, { flag: 'r' });
    if (buffer.length < 4) return false;

    return signatures.some((sig) =>
      sig.every((byte, i) => buffer[i] === byte)
    );
  } catch {
    return false;
  }
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Format tidak didukung. Gunakan JPG, PNG, atau WebP.'));
    }
  },
});

// All merchant routes require auth
router.use(authenticateToken);

// GET /merchant/dashboard — current state for dashboard display
router.get('/dashboard', async (req, res) => {
  try {
    const merchantId = req.user.id;

    const result = await pool.query(
      `SELECT
         m.coin_balance,
         m.current_tier,
         s.is_radar_active,
         s.remaining_free_quota,
         s.status_gerak,
         s.last_updated_at
       FROM merchants m
       LEFT JOIN merchant_radar_signals s ON m.id = s.merchant_id
       WHERE m.id = $1`,
      [merchantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
    }

    const row = result.rows[0];

    // Parse interval to seconds
    let remainingSeconds = 10800;
    if (row.remaining_free_quota) {
      const match = row.remaining_free_quota;
      // Extract hours:minutes:seconds from PostgreSQL interval
      const parts = /(\d+):(\d+):(\d+)/.exec(match);
      if (parts) {
        remainingSeconds = parseInt(parts[1]) * 3600 + parseInt(parts[2]) * 60 + parseInt(parts[3]);
      }
    }

    res.json({
      success: true,
      data: {
        coin_balance: parseInt(row.coin_balance) || 0,
        current_tier: row.current_tier || 'free',
        is_radar_active: row.is_radar_active || false,
        remaining_free_quota_seconds: remainingSeconds,
        status_gerak: row.status_gerak || 'jalan',
        last_updated_at: row.last_updated_at,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /merchant/radar/ping — update location
router.post('/radar/ping', pingThrottle, async (req, res) => {
  try {
    const { latitude, longitude, status_gerak, speed_kmh } = req.body;
    const merchantId = req.user.id;

    // Validate lat/lon range (panduan §2, Rule 4)
    const coords = validateLatLon(latitude, longitude);
    if (!coords.valid) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: coords.error });
    }

    // Upsert location
    await pool.query(
      `INSERT INTO merchant_radar_signals (merchant_id, is_radar_active, current_location, status_gerak, last_updated_at)
       VALUES ($1, TRUE, ST_MakePoint($2, $3)::geography, $4, NOW())
       ON CONFLICT (merchant_id)
       DO UPDATE SET
         current_location = ST_MakePoint($2, $3)::geography,
         status_gerak = $4,
         last_updated_at = NOW()`,
      [merchantId, coords.lon, coords.lat, status_gerak || 'jalan']
    );

    // Get current quota and balance — compute remaining free quota server-side
    const result = await pool.query(
      `SELECT s.remaining_free_quota, s.radar_started_at, m.coin_balance, m.current_tier
       FROM merchant_radar_signals s
       JOIN merchants m ON s.merchant_id = m.id
       WHERE s.merchant_id = $1`,
      [merchantId]
    );

    const row = result.rows[0] || {};

    // Server-side quota enforcement for free tier (panduan §15: jangan andalkan client)
    const isPaid = await hasPaidTier(merchantId);
    if (!isPaid) {
      const quotaResult = await deductFreeQuota(merchantId, 10);
      if (!quotaResult.allowed) {
        return res.status(403).json({
          status: 403,
          error: 'Quota Exhausted',
          message: 'Kuota gratis harian habis. Upgrade ke Standard/Pro untuk lanjut siaran.',
        });
      }
      row.remaining_free_quota_seconds = quotaResult.remaining_seconds;
    }

    // Broadcast vendor update to nearby buyers via SSE
    broadcastToNearby({
      merchant_id: merchantId,
      lat: coords.lat,
      lon: coords.lon,
      status_gerak: status_gerak || 'jalan',
    });

    res.json({
      success: true,
      is_radar_active: true,
      remaining_free_quota_seconds: row.remaining_free_quota_seconds ?? 10800,
      coin_balance: row.coin_balance || 0,
    });
  } catch (err) {
    console.error('Radar ping error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// PUT /merchant/radar/toggle — start/stop radar
// Records radar_started_at for server-side quota tracking (panduan §15: jangan andalkan client)
router.put('/radar/toggle', async (req, res) => {
  try {
    const { is_radar_active } = req.body;
    const merchantId = req.user.id;

    if (is_radar_active) {
      // Start radar — record timestamp for server-side quota tracking
      await pool.query(
        `UPDATE merchant_radar_signals SET
           is_radar_active = TRUE,
           last_updated_at = NOW(),
           radar_started_at = COALESCE(radar_started_at, NOW())
         WHERE merchant_id = $1`,
        [merchantId]
      );
    } else {
      // Stop radar — reset started_at so next start gets fresh timestamp
      await pool.query(
        `UPDATE merchant_radar_signals SET
           is_radar_active = FALSE,
           last_updated_at = NOW(),
           radar_started_at = NULL
         WHERE merchant_id = $1`,
        [merchantId]
      );
    }

    res.json({
      success: true,
      is_radar_active: !!is_radar_active,
      message: is_radar_active ? 'Radar diaktifkan. Sisa kuota gratis Anda mulai berjalan.' : 'Radar dinonaktifkan.',
    });
  } catch (err) {
    console.error('Radar toggle error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// GET /merchant/profile — read current profile data
router.get('/profile', async (req, res) => {
  try {
    const merchantId = req.user.id;
    const result = await pool.query(
      `SELECT business_name, category, price_baseline, menu_spanduk_url,
              profile_photo_url, qris_tip_photo_url, qris_tip_destination,
              coin_balance, current_tier
       FROM merchants WHERE id = $1`,
      [merchantId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
    }
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// PUT /merchant/profile — update business profile
router.put('/profile', sanitizeBody, async (req, res) => {
  try {
    const { business_name, category, price_baseline, menu_spanduk_url, profile_photo_url, qris_tip_photo_url, qris_tip_destination } = req.body;
    const merchantId = req.user.id;
    const VALID_CATEGORIES = ['Makanan', 'Minuman'];

    // Validation
    if (!business_name || business_name.length < 3 || business_name.length > 40) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Nama dagangan 3-40 karakter' });
    }
    if (category && !VALID_CATEGORIES.includes(category)) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Kategori harus Makanan atau Minuman' });
    }
    if (price_baseline != null && (price_baseline < 0 || price_baseline > 1000000)) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Harga 0-1.000.000' });
    }

    // Build dynamic SET clause — only update fields yg dikirim
    const updates = [];
    const values = [];
    let idx = 1;

    updates.push(`business_name = $${idx++}`);
    values.push(business_name);

    updates.push(`category = $${idx++}`);
    values.push(category);

    updates.push(`price_baseline = $${idx++}`);
    values.push(price_baseline || 0);

    if (menu_spanduk_url !== undefined) {
      updates.push(`menu_spanduk_url = $${idx++}`);
      values.push(menu_spanduk_url || null);
    }
    if (profile_photo_url !== undefined) {
      updates.push(`profile_photo_url = $${idx++}`);
      values.push(profile_photo_url || null);
    }
    if (qris_tip_photo_url !== undefined) {
      updates.push(`qris_tip_photo_url = $${idx++}`);
      values.push(qris_tip_photo_url || null);
    }
    if (qris_tip_destination !== undefined) {
      updates.push(`qris_tip_destination = $${idx++}`);
      values.push(qris_tip_destination || null);
    }

    values.push(merchantId);

    await pool.query(
      `UPDATE merchants SET ${updates.join(', ')} WHERE id = $${idx}`,
      values
    );

    res.json({ success: true, message: 'Profil berhasil diperbarui' });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /merchant/tier/activate — upgrade tier (Standard/Pro)
// Uses SELECT ... FOR UPDATE in transaction (panduan §15: atomic, anti-race-condition)
router.post('/tier/activate', async (req, res) => {
  const client = await pool.connect();
  try {
    const { tier } = req.body;
    const merchantId = req.user.id;

    if (!tier || !['standard', 'pro'].includes(tier)) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Tier harus standard atau pro' });
    }

    const cost = tier === 'pro' ? PRO_COST_PER_DAY : STANDARD_COST_PER_DAY;

    // BEGIN transaction with row lock (panduan §15, Rule 2: FOR UPDATE)
    await client.query('BEGIN');

    const balanceResult = await client.query(
      'SELECT coin_balance, current_tier FROM merchants WHERE id = $1 FOR UPDATE',
      [merchantId]
    );

    if (balanceResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
    }

    const { coin_balance, current_tier } = balanceResult.rows[0];
    const balance = parseInt(coin_balance);

    if (current_tier === tier) {
      await client.query('ROLLBACK');
      return res.status(400).json({ status: 400, error: 'Bad Request', message: `Anda sudah berada di tier ${tier}` });
    }

    if (balance < cost) {
      await client.query('ROLLBACK');
      return res.status(402).json({
        status: 402,
        error: 'Payment Required',
        message: `Saldo koin tidak mencukupi. Butuh Rp${cost.toLocaleString('id-ID')}, saldo saat ini Rp${balance.toLocaleString('id-ID')}`,
      });
    }

    // Deduct and activate (atomic with FOR UPDATE lock held)
    await client.query(
      `UPDATE merchants SET
         coin_balance = coin_balance - $1,
         current_tier = $2
       WHERE id = $3`,
      [cost, tier, merchantId]
    );

    await client.query('COMMIT');

    const newBalance = balance - cost;

    res.json({
      success: true,
      message: `Tier ${tier === 'pro' ? 'Pro' : 'Standard'} berhasil diaktifkan!`,
      new_balance: newBalance,
      current_tier: tier,
      tier_expires_in: '24 jam',
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Tier activation error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  } finally {
    client.release();
  }
});

// POST /merchant/tier/downgrade — return to free tier
router.post('/tier/downgrade', async (req, res) => {
  try {
    const merchantId = req.user.id;

    await pool.query(
      `UPDATE merchants SET current_tier = 'free' WHERE id = $1`,
      [merchantId]
    );

    res.json({ success: true, message: 'Kembali ke tier Gratis', current_tier: 'free' });
  } catch (err) {
    console.error('Tier downgrade error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /merchant/upload — upload menu spanduk (compressed WebP)
// Validates magic bytes (panduan §16, Rule 4: magic bytes + MIME + extension)
router.post('/upload', upload.single('spanduk'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'File tidak ditemukan' });
    }

    // Validate magic bytes — don't trust client MIME header alone
    if (!validateMagicBytes(req.file.path, req.file.mimetype)) {
      // Delete rejected file
      unlinkSync(req.file.path);
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'File tidak valid. Gunakan gambar JPG, PNG, atau WebP asli.' });
    }

    const merchantId = req.user.id;
    const fileUrl = `/uploads/${req.file.filename}`;

    // Update merchant profile with new image URL
    await pool.query(
      'UPDATE merchants SET menu_spanduk_url = $1 WHERE id = $2',
      [fileUrl, merchantId]
    );

    res.json({
      success: true,
      url: fileUrl,
      message: 'Foto spanduk berhasil diunggah',
    });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// GET /merchant/suggestions — predictive route suggestions based on buyer heatmap
router.get('/suggestions', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    // Validate lat/lon range (panduan §2, Rule 4)
    const coords = validateLatLon(lat, lon);
    if (!coords.valid) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: coords.error });
    }

    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.getDay();

    // Find top 5 zones with highest buyer activity at this hour/day
    // Within 5km of merchant's current location
    const result = await pool.query(
      `SELECT
         ST_Y(location::geometry) AS lat,
         ST_X(location::geometry) AS lon,
         SUM(search_count) AS total_searches,
         ST_Distance(location, ST_MakePoint($1, $2)::geography) AS jarak_meter
       FROM buyer_search_heatmap
       WHERE hour_of_day = $3
         AND day_of_week = $4
         AND ST_DWithin(location, ST_MakePoint($1, $2)::geography, 5000)
         AND last_searched_at > NOW() - INTERVAL '30 days'
       GROUP BY location
       ORDER BY total_searches DESC
       LIMIT 5`,
      [coords.lon, coords.lat, currentHour, currentDay]
    );

    // If not enough data for current hour, expand to any hour
    let suggestions = result.rows;
    if (suggestions.length < 3) {
      const fallback = await pool.query(
        `SELECT
           ST_Y(location::geometry) AS lat,
           ST_X(location::geometry) AS lon,
           SUM(search_count) AS total_searches,
           ST_Distance(location, ST_MakePoint($1, $2)::geography) AS jarak_meter
         FROM buyer_search_heatmap
         WHERE ST_DWithin(location, ST_MakePoint($1, $2)::geography, 5000)
           AND last_searched_at > NOW() - INTERVAL '30 days'
         GROUP BY location
         ORDER BY total_searches DESC
         LIMIT 5`,
        [coords.lon, coords.lat]
      );
      suggestions = fallback.rows;
    }

    const zones = suggestions.map((r, i) => ({
      rank: i + 1,
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      total_searches: parseInt(r.total_searches),
      jarak_meter: Math.round(parseFloat(r.jarak_meter)),
      label: i === 0 ? 'Zona Terpanas 🔥' : i < 3 ? 'Zona Ramai 📈' : 'Zona Potensial 📍',
    }));

    res.json({ success: true, data: zones });
  } catch (err) {
    console.error('Suggestions error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

export default router;
