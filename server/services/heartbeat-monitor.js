import { pool } from '../db/pool.js';

/**
 * Heartbeat monitor — auto-hide merchants after 15min no ping
 * Run periodically (e.g., every 5 minutes via setInterval or cron)
 */
export async function checkHeartbeats() {
  try {
    const result = await pool.query(
      `UPDATE merchant_radar_signals
       SET is_radar_active = FALSE
       WHERE is_radar_active = TRUE
         AND last_updated_at < NOW() - INTERVAL '15 minutes'
       RETURNING merchant_id`
    );

    if (result.rows.length > 0) {
      console.log(`Auto-hidden ${result.rows.length} inactive merchants`);
    }

    return result.rows.length;
  } catch (err) {
    console.error('Heartbeat check error:', err);
    return 0;
  }
}

/**
 * Start periodic heartbeat check (every 5 minutes)
 */
export function startHeartbeatMonitor() {
  setInterval(checkHeartbeats, 5 * 60 * 1000);
  console.log('Heartbeat monitor started (5min interval)');
}
