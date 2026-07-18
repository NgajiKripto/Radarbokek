/**
 * SSE Broadcast Hub
 * Manages connected SSE clients and broadcasts geo-filtered updates
 * 
 * Architecture:
 * - Buyers connect via GET /events/radar?lat=&lon=
 * - On merchant ping, server broadcasts to buyers within 2km
 * - Geo-hashing for efficient filtering (future optimization)
 */

// Connected buyers: Map<clientId, { res, lat, lon }>
const connectedBuyers = new Map();
let clientIdCounter = 0;

/**
 * Register a new SSE buyer client
 */
export function registerClient(res, lat, lon) {
  const clientId = ++clientIdCounter;
  connectedBuyers.set(clientId, { res, lat, lon });

  // Update position periodically
  const updateInterval = setInterval(() => {
    // Client should send position updates via separate endpoint
  }, 30000);

  res.on('close', () => {
    connectedBuyers.delete(clientId);
    clearInterval(updateInterval);
  });

  return clientId;
}

/**
 * Update buyer position
 */
export function updateClientPosition(clientId, lat, lon) {
  const client = connectedBuyers.get(clientId);
  if (client) {
    client.lat = lat;
    client.lon = lon;
  }
}

/**
 * Broadcast vendor update to nearby buyers
 * @param {Object} vendorData - { merchant_id, lat, lon, ... }
 * @param {number} radiusM - Broadcast radius in meters (default 2000)
 */
export function broadcastToNearby(vendorData, radiusM = 2000) {
  const event = `event: vendor-update\ndata: ${JSON.stringify(vendorData)}\n\n`;

  for (const [clientId, client] of connectedBuyers) {
    // Simple distance check (can be optimized with geohashing)
    const distance = haversineDistance(client.lat, client.lon, vendorData.lat, vendorData.lon);
    if (distance <= radiusM) {
      try {
        client.res.write(event);
      } catch {
        connectedBuyers.delete(clientId);
      }
    }
  }
}

/**
 * Haversine distance (server-side copy)
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * Get connected buyer count
 */
export function getClientCount() {
  return connectedBuyers.size;
}
