-- Upsert merchant location
INSERT INTO merchant_radar_signals (merchant_id, is_radar_active, current_location, status_gerak, last_updated_at)
VALUES ($1, TRUE, ST_MakePoint($2, $3)::geography, $4, NOW())
ON CONFLICT (merchant_id)
DO UPDATE SET
    current_location = ST_MakePoint($2, $3)::geography,
    status_gerak = $4,
    last_updated_at = NOW(),
    is_radar_active = TRUE;
