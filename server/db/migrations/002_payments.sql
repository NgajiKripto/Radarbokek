-- RADAR BOKEK Migration 002: Payment Transactions
-- Tracks QRIS top-up payments for webhook callback processing

CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    amount_rupiah INT NOT NULL CHECK (amount_rupiah >= 10000),
    transaction_id VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PAID', 'EXPIRED', 'FAILED')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_tx_id ON payment_transactions (transaction_id);
CREATE INDEX IF NOT EXISTS idx_payment_merchant ON payment_transactions (merchant_id);

-- RLS for payment transactions
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS merchant_own_payment_policy ON payment_transactions;
CREATE POLICY merchant_own_payment_policy ON payment_transactions
    FOR ALL
    USING (auth.uid() = merchant_id)
    WITH CHECK (auth.uid() = merchant_id);
