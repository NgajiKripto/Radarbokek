/**
 * CSRF protection middleware (panduan §12)
 * 
 * Since we use JWT Bearer tokens in Authorization header (not cookies),
 * CSRF is inherently mitigated — browsers don't auto-attach Authorization headers.
 * This middleware adds Origin/Referer validation as defense-in-depth.
 */
export function csrfProtection(req, res, next) {
  // Only check state-changing methods
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  const origin = req.headers.origin || req.headers.referer;

  // If no origin header and no referer, allow (non-browser clients, mobile apps, etc.)
  if (!origin) {
    return next();
  }

  const allowedOrigin = process.env.CORS_ORIGIN || process.env.PROD_ORIGIN || 'http://localhost:5173';

  // Check origin matches
  if (origin.startsWith(allowedOrigin)) {
    return next();
  }

  // For API calls from same origin (no Origin header in same-origin requests)
  if (!req.headers.origin && req.headers.referer) {
    try {
      const refererUrl = new URL(req.headers.referer);
      const allowedUrl = new URL(allowedOrigin);
      if (refererUrl.host === allowedUrl.host) {
        return next();
      }
    } catch {}
  }

  return res.status(403).json({
    status: 403,
    error: 'Forbidden',
    message: 'Cross-origin request ditolak',
  });
}
