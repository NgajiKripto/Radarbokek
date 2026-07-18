/**
 * Mock API Server — In-memory backend tanpa PostgreSQL
 * Semua endpoint return data dummy yg cukup buat UI berfungsi
 *
 * Usage: node server/mock-server.js
 * Lalu buka http://localhost:3000
 */

import express from 'express';
import cors from 'cors';
import { randomUUID, randomBytes, createHmac, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import multer from 'multer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ─── In-Memory Database ────────────────────────────────────────
const DB = {
  users: new Map(),        // id → user
  merchants: new Map(),    // id → merchant
  radarSignals: new Map(), // merchant_id → signal
  transactions: new Map(), // id → transaction
  reviews: [],
};

// Seed demo merchant (id='demo-merchant-01', email='demo@radarbokek.id', pass='demo1234')
const DEMO_USER_ID = 'demo-merchant-01';
// Bug #3: hash password properly, no plaintext storage
const DEMO_PASSWORD_HASH = bcrypt.hashSync('demo1234', 10);
DB.users.set(DEMO_USER_ID, {
  id: DEMO_USER_ID,
  email: 'demo@radarbokek.id',
  password_hash: DEMO_PASSWORD_HASH,
  role: 'merchant',
});
DB.merchants.set(DEMO_USER_ID, {
  id: DEMO_USER_ID,
  business_name: 'Bakso Keliling Mang Udin',
  category: 'Makanan',
  price_baseline: 15000,
  menu_spanduk_url: null,
  profile_photo_url: null,
  qris_tip_photo_url: null,
  qris_tip_destination: null,
  coin_balance: 50000,
  current_tier: 'free',
});
DB.radarSignals.set(DEMO_USER_ID, {
  merchant_id: DEMO_USER_ID,
  is_radar_active: false,
  remaining_free_quota: '03:00:00',
  status_gerak: 'jalan',
  last_updated_at: new Date().toISOString(),
});

// Counter for new user IDs
let nextUserId = 1;

// Mock JWT secret — sign tokens with HMAC (panduan §17)
const MOCK_JWT_SECRET = process.env.JWT_SECRET || 'mock-dev-secret-change-me';

function signMockJwt(payload) {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', MOCK_JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifyMockJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Invalid token format');
  const expected = createHmac('sha256', MOCK_JWT_SECRET).update(`${parts[0]}.${parts[1]}`).digest('base64url');
  if (expected !== parts[2]) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) throw new Error('Token expired');
  return payload;
}

// ─── Multer Setup (file upload) ────────────────────────────────
const uploadsDir = join(__dirname, '..', 'public', 'uploads');
if (!existsSync(uploadsDir)) {
  mkdirSync(uploadsDir, { recursive: true });
}
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => cb(null, `spanduk-${randomUUID()}.webp`),
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    cb(null, allowed.includes(file.mimetype));
  },
});

// ─── Express App ───────────────────────────────────────────────
const app = express();

// Security headers (panduan §29)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  res.removeHeader('X-Powered-By');
  next();
});

// CORS — whitelist origin (panduan §13: JANGAN reflect arbitrary Origin)
const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (curl, mobile apps)
    if (!origin) return callback(null, true);
    if (origin === corsOrigin || origin === 'http://localhost:5173') return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
}));
app.use(express.json({ limit: '1mb' })); // limit body size

// Serve static dist + uploads (production)
app.use(express.static(join(__dirname, '..', 'dist')));
app.use('/uploads', express.static(uploadsDir));
// Dev mode: serve src/ only when NODE_ENV=development (panduan §25: JANGAN expose source)
if (process.env.NODE_ENV !== 'production') {
  app.use('/src', express.static(join(__dirname, '..', 'src')));
  app.use('/public', express.static(join(__dirname, '..', 'public')));
}

// Primary index.html — serve root-level (dev version with ESM imports)
app.get('/', (req, res, next) => {
  res.sendFile(join(__dirname, '..', 'index.html'));
});

// ─── Minimal CSP (longgar buat dev) ────────────────────────────
// Skip helmet, allow all for mock dev

// ─── Rate Limiting (panduan §15: brute force protection) ───────
const rateBuckets = new Map();
function rateLimit(windowMs, max) {
  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const bucket = rateBuckets.get(key);
    if (!bucket || now > bucket.resetAt) {
      rateBuckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }
    if (bucket.count >= max) {
      return res.status(429).json({ status: 429, error: 'Too Many Requests', message: 'Terlalu banyak permintaan, coba lagi nanti' });
    }
    bucket.count++;
    next();
  };
}
const registerLimiter = rateLimit(15 * 60 * 1000, 5);
const loginLimiter = rateLimit(15 * 60 * 1000, 10);

// ═══════════════════════════════════════════════════════════════
// AUTH ROUTES
// ═══════════════════════════════════════════════════════════════

// POST /api/v1/auth/register
app.post('/api/v1/auth/register', registerLimiter, async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Email, password, dan role wajib diisi' });
  }
  if (!['buyer', 'merchant'].includes(role)) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Role harus buyer atau merchant' });
  }
  if (password.length < 8) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Password minimal 8 karakter' });
  }

  // Check existing — generic error (panduan §26: hindari user enumeration)
  for (const user of DB.users.values()) {
    if (user.email === email) {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Registrasi gagal. Coba email lain.' });
    }
  }

  const id = `user-${nextUserId++}`;
  const passwordHash = bcrypt.hashSync(password, 10);
  DB.users.set(id, { id, email, password_hash: passwordHash, role });

  if (role === 'merchant') {
    DB.merchants.set(id, {
      id,
      business_name: 'Warung Baru',
      category: 'Makanan',
      price_baseline: 0,
      menu_spanduk_url: null,
      profile_photo_url: null,
      qris_tip_photo_url: null,
      qris_tip_destination: null,
      coin_balance: 0,
      current_tier: 'free',
    });
    DB.radarSignals.set(id, {
      merchant_id: id,
      is_radar_active: false,
      remaining_free_quota: '03:00:00',
      status_gerak: 'jalan',
      last_updated_at: new Date().toISOString(),
    });
  }

  console.log(`[mock] Registered: ${email} (${role}) → ${id}`);
  res.status(201).json({ success: true, message: 'Registrasi berhasil', user_id: id });
});

// POST /api/v1/auth/login
app.post('/api/v1/auth/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Email dan password wajib diisi' });
  }

  // Find user by email
  let found = null;
  for (const user of DB.users.values()) {
    if (user.email === email) {
      found = user;
      break;
    }
  }

  if (!found || !found.password_hash) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Email atau password salah' });
  }

  const passwordValid = await bcrypt.compare(password, found.password_hash);
  if (!passwordValid) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Email atau password salah' });
  }

  // Sign JWT with HMAC (panduan §17: enforce algorithm)
  const token = signMockJwt({
    id: found.id,
    email: found.email,
    role: found.role,
    exp: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
  });

  console.log(`[mock] Login: ${email} (${found.role})`);
  res.json({ success: true, token, role: found.role });
});

// ═══════════════════════════════════════════════════════════════
// AUTH MIDDLEWARE (mock — decode base64 JWT)
// ═══════════════════════════════════════════════════════════════
function mockAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Token tidak ditemukan' });
  }
  const token = authHeader.slice(7);
  try {
    req.user = verifyMockJwt(token);
    next();
  } catch (err) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: `Token tidak valid: ${err.message}` });
  }
}

// ═══════════════════════════════════════════════════════════════
// MERCHANT ROUTES
// ═══════════════════════════════════════════════════════════════
const merchantRouter = express.Router();
merchantRouter.use(mockAuth);

// GET /merchant/dashboard
merchantRouter.get('/dashboard', (req, res) => {
  const merchantId = req.user.id;
  const merchant = DB.merchants.get(merchantId);
  const signal = DB.radarSignals.get(merchantId);

  if (!merchant) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
  }

  res.json({
    success: true,
    data: {
      coin_balance: merchant.coin_balance,
      current_tier: merchant.current_tier,
      is_radar_active: signal?.is_radar_active || false,
      remaining_free_quota_seconds: 10800,
      status_gerak: signal?.status_gerak || 'jalan',
      last_updated_at: signal?.last_updated_at || new Date().toISOString(),
    },
  });
});

// Bug #6: server-side quota enforcement (not just client timer)
function parseQuotaSeconds(quotaStr) {
  const parts = quotaStr.split(':');
  return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
}

function formatQuota(totalSeconds) {
  const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(totalSeconds % 60).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

// Bug #4: deduct quota and write back to DB
const PING_INTERVAL_S = 10; // matches LOCATION_THROTTLE_MS

// POST /merchant/radar/ping
merchantRouter.post('/radar/ping', (req, res) => {
  const { latitude, longitude, status_gerak, speed_kmh } = req.body;
  const merchantId = req.user.id;

  if (!DB.radarSignals.has(merchantId)) {
    DB.radarSignals.set(merchantId, {
      merchant_id: merchantId,
      is_radar_active: false,
      remaining_free_quota: '03:00:00',
      status_gerak: 'jalan',
      last_updated_at: new Date().toISOString(),
    });
  }

  const sig = DB.radarSignals.get(merchantId);
  const merchant = DB.merchants.get(merchantId);
  const hasPaidTier = merchant && ['standard', 'pro'].includes(merchant.current_tier);

  // Bug #6: enforce quota server-side for free tier
  if (!hasPaidTier) {
    const remaining = parseQuotaSeconds(sig.remaining_free_quota);
    if (remaining <= 0) {
      sig.is_radar_active = false;
      return res.json({
        success: false,
        error: 'QUOTA_EXHAUSTED',
        message: 'Kuota gratis habis. Upgrade tier untuk melanjutkan.',
        is_radar_active: false,
        remaining_free_quota: '00:00:00',
        coin_balance: merchant?.coin_balance || 0,
      });
    }
    // Bug #4: decrement and write back
    const newRemaining = Math.max(0, remaining - PING_INTERVAL_S);
    sig.remaining_free_quota = formatQuota(newRemaining);
  }

  sig.status_gerak = status_gerak || 'jalan';
  sig.last_updated_at = new Date().toISOString();

  res.json({
    success: true,
    is_radar_active: sig.is_radar_active,
    remaining_free_quota: sig.remaining_free_quota,
    coin_balance: merchant?.coin_balance || 0,
  });
});

// PUT /merchant/radar/toggle
merchantRouter.put('/radar/toggle', (req, res) => {
  const { is_radar_active } = req.body;
  const merchantId = req.user.id;

  let sig = DB.radarSignals.get(merchantId);
  if (!sig) {
    sig = {
      merchant_id: merchantId,
      is_radar_active: false,
      remaining_free_quota: '03:00:00',
      status_gerak: 'jalan',
      last_updated_at: new Date().toISOString(),
    };
    DB.radarSignals.set(merchantId, sig);
  }

  sig.is_radar_active = !!is_radar_active;
  sig.last_updated_at = new Date().toISOString();

  console.log(`[mock] Radar toggle: ${is_radar_active ? 'ON' : 'OFF'} (merchant=${merchantId})`);
  res.json({
    success: true,
    is_radar_active: !!is_radar_active,
    message: is_radar_active ? 'Radar diaktifkan' : 'Radar dinonaktifkan',
  });
});

// GET /merchant/profile — baca profile yg sudah ada
merchantRouter.get('/profile', (req, res) => {
  const merchant = DB.merchants.get(req.user.id);
  if (!merchant) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
  }
  res.json({
    success: true,
    data: {
      business_name: merchant.business_name,
      category: merchant.category,
      price_baseline: merchant.price_baseline,
      menu_spanduk_url: merchant.menu_spanduk_url,
      profile_photo_url: merchant.profile_photo_url,
      qris_tip_photo_url: merchant.qris_tip_photo_url,
      qris_tip_destination: merchant.qris_tip_destination,
      coin_balance: merchant.coin_balance,
      current_tier: merchant.current_tier,
    },
  });
});

// PUT /merchant/profile
merchantRouter.put('/profile', (req, res) => {
  const merchantId = req.user.id;
  const { business_name, category, price_baseline, menu_spanduk_url, profile_photo_url, qris_tip_photo_url, qris_tip_destination } = req.body;

  const merchant = DB.merchants.get(merchantId);
  if (!merchant) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
  }

  if (!business_name || business_name.length < 3 || business_name.length > 40) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Nama dagangan 3-40 karakter' });
  }

  if (category && !['Makanan', 'Minuman'].includes(category)) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Kategori harus Makanan atau Minuman' });
  }

  merchant.business_name = business_name;
  merchant.category = category || merchant.category;
  merchant.price_baseline = price_baseline != null ? Number(price_baseline) : merchant.price_baseline;
  if (menu_spanduk_url) merchant.menu_spanduk_url = menu_spanduk_url;
  if (profile_photo_url) merchant.profile_photo_url = profile_photo_url;
  if (qris_tip_photo_url) merchant.qris_tip_photo_url = qris_tip_photo_url;
  if (qris_tip_destination !== undefined) merchant.qris_tip_destination = qris_tip_destination;

  console.log(`[mock] Profile updated: ${business_name} (merchant=${merchantId})`);
  res.json({ success: true, message: 'Profil berhasil diperbarui' });
});

// POST /merchant/tier/activate
merchantRouter.post('/tier/activate', (req, res) => {
  const { tier } = req.body;
  const merchantId = req.user.id;

  if (!tier || !['standard', 'pro'].includes(tier)) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Tier harus standard atau pro' });
  }

  const merchant = DB.merchants.get(merchantId);
  if (!merchant) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: 'Pedagang tidak ditemukan' });
  }

  const cost = tier === 'pro' ? 2500 : 1500;

  if (merchant.current_tier === tier) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: `Anda sudah berada di tier ${tier}` });
  }

  if (merchant.coin_balance < cost) {
    return res.status(402).json({
      status: 402,
      error: 'Payment Required',
      message: `Saldo koin tidak mencukupi. Butuh Rp${cost.toLocaleString('id-ID')}, saldo saat ini Rp${merchant.coin_balance.toLocaleString('id-ID')}`,
    });
  }

  merchant.coin_balance -= cost;
  merchant.current_tier = tier;

  console.log(`[mock] Tier activated: ${tier} (merchant=${merchantId}, balance=${merchant.coin_balance})`);
  res.json({
    success: true,
    message: `Tier ${tier === 'pro' ? 'Pro' : 'Standard'} berhasil diaktifkan!`,
    new_balance: merchant.coin_balance,
    current_tier: tier,
    tier_expires_in: '24 jam',
  });
});

// POST /merchant/tier/downgrade
merchantRouter.post('/tier/downgrade', (req, res) => {
  const merchantId = req.user.id;
  const merchant = DB.merchants.get(merchantId);
  if (merchant) {
    merchant.current_tier = 'free';
  }
  console.log(`[mock] Tier downgraded to free (merchant=${merchantId})`);
  res.json({ success: true, message: 'Kembali ke tier Gratis', current_tier: 'free' });
});

// Magic bytes validation (panduan §16: jangan trust Content-Type header)
const MAGIC_BYTES = {
  'image/jpeg': [[0xFF, 0xD8, 0xFF]],
  'image/png': [[0x89, 0x50, 0x4E, 0x47]],
  'image/webp': [[0x52, 0x49, 0x46, 0x46]], // RIFF
};
function validateMagicBytes(filePath, claimedMime) {
  const signatures = MAGIC_BYTES[claimedMime];
  if (!signatures) return false;
  try {
    const buffer = readFileSync(filePath, { flag: 'r' });
    if (buffer.length < 4) return false;
    return signatures.some((sig) => sig.every((byte, i) => buffer[i] === byte));
  } catch { return false; }
}

function handleUpload(req, res, field, updateFn) {
  if (!req.file) return res.status(400).json({ status: 400, error: 'Bad Request', message: 'File tidak ditemukan' });
  // Validate magic bytes — don't trust client MIME (panduan §16, Rule 2)
  if (!validateMagicBytes(req.file.path, req.file.mimetype)) {
    unlinkSync(req.file.path);
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'File tidak valid. Gunakan gambar asli.' });
  }
  const fileUrl = `/uploads/${req.file.filename}`;
  const merchant = DB.merchants.get(req.user.id);
  if (merchant) updateFn(merchant, fileUrl);
  res.json({ success: true, url: fileUrl, message: 'Foto berhasil diunggah' });
}

// POST /merchant/upload/avatar — foto profil
merchantRouter.post('/upload/avatar', upload.single('photo'), (req, res) => {
  handleUpload(req, res, 'photo', (m, url) => { m.profile_photo_url = url; });
});

// POST /merchant/upload/qris — foto QRIS tip
merchantRouter.post('/upload/qris', upload.single('photo'), (req, res) => {
  handleUpload(req, res, 'photo', (m, url) => { m.qris_tip_photo_url = url; });
});

// POST /merchant/upload — spanduk menu upload
merchantRouter.post('/upload', upload.single('spanduk'), (req, res) => {
  handleUpload(req, res, 'spanduk', (m, url) => { m.menu_spanduk_url = url; });
});

// GET /merchant/suggestions
merchantRouter.get('/suggestions', (req, res) => {
  const { lat, lon } = req.query;
  const baseLat = parseFloat(lat) || -6.2;
  const baseLon = parseFloat(lon) || 106.816;

  res.json({
    success: true,
    data: [
      { rank: 1, lat: baseLat + 0.002, lon: baseLon + 0.003, total_searches: 245, jarak_meter: 380, label: 'Zona Terpanas 🔥' },
      { rank: 2, lat: baseLat - 0.001, lon: baseLon + 0.001, total_searches: 178, jarak_meter: 520, label: 'Zona Ramai 📈' },
      { rank: 3, lat: baseLat + 0.003, lon: baseLon - 0.002, total_searches: 112, jarak_meter: 650, label: 'Zona Ramai 📈' },
      { rank: 4, lat: baseLat - 0.002, lon: baseLon - 0.001, total_searches: 87, jarak_meter: 890, label: 'Zona Potensial 📍' },
      { rank: 5, lat: baseLat + 0.001, lon: baseLon - 0.003, total_searches: 54, jarak_meter: 1200, label: 'Zona Potensial 📍' },
    ],
  });
});

// ═══════════════════════════════════════════════════════════════
// WALLET / TOP-UP ROUTES
// ═══════════════════════════════════════════════════════════════
app.post('/api/v1/merchant/wallet/topup', mockAuth, (req, res) => {
  const { amount_rupiah } = req.body;
  if (!amount_rupiah || amount_rupiah < 10000) {
    return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Minimal Rp10.000' });
  }

  const txId = `TX-${randomUUID().slice(0, 8)}`;
  DB.transactions.set(txId, {
    transaction_id: txId,
    merchant_id: req.user.id,
    amount_rupiah,
    status: 'pending',
    qris_string: `https://mock-qris.radarbokek.id/pay/${txId}`,
    created_at: new Date().toISOString(),
  });

  console.log(`[mock] Topup request: Rp${amount_rupiah.toLocaleString('id-ID')} → ${txId}`);
  res.json({
    success: true,
    transaction_id: txId,
    qris_string: `https://mock-qris.radarbokek.id/pay/${txId}`,
    amount_rupiah,
    message: 'Silakan pindai QRIS untuk menyelesaikan pembayaran',
  });
});

// ═══════════════════════════════════════════════════════════════
// WEBHOOK — simulate payment (Bug #2: require signature)
// ═══════════════════════════════════════════════════════════════
const MOCK_WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'mock-webhook-secret';

function verifyWebhookSignature(body, signature) {
  if (!signature) return false;
  const expected = createHmac('sha256', MOCK_WEBHOOK_SECRET)
    .update(JSON.stringify(body))
    .digest('hex');
  try {
    return timingSafeEqual(Buffer.from(expected, 'hex'), Buffer.from(signature, 'hex'));
  } catch { return false; }
}

app.post('/api/v1/webhooks/payment/qris-callback', (req, res) => {
  const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];
  if (!verifyWebhookSignature(req.body, signature)) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Invalid webhook signature' });
  }
  const { transaction_id, status } = req.body;
  const tx = DB.transactions.get(transaction_id);

  if (!tx) {
    return res.status(404).json({ status: 404, error: 'Not Found', message: 'Transaksi tidak ditemukan' });
  }

  if (status === 'success') {
    tx.status = 'success';
    const merchant = DB.merchants.get(tx.merchant_id);
    if (merchant) {
      const coins = Math.floor(tx.amount_rupiah / 1000);
      merchant.coin_balance += coins;
      console.log(`[mock] Payment success: +${coins} coins (merchant=${tx.merchant_id}, balance=${merchant.coin_balance})`);
    }
  }

  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════
// BUYER ROUTES
// ═══════════════════════════════════════════════════════════════

// GET /api/v1/buyer/radar — nearby vendors
app.get('/api/v1/buyer/radar', (req, res) => {
  const { lat, lon } = req.query;
  const baseLat = parseFloat(lat) || -6.2;
  const baseLon = parseFloat(lon) || 106.816;

  const vendors = [];
  // Return all active merchants as demo vendors
  for (const [id, merchant] of DB.merchants) {
    const sig = DB.radarSignals.get(id);
    vendors.push({
      id,
      name: merchant.business_name,
      category: merchant.category,
      price_baseline: merchant.price_baseline,
      distance_meter: Math.floor(Math.random() * 1800) + 100,
      current_tier: merchant.current_tier,
      latitude: baseLat + (Math.random() - 0.5) * 0.01,
      longitude: baseLon + (Math.random() - 0.5) * 0.01,
      status_gerak: sig?.status_gerak || 'jalan',
      rating: 4.5 + Math.random() * 0.5,
      review_count: Math.floor(Math.random() * 100) + 5,
      payment_tags: ['qris', 'tunai'],
    });
  }

  res.json({ success: true, data: vendors });
});

// POST /api/v1/buyer/search-event — anonymous search tracking (fire-and-forget)
app.post('/api/v1/buyer/search-event', (req, res) => {
  res.json({ success: true });
});

// ═══════════════════════════════════════════════════════════════
// SSE (mock — tidak real-time, tapi nggak bikin error)
// ═══════════════════════════════════════════════════════════════
app.get('/api/v1/events/radar', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  });
  // Kirim satu event awal, lalu keep alive tanpa data
  res.write(`data: ${JSON.stringify({ type: 'connected', message: 'Mock SSE connected' })}\n\n`);
  const keepAlive = setInterval(() => res.write(':keepalive\n\n'), 15000);
  req.on('close', () => clearInterval(keepAlive));
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', mode: 'mock', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════
// MOUNT MERCHANT ROUTES
// ═══════════════════════════════════════════════════════════════
app.use('/api/v1/merchant', merchantRouter);

// ═══════════════════════════════════════════════════════════════
// SIMULATE PAYMENT (helper endpoint buat testing)
// ═══════════════════════════════════════════════════════════════
app.post('/api/v1/mock/pay/:txId', (req, res) => {
  const tx = DB.transactions.get(req.params.txId);
  if (!tx) return res.status(404).json({ error: 'Not found' });

  tx.status = 'success';
  const merchant = DB.merchants.get(tx.merchant_id);
  if (merchant) {
    const coins = Math.floor(tx.amount_rupiah / 1000);
    merchant.coin_balance += coins;
  }

  res.json({ success: true, message: `Pembayaran berhasil! ${Math.floor(tx.amount_rupiah / 1000)} koin ditambahkan.` });
});

// ═══════════════════════════════════════════════════════════════
// SPA FALLBACK (Express 5 — use app.all with regex or manual check)
// ═══════════════════════════════════════════════════════════════
app.use((req, res, next) => {
  // Only handle non-API, non-static requests
  if (req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) return next();
  // If it looks like a static file request, pass through
  if (req.path.includes('.')) return next();
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// START
// ═══════════════════════════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║   🛰️  RADAR BOKEK — Mock Server             ║');
  console.log(`║   http://localhost:${PORT}                      ║`);
  console.log('║                                              ║');
  console.log('║   Demo Account:                              ║');
  console.log('║   Email : demo@radarbokek.id                 ║');
  console.log('║   Pass  : demo1234                           ║');
  console.log('║                                              ║');
  console.log('║   All API routes return mock data.           ║');
  console.log('║   No PostgreSQL needed.                      ║');
  console.log('╚══════════════════════════════════════════════╝');
  console.log('');
});
