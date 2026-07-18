-- RADAR BOKEK Migration 003: Buyer Search Heatmap
-- Tracks anonymized buyer search activity for predictive route suggestions

CREATE TABLE IF NOT EXISTS buyer_search_heatmap (
    id BIGSERIAL PRIMARY KEY,
    location GEOGRAPHY(Point, 4326) NOT NULL,
    hour_of_day SMALLINT NOT NULL CHECK (hour_of_day BETWEEN 0 AND 23),
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    search_count INT NOT NULL DEFAULT 1,
    last_searched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for time-based spatial queries
CREATE INDEX IF NOT EXISTS idx_heatmap_spatial
    ON buyer_search_heatmap USING GIST (location);

-- Index for time-range queries
CREATE INDEX IF NOT EXISTS idx_heatmap_time
    ON buyer_search_heatmap (hour_of_day, day_of_week);

-- Composite index for the common query pattern
CREATE INDEX IF NOT EXISTS idx_heatmap_spatial_time
    ON buyer_search_heatmap (hour_of_day, day_of_week);

-- RLS: anyone can read (anonymized data), server inserts
ALTER TABLE buyer_search_heatmap ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_read_heatmap_policy ON buyer_search_heatmap;
CREATE POLICY public_read_heatmap_policy ON buyer_search_heatmap
    FOR SELECT
    USING (true);
