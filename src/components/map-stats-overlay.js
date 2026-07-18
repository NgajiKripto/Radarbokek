/* Hallmark · component: map-stats-overlay · modern-minimal · design-system: design.md
 * Floating stats card overlay on map — adapted from NeedMCP "dashboard-stats-stack"
 * Shows: vendors found, nearest distance, last update time
 */

import { formatDistance } from '../lib/haversine.js';

/**
 * Create and mount the stats overlay into a parent element
 * @param {string} parentId - ID of parent container
 * @returns {{ update: Function, destroy: Function }}
 */
export function initMapStatsOverlay(parentId) {
  const parent = document.getElementById(parentId);
  if (!parent) return { update: () => {}, destroy: () => {} };

  const el = document.createElement('div');
  el.id = 'map-stats-overlay';
  el.className = 'absolute top-[72px] left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-[440px] z-[900] pointer-events-none';
  el.innerHTML = `
    <div class="map-stats-card bg-paper/95 backdrop-blur-sm border border-rule rounded-xl shadow-md pointer-events-auto">
      <div class="flex items-center divide-x divide-rule">
        <!-- Vendors found -->
        <div class="flex-1 flex flex-col items-center py-3 px-2">
          <div class="flex items-center gap-1 mb-1">
            <span class="material-symbols-outlined text-accent text-sm" style="font-variation-settings: 'FILL' 1;">storefront</span>
            <span class="font-mono text-label-sm text-ink-2" style="font-size: 10px;">Pedagang</span>
          </div>
          <span id="stat-vendor-count" class="font-mono text-headline-sm text-ink font-semibold leading-none">0</span>
        </div>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-8 bg-rule"></div>

        <!-- Nearest distance -->
        <div class="flex-1 flex flex-col items-center py-3 px-2">
          <div class="flex items-center gap-1 mb-1">
            <span class="material-symbols-outlined text-teal text-sm" style="font-variation-settings: 'FILL' 1;">near_me</span>
            <span class="font-mono text-label-sm text-ink-2" style="font-size: 10px;">Terdekat</span>
          </div>
          <span id="stat-nearest-dist" class="font-mono text-headline-sm text-ink font-semibold leading-none">—</span>
        </div>

        <!-- Divider -->
        <div class="hidden sm:block w-px h-8 bg-rule"></div>

        <!-- Last update -->
        <div class="flex-1 flex flex-col items-center py-3 px-2">
          <div class="flex items-center gap-1 mb-1">
            <span class="material-symbols-outlined text-highlight-ink text-sm">schedule</span>
            <span class="font-mono text-label-sm text-ink-2" style="font-size: 10px;">Update</span>
          </div>
          <span id="stat-last-update" class="font-mono text-headline-sm text-ink font-semibold leading-none">—</span>
        </div>
      </div>
    </div>
  `;

  parent.appendChild(el);

  const countEl = el.querySelector('#stat-vendor-count');
  const distEl = el.querySelector('#stat-nearest-dist');
  const timeEl = el.querySelector('#stat-last-update');

  let lastUpdateTime = null;

  /**
   * Update stats with new vendor data
   * @param {Array} vendors - Array of vendor objects
   * @param {number} userLat
   * @param {number} userLon
   */
  function update(vendors, userLat, userLon) {
    const count = vendors?.length || 0;
    countEl.textContent = count;

    // Animate count change
    countEl.classList.add('scale-110');
    setTimeout(() => countEl.classList.remove('scale-110'), 200);

    if (count > 0 && userLat != null && userLon != null) {
      let minDist = Infinity;
      vendors.forEach((v) => {
        if (v.lat != null && v.lon != null) {
          const d = v.estimasi_jarak_meter ?? Infinity;
          if (d < minDist) minDist = d;
        }
      });
      distEl.textContent = minDist < Infinity ? formatDistance(minDist) : '—';
    } else {
      distEl.textContent = '—';
    }

    lastUpdateTime = new Date();
    timeEl.textContent = formatTimeShort(lastUpdateTime);
  }

  function destroy() {
    el.remove();
  }

  return { update, destroy };
}

/**
 * Format time as "HH:MM" or "Baru saja"
 */
function formatTimeShort(date) {
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 30000) return 'Baru';
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin}m`;
  const h = date.getHours().toString().padStart(2, '0');
  const m = date.getMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}
