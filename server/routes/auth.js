import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db/pool.js';
import { config } from '../config/env.js';
import { sanitizeBody } from '../middleware/sanitize.js';
import { throttle } from '../middleware/throttle.js';

const router = Router();

// Rate limits for auth endpoints (panduan §17, Rule 5)
const registerThrottle = throttle(15 * 60 * 1000, 5);  // 5 register per 15 min
const loginThrottle = throttle(15 * 60 * 1000, 10);     // 10 login per 15 min

// POST /auth/register
router.post('/register', sanitizeBody, registerThrottle, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validation
    if (!email || !password || !role) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Email, password, dan role wajib diisi' });
    }
    if (!['buyer', 'merchant'].includes(role)) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Role harus buyer atau merchant' });
    }
    if (password.length < 8) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Password minimal 8 karakter' });
    }

    // Check existing user
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ status: 409, error: 'Conflict', message: 'Email sudah terdaftar' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id',
      [email, passwordHash, role]
    );

    const userId = result.rows[0].id;

    // If merchant, create merchant profile
    if (role === 'merchant') {
      await pool.query(
        'INSERT INTO merchants (id, business_name, category) VALUES ($1, $2, $3)',
        [userId, 'Warung Baru', 'Bakso/Mie']
      );
      await pool.query(
        'INSERT INTO merchant_radar_signals (merchant_id) VALUES ($1)',
        [userId]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      user_id: userId,
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

// POST /auth/login
router.post('/login', sanitizeBody, loginThrottle, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 400, error: 'Bad Request', message: 'Email dan password wajib diisi' });
    }

    // Find user
    const result = await pool.query('SELECT id, password_hash, role FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Email atau password salah' });
    }

    const user = result.rows[0];

    // Verify password
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ status: 401, error: 'Unauthorized', message: 'Email atau password salah' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email, role: user.role },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn, algorithm: 'HS256' }
    );

    res.json({
      success: true,
      token,
      role: user.role,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

export default router;
