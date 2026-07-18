import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../db/pool.js';
import { authenticateToken } from '../middleware/auth.js';
import { TOPUP_MIN_RUPIAH } from '../../src/config/constants.js';

const router = Router();

router.use(authenticateToken);

// POST /merchant/wallet/topup — request QRIS top-up
router.post('/topup', async (req, res) => {
  try {
    const { amount_rupiah } = req.body;
    const merchantId = req.user.id;

    if (!amount_rupiah || amount_rupiah < TOPUP_MIN_RUPIAH) {
      return res.status(400).json({
        status: 400,
        error: 'Bad Request',
        message: `Minimum top-up Rp${TOPUP_MIN_RUPIAH.toLocaleString('id-ID')}`,
      });
    }

    const transactionId = `tx-${uuidv4().slice(0, 8)}`;

    // Save pending transaction to DB for webhook processing
    await pool.query(
      `INSERT INTO payment_transactions (merchant_id, amount_rupiah, transaction_id, status)
       VALUES ($1, $2, $3, 'PENDING')`,
      [merchantId, amount_rupiah, transactionId]
    );

    // In production: generate actual QRIS string from payment gateway
    const qrisString = `00020101021226640014org.radarbokek${transactionId}`;

    res.json({
      success: true,
      transaction_id: transactionId,
      qris_string: qrisString,
      message: `Silakan pindai QRIS untuk mengisi saldo koin (Min. Rp${TOPUP_MIN_RUPIAH.toLocaleString('id-ID')}).`,
    });
  } catch (err) {
    console.error('Topup error:', err);
    res.status(500).json({ status: 500, error: 'Internal Server Error' });
  }
});

export default router;
