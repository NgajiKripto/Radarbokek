import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

/**
 * JWT authentication middleware
 */
export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Token diperlukan' });
  }

  try {
    const decoded = jwt.verify(token, config.jwtSecret, {
      algorithms: ['HS256'],
    });
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ status: 403, error: 'Forbidden', message: 'Token tidak valid' });
  }
}

/**
 * Optional auth — doesn't block, just attaches user if present
 */
export function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    try {
      req.user = jwt.verify(token, config.jwtSecret, { algorithms: ['HS256'] });
    } catch {
      // Token invalid — continue without user
    }
  }
  next();
}
