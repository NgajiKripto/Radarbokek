/* Hallmark · component: vendor-detail-panel · modern-minimal · design-system: design.md
 * Enhanced bottom panel for map — adapted from NeedMCP "dashboard-stats-stack"
 * Shows vendor details with action buttons and swipe-to-refresh radar
 */

import { formatDistance, haversineDistance } from '../lib/haversine.js';
import { encodeHTML } from '../lib/sanitizer.js';

let _panelEl = null;
let _isOpen = false;
let _currentVendor = null;
let _onNavigate = null;
let _onClose = null;

/**
 * Initialize the vendor detail panel
 * @param {Object} options
 * @param {Function} options.onNavigate - Called with vendor when navigate is tapped
 * @param {Function} options.onRefresh - Called when refresh radar is triggered
 * @param {Function} options.onClose - Called when panel is closed
 */
export function initVendorDetailPanel({ onNavigate, onRefresh, onClose }) {
  _onNavigate = onNavigate;
  _onClose = onClose;

  // Create panel container
  const existing = document.getElementById('vendor-detail-panel');
  if (existing) existing.remove();

  _panelEl = document.createElement('div');
  _panelEl.id = 'vendor-detail-panel';
  _panelEl.className = 'hidden fixed bottom-20 w-full max-w-[480px] left-1/2 -translate-x-1/2 px-margin-mobile z-[1000]';
  _panelEl.innerHTML = `
    <div class="vendor-detail-inner">
      <!-- Vendor info card -->
      <div class="bg-paper border border-rule rounded-2xl shadow-lg overflow-hidden mb-3 transition-all duration-300">
        <!-- Header with image -->
        <div class="flex gap-3 p-4">
          <div id="vd-image" class="w-16 h-16 rounded-lg border border-rule bg-paper-2 flex items-center justify-center shrink-0 overflow-hidden">
            <span class="material-symbols-outlined text-2xl text-ink-2">restaurant</span>
          </div>
          <div class="flex-grow min-w-0">
            <div class="flex items-start justify-between gap-2">
              <div class="min-w-0">
                <h3 id="vd-name" class="font-body text-body font-semibold text-ink leading-tight truncate">—</h3>
                <p id="vd-category" class="font-mono text-label-sm text-ink-2 mt-0.5">—</p>
              </div>
              <button id="vd-close" class="w-7 h-7 rounded-full bg-paper-2 flex items-center justify-center shrink-0 hover:bg-paper-3 transition-colors">
                <span class="material-symbols-outlined text-sm text-ink-2">close</span>
              </button>
            </div>
            <div id="vd-tags" class="flex items-center gap-1.5 mt-2"></div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="flex items-center divide-x divide-rule border-t border-rule">
          <div class="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <span class="material-symbols-outlined text-teal text-sm" style="font-variation-settings: 'FILL' 1;">near_me</span>
            <span id="vd-distance" class="font-mono text-label-sm text-ink">—</span>
          </div>
          <div class="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <span class="material-symbols-outlined text-highlight-ink text-sm" style="font-variation-settings: 'FILL' 1;">star</span>
            <span id="vd-rating" class="font-mono text-label-sm text-ink">—</span>
          </div>
          <div class="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <span class="material-symbols-outlined text-accent text-sm" style="font-variation-settings: 'FILL' 1;">payments</span>
            <span id="vd-price" class="font-mono text-label-sm text-ink">—</span>
          </div>
        </div>

        <!-- Action buttons -->
        <div class="flex gap-2 p-4 pt-3">
          <button id="vd-btn-navigate" class="flex-1 h-10 rounded-pill bg-accent text-accent-ink font-body text-label font-semibold flex items-center justify-center gap-1.5 hover:brightness-110 active:scale-[0.98] transition-all">
            <span class="material-symbols-outlined text-sm">directions_walk</span>
            <span>Navigasi</span>
          </button>
          <button id="vd-btn-share" class="w-10 h-10 rounded-full bg-paper-2 border border-rule text-ink-2 flex items-center justify-center hover:bg-paper-3 transition-colors">
            <span class="material-symbols-outlined text-lg">share</span>
          </button>
        </div>
      </div>

      <!-- Refresh radar button -->
      <div id="refresh-radar-container" class="relative">
        <button id="btn-refresh-radar" class="w-full h-14 rounded-2xl bg-gradient-to-r from-accent/10 via-accent/5 to-accent/10 border border-accent/20 backdrop-blur-sm flex items-center justify-center gap-2 font-body text-label font-medium text-accent hover:from-accent/15 hover:to-accent/15 active:scale-[0.99] transition-all">
          <span class="material-symbols-outlined text-xl animate-spin-slow" style="font-variation-settings: 'FILL' 1;">radar</span>
          <span>Refresh Radar</span>
        </button>
      </div>
    </div>
  `;

  document.getElementById('app')?.appendChild(_panelEl);

  // Bind events
  _panelEl.querySelector('#vd-close')?.addEventListener('click', hidePanel);
  _panelEl.querySelector('#vd-btn-navigate')?.addEventListener('click', () => {
    if (_currentVendor && _onNavigate) _onNavigate(_currentVendor);
  });
  _panelEl.querySelector('#vd-btn-share')?.addEventListener('click', () => {
    if (_currentVendor) shareVendor(_currentVendor);
  });
  _panelEl.querySelector('#btn-refresh-radar')?.addEventListener('click', () => {
    if (onRefresh) onRefresh();
    animateRefreshButton();
  });
}

/**
 * Show vendor detail in panel
 * @param {Object} vendor
 * @param {number} userLat
 * @param {number} userLon
 */
export function showVendorDetail(vendor, userLat, userLon) {
  if (!_panelEl) return;
  _currentVendor = vendor;

  // Image
  const imgEl = _panelEl.querySelector('#vd-image');
  if (vendor.menu_spanduk_url) {
    imgEl.innerHTML = `<img src="${encodeHTML(vendor.menu_spanduk_url)}" alt="" class="w-full h-full object-cover" />`;
  } else {
    imgEl.innerHTML = `<span class="material-symbols-outlined text-2xl text-ink-2">restaurant</span>`;
  }

  // Text
  _panelEl.querySelector('#vd-name').textContent = vendor.business_name || '—';
  _panelEl.querySelector('#vd-category').textContent = vendor.category || '—';

  // Tags (payment methods)
  const tagsEl = _panelEl.querySelector('#vd-tags');
  let tagsHtml = '';
  if (vendor.metode_pembayaran?.includes('QRIS')) {
    tagsHtml += `<span class="px-2 py-0.5 rounded-pill bg-teal/10 border border-teal/30 text-teal font-mono text-label-sm" style="font-size:10px;">QRIS</span>`;
  }
  if (vendor.metode_pembayaran?.includes('CASH')) {
    tagsHtml += `<span class="px-2 py-0.5 rounded-pill bg-ink/10 border border-ink/20 text-ink font-mono text-label-sm" style="font-size:10px;">Tunai</span>`;
  }
  tagsEl.innerHTML = tagsHtml;

  // Stats
  const dist = vendor.estimasi_jarak_meter;
  _panelEl.querySelector('#vd-distance').textContent = dist != null ? formatDistance(dist) : '—';

  const rating = vendor.reputasi?.rating_rata_rata;
  const reviews = vendor.reputasi?.total_ulasan;
  _panelEl.querySelector('#vd-rating').textContent =
    rating != null ? `${Number(rating)} (${reviews || 0})` : '—';

  const price = Number(vendor.price_baseline) || 0;
  _panelEl.querySelector('#vd-price').textContent =
    price >= 1000 ? `Rp${(price / 1000).toFixed(0)}k` : `Rp${price}`;

  // Show panel with animation
  _panelEl.classList.remove('hidden');
  _panelEl.style.opacity = '0';
  _panelEl.style.transform = 'translateY(16px)';
  requestAnimationFrame(() => {
    _panelEl.style.transition = 'opacity 300ms ease-out, transform 300ms ease-out';
    _panelEl.style.opacity = '1';
    _panelEl.style.transform = 'translateY(0)';
  });

  _isOpen = true;
}

/**
 * Hide the panel
 */
export function hidePanel() {
  if (!_panelEl || !_isOpen) return;
  _panelEl.style.opacity = '0';
  _panelEl.style.transform = 'translateY(16px)';
  setTimeout(() => {
    _panelEl?.classList.add('hidden');
  }, 300);
  _isOpen = false;
  _currentVendor = null;
  _onClose?.();
}

/**
 * Check if panel is open
 */
export function isPanelOpen() {
  return _isOpen;
}

/**
 * Animate refresh button on click
 */
function animateRefreshButton() {
  const btn = _panelEl?.querySelector('#btn-refresh-radar');
  if (!btn) return;
  const icon = btn.querySelector('.material-symbols-outlined');
  icon?.classList.add('animate-spin-slow');
  btn.disabled = true;
  btn.classList.add('opacity-60');
  setTimeout(() => {
    icon?.classList.remove('animate-spin-slow');
    btn.disabled = false;
    btn.classList.remove('opacity-60');
  }, 2000);
}

/**
 * Share vendor info
 */
async function shareVendor(vendor) {
  const text = `${vendor.business_name} — ${vendor.category || 'Pedagang keliling'}\nLokasi: https://www.google.com/maps?q=${vendor.lat},${vendor.lon}`;
  if (navigator.share) {
    try {
      await navigator.share({ title: vendor.business_name, text });
    } catch {}
  } else {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  }
}
