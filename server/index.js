import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import authRoutes from './routes/auth.js';
import buyerRoutes from './routes/buyer.js';
import merchantRoutes from './routes/merchant.js';
import walletRoutes from './routes/wallet.js';
import webhookRoutes from './routes/webhook.js';
import sseRoutes from './routes/sse.js';
import { csrfProtection } from './middleware/csrf.js';
import { startHeartbeatMonitor } from './services/heartbeat-monitor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"], // No 'unsafe-inline' — semua script external (panduan §4)
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"], // Tailwind perlu unsafe-inline
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://*.basemaps.cartocdn.com", "https://api.qrserver.com"],
      connectSrc: ["'self'", "https://*.basemaps.cartocdn.com"],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin' },
  crossOriginResourcePolicy: { policy: 'same-origin' },
}));

// Additional headers (panduan §29)
app.use((req, res, next) => {
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Permissions-Policy', 'geolocation=(self), camera=(), microphone=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// CORS origin: prioritaskan env, fallback ke localhost untuk development
const corsOrigin = process.env.CORS_ORIGIN || process.env.PROD_ORIGIN || 'http://localhost:5173';
app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// CSRF protection for state-changing requests (panduan §12)
app.use(csrfProtection);

// Serve static files in production
app.use(express.static(join(__dirname, '..', 'dist')));

// Serve uploaded files (multer saves to public/uploads, panduan §16)
app.use('/uploads', express.static(join(__dirname, '..', 'public', 'uploads')));

// API routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/buyer', buyerRoutes);
app.use('/api/v1/merchant', merchantRoutes);
app.use('/api/v1/merchant/wallet', walletRoutes);
app.use('/api/v1/webhooks', webhookRoutes);
app.use('/api/v1/events', sseRoutes);

// Health check
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// SPA fallback — serve index.html for all other routes
app.get('{*splat}', (req, res) => {
  res.sendFile(join(__dirname, '..', 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Radar Bokek server running on port ${PORT}`);
  startHeartbeatMonitor();
});
