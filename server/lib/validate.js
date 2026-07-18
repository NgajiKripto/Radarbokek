/**
 * Geo-coordinate validation (panduan §2, Rule 4: validasi tipe data)
 */

const VALID_LAT_RANGE = { min: -90, max: 90 };
const VALID_LON_RANGE = { min: -180, max: 180 };

/**
 * Validate latitude value
 * @param {*} val - Input value
 * @returns {{ valid: boolean, value: number|null, error: string|null }}
 */
export function validateLat(val) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    return { valid: false, value: null, error: 'Latitude harus berupa angka' };
  }
  if (num < VALID_LAT_RANGE.min || num > VALID_LAT_RANGE.max) {
    return { valid: false, value: null, error: `Latitude harus antara ${VALID_LAT_RANGE.min} dan ${VALID_LAT_RANGE.max}` };
  }
  return { valid: true, value: num, error: null };
}

/**
 * Validate longitude value
 * @param {*} val - Input value
 * @returns {{ valid: boolean, value: number|null, error: string|null }}
 */
export function validateLon(val) {
  const num = parseFloat(val);
  if (isNaN(num)) {
    return { valid: false, value: null, error: 'Longitude harus berupa angka' };
  }
  if (num < VALID_LON_RANGE.min || num > VALID_LON_RANGE.max) {
    return { valid: false, value: null, error: `Longitude harus antara ${VALID_LON_RANGE.min} dan ${VALID_LON_RANGE.max}` };
  }
  return { valid: true, value: num, error: null };
}

/**
 * Validate lat + lon pair
 * @returns {{ valid: boolean, lat: number|null, lon: number|null, error: string|null }}
 */
export function validateLatLon(latVal, lonVal) {
  const lat = validateLat(latVal);
  if (!lat.valid) return { valid: false, lat: null, lon: null, error: lat.error };

  const lon = validateLon(lonVal);
  if (!lon.valid) return { valid: false, lat: null, lon: null, error: lon.error };

  return { valid: true, lat: lat.value, lon: lon.value, error: null };
}
