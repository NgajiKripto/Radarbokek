import { pool } from '../db/pool.js';
import { FREE_QUOTA_SECONDS, STANDARD_COST_PER_DAY, PRO_COST_PER_DAY } from '../../src/config/constants.js';

/**
 * Reset daily free quota for all merchants
 * Run once per day (e.g., at midnight via cron)
 */
export async function resetDailyQuota() {
  try {
    await pool.query(
      `UPDATE merchant_radar_signals SET remaining_free_quota = '03:00:00'`
    );
    console.log('Daily quota reset complete');
  } catch (err) {
    console.error('Quota reset error:', err);
  }
}

/**
 * Deduct free quota when merchant pings (Bug #4 + #6: server-side enforcement)
 * @returns {{ allowed: boolean, remaining_seconds: number }}
 */
export async function deductFreeQuota(merchantId, durationSeconds = 10) {
  try {
    const result = await pool.query(
      `UPDATE merchant_radar_signals
       SET remaining_free_quota = GREATEST(remaining_free_quota - $1::interval, '00:00:00')::time
       WHERE merchant_id = $2
       RETURNING remaining_free_quota`,
      [`${durationSeconds} seconds`, merchantId]
    );

    if (result.rows.length === 0) {
      return { allowed: false, remaining_seconds: 0 };
    }

    const remaining = result.rows[0].remaining_free_quota;
    const parts = remaining.split(':');
    const remainingSeconds = parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);

    return { allowed: remainingSeconds > 0, remaining_seconds: remainingSeconds };
  } catch (err) {
    console.error('Quota deduction error:', err);
    return { allowed: false, remaining_seconds: 0 };
  }
}

/**
 * Check if merchant has paid tier (unlimited quota)
 */
export async function hasPaidTier(merchantId) {
  try {
    const result = await pool.query(
      `SELECT current_tier FROM merchants WHERE id = $1`,
      [merchantId]
    );
    if (result.rows.length === 0) return false;
    return ['standard', 'pro'].includes(result.rows[0].current_tier);
  } catch (err) {
    console.error('Tier check error:', err);
    return false;
  }
}

/**
 * Deduct coin balance for tier activation
 */
export async function activateTier(merchantId, tier) {
  const cost = tier === 'pro' ? PRO_COST_PER_DAY : tier === 'standard' ? STANDARD_COST_PER_DAY : 0;

  if (cost === 0) return true; // Free tier

  try {
    const result = await pool.query(
      `UPDATE merchants SET
        coin_balance = coin_balance - $1,
        current_tier = $2
       WHERE id = $3 AND coin_balance >= $1
       RETURNING coin_balance`,
      [cost, tier, merchantId]
    );

    if (result.rows.length === 0) {
      return false; // Insufficient balance
    }

    return true;
  } catch (err) {
    console.error('Tier activation error:', err);
    return false;
  }
}
