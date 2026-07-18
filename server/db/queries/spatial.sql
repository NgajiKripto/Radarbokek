-- Find active merchants within 2km radius of buyer
-- Parameters: :buyer_longitude, :buyer_latitude
SELECT
    m.id AS merchant_id,
    m.business_name,
    m.category,
    m.price_baseline,
    m.menu_spanduk_url,
    m.current_tier,
    s.status_gerak,
    s.current_location,
    ST_Distance(
        s.current_location,
        ST_MakePoint(:buyer_longitude, :buyer_latitude)::geography
    ) AS estimasi_jarak
FROM merchant_radar_signals s
JOIN merchants m ON s.merchant_id = m.id
WHERE
    s.is_radar_active = TRUE
    AND s.status_gerak != 'melaju_cepat'
    AND ST_DWithin(
        s.current_location,
        ST_MakePoint(:buyer_longitude, :buyer_latitude)::geography,
        2000
    )
ORDER BY
    CASE WHEN m.current_tier = 'pro' THEN 1
         WHEN m.current_tier = 'standard' THEN 2
         ELSE 3 END,
    estimasi_jarak ASC;
