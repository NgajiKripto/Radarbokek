import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { pool } from './pool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function migrate() {
  const client = await pool.connect();
  try {
    const sql = await readFile(join(__dirname, 'migrations', '001_init.sql'), 'utf-8');
    await client.query(sql);
    console.log('Migration complete');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

migrate();
