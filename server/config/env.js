import 'dotenv/config';

// ─── Startup Validation (Bug #7: fail-fast on missing/weak secrets) ───
const REQUIRED_VARS = ['JWT_SECRET', 'DATABASE_URL'];
const WEAK_SECRETS = [
  'change-me-to-random-secret-min-32-chars',
  'dev-secret-change-in-production',
  'secret',
  'password',
  'changeme',
];

const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error(`[FATAL] Missing required env vars: ${missing.join(', ')}`);
  console.error('Copy .env.example to .env and fill in real values.');
  process.exit(1);
}

if (WEAK_SECRETS.includes(process.env.JWT_SECRET)) {
  console.error('[FATAL] JWT_SECRET is using a weak/default value. Generate a strong secret (min 32 chars).');
  process.exit(1);
}

if (process.env.JWT_SECRET.length < 32) {
  console.error('[FATAL] JWT_SECRET must be at least 32 characters.');
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};
