import { Router } from 'express';
import { createHmac } from 'crypto';
import { pool } from '../db/pool.js';

const router = Router();

// Webhook signature verification (Bug #2: prevent unauthenticated coin credit)
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
  console.warn('[WARN] WEBHOOK_SECRET not set — webhook signature verification disabled!');
}

function verifyWebhookSignature(payload, signature) {
  if (!WEBHOOK_SECRET) return true; // Allow in dev if no secret configured
  if (!signature) return false;
  const expected = createHmac('sha256', WEBHOOK_SECRET)
    .update(typeof payload === 'string' ? payload : JSON.stringify(payload))
    .digest('hex');
  // Constant-time comparison
  if (expected.length !== signature.length) return false;
  let result = 0;
  for (let i = 0; i < expected.length; i++) {
    result |= expected.charCodeAt(i) ^ signature.charCodeAt(i);
  }
  return result === 0;
}

// POST /webhooks/payment/qris-callback — payment confirmation from gateway
router.post('/payment/qris-callback', async (req, res) => {
  try {
    // Verify webhook signature (Bug #2)
    const signature = req.headers['x-signature'] || req.headers['x-webhook-signature'];
    if (!verifyWebhookSignature(req.body, signature)) {
      console.warn('[SECURITY] Webhook signature mismatch — rejected');
      return res.status(401).json({ status: 'INVALID_SIGNATURE' });
    }

    const { transaction_id, status, amount_received } = req.body;

    if (!transaction_id) {
      return res.status(400).json({ status: 'INVALID_PAYLOAD' });
    }

    if (status !== 'PAID') {
      return res.json({ status: 'IGNORED' });
    }

    // Look up pending transaction
    const txResult = await pool.query(
      `SELECT id, merchant_id, amount_rupiah, status
       FROM payment_transactions
       WHERE transaction_id = $1 AND status = 'PENDING'
       LIMIT 1`,
      [transaction_id]
    );

    if (txResult.rows.length === 0) {
      return res.status(404).json({ status: 'NOT_FOUND', message: 'Transaksi tidak ditemukan atau sudah diproses' });
    }

    const tx = txResult.rows[0];
    const coinAmount = Math.floor(parseInt(tx.amount_rupiah) / 1000); // Rp1.000 = 1 koin

    // Update transaction status
    await pool.query(
      `UPDATE payment_transactions
       SET status = 'PAID', completed_at = NOW()
       WHERE id = $1`,
      [tx.id]
    );

    // Credit coin_balance to merchant
    await pool.query(
      `UPDATE merchants
       SET coin_balance = coin_balance + $1
       WHERE id = $2`,
      [coinAmount, tx.merchant_id]
    );

    console.log(`Payment confirmed: ${transaction_id}, merchant: ${tx.merchant_id}, amount: ${tx.amount_rupiah}, coins: ${coinAmount}`);

    res.json({ status: 'COMPLETED', coins_credited: coinAmount });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ status: 'ERROR' });
  }
});

export default router;
