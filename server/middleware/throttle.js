/**
 * Per-user rate limiter (in-memory, token bucket)
 */
const buckets = new Map();

/**
 * Create throttle middleware
 * @param {number} windowMs - Time window in milliseconds
 * @param {number} max - Max requests per window
 */
export function throttle(windowMs, max) {
  return (req, res, next) => {
    const key = req.user?.id || req.ip;
    const now = Date.now();

    if (!buckets.has(key)) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    const bucket = buckets.get(key);

    if (now > bucket.resetAt) {
      bucket.count = 1;
      bucket.resetAt = now + windowMs;
      return next();
    }

    if (bucket.count >= max) {
      return res.status(429).json({
        status: 429,
        error: 'Too Many Requests',
        message: 'Terlalu banyak permintaan, coba lagi nanti',
      });
    }

    bucket.count++;
    next();
  };
}

/**
 * Merchant ping throttle — 10 seconds between pings
 */
export const pingThrottle = throttle(10000, 1);

/**
 * Review rate limit — 1 per 2 hours
 */
export const reviewThrottle = throttle(7200000, 1);
