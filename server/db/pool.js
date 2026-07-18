import pg from 'pg';
import { config } from '../config/env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: config.databaseUrl,
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});
