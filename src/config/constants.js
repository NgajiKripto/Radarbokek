// API
export const API_BASE = '/api/v1';

// Geolocation
export const BUYER_RADIUS_M = 2000;       // 2km default search radius
export const LOCATION_DELTA_M = 15;        // minimum distance to trigger ping
export const LOCATION_THROTTLE_MS = 10000; // 10s minimum between pings
export const HEARTBEAT_TIMEOUT_MS = 900000; // 15min auto-hide

// Battery saver mode
export const BATTERY_SAVER_DELTA_M = 40;       // relaxed distance threshold
export const BATTERY_SAVER_THROTTLE_MS = 45000; // 45s between pings
export const BATTERY_SAVER_MAX_AGE_MS = 30000;  // accept older GPS readings

// Quota
export const FREE_QUOTA_SECONDS = 10800;   // 3 hours
export const STANDARD_COST_PER_DAY = 1500; // Rp1.500
export const PRO_COST_PER_DAY = 2500;      // Rp2.500

// Tier
export const TIERS = {
  FREE: 'free',
  STANDARD: 'standard',
  PRO: 'pro',
};

// Movement status
export const MOVEMENT = {
  JALAN: 'jalan',
  MANGKAL: 'mangkal',
  MELAJU_CEPAT: 'melaju_cepat',
};

// Velocity threshold
export const SPEED_ALERT_KMH = 20;

// Review rate limit
export const REVIEW_RATE_LIMIT_MS = 7200000; // 2 hours

// Top-up
export const TOPUP_MIN_RUPIAH = 10000;
