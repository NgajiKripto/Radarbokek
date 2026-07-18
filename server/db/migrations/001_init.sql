-- RADAR BOKEK Database Schema
-- PostgreSQL + PostGIS

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Custom types
CREATE TYPE tier_level AS ENUM ('free', 'standard', 'pro');
CREATE TYPE movement_status AS ENUM ('jalan', 'mangkal', 'melaju_cepat');

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('buyer', 'merchant')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Merchants table
CREATE TABLE IF NOT EXISTS merchants (
    id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(40) NOT NULL,
    category VARCHAR(50) NOT NULL,
    price_baseline NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    menu_spanduk_url TEXT,
    qris_tip_destination TEXT,
    coin_balance INT NOT NULL DEFAULT 0 CHECK (coin_balance >= 0),
    current_tier tier_level NOT NULL DEFAULT 'free'
);

-- Merchant radar signals (high-throughput)
CREATE TABLE IF NOT EXISTS merchant_radar_signals (
    merchant_id UUID PRIMARY KEY REFERENCES merchants(id) ON DELETE CASCADE,
    is_radar_active BOOLEAN NOT NULL DEFAULT FALSE,
    current_location GEOGRAPHY(Point, 4326),
    status_gerak movement_status NOT NULL DEFAULT 'jalan',
    remaining_free_quota INTERVAL NOT NULL DEFAULT '03:00:00',
    last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id BIGSERIAL PRIMARY KEY,
    merchant_id UUID NOT NULL REFERENCES merchants(id) ON DELETE CASCADE,
    buyer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spatial index for fast geo queries
CREATE INDEX IF NOT EXISTS idx_merchants_location
    ON merchant_radar_signals USING GIST (current_location);

-- Index for active radar filter
CREATE INDEX IF NOT EXISTS idx_active_radar
    ON merchant_radar_signals (is_radar_active)
    WHERE is_radar_active = TRUE;

-- Index for reviews aggregation
CREATE INDEX IF NOT EXISTS idx_reviews_merchant
    ON reviews (merchant_id);

-- Row Level Security
ALTER TABLE merchants ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_radar_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Merchants: owner-only access
DROP POLICY IF EXISTS merchant_own_profile_policy ON merchants;
CREATE POLICY merchant_own_profile_policy ON merchants
    FOR ALL
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Radar signals: owner full access, buyers can read active ones
DROP POLICY IF EXISTS merchant_own_radar_policy ON merchant_radar_signals;
CREATE POLICY merchant_own_radar_policy ON merchant_radar_signals
    FOR ALL
    USING (auth.uid() = merchant_id)
    WITH CHECK (auth.uid() = merchant_id);

DROP POLICY IF EXISTS buyer_view_active_radar_policy ON merchant_radar_signals;
CREATE POLICY buyer_view_active_radar_policy ON merchant_radar_signals
    FOR SELECT
    USING (is_radar_active = TRUE OR auth.uid() = merchant_id);

-- Reviews: buyers can insert own reviews, merchants can read theirs
DROP POLICY IF EXISTS buyer_create_review_policy ON reviews;
CREATE POLICY buyer_create_review_policy ON reviews
    FOR INSERT
    WITH CHECK (auth.uid() = buyer_id OR buyer_id IS NULL);

DROP POLICY IF EXISTS public_read_reviews_policy ON reviews;
CREATE POLICY public_read_reviews_policy ON reviews
    FOR SELECT
    USING (true);
