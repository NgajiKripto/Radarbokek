/* Hallmark · component: heatmap-suggestions · modern-minimal · design-system: design.md */
import { authFetch } from '../lib/auth.js';

export async function renderSuggestions(containerId, lat, lon) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = `
    <div class="card mt-md">
      <div class="flex items-center gap-2xs mb-sm">
        <span class="material-symbols-outlined text-accent text-lg" style="font-variation-settings: 'FILL' 1;">insights</span>
        <h3 class="font-body text-body font-semibold text-ink">Saran Lokasi Jualan</h3>
      </div>
      <p class="font-body text-body-sm text-ink-2 animate-pulse">Menganalisis data aktivitas pembeli...</p>
    </div>
  `;

  try {
    const res = await authFetch(`/merchant/suggestions?lat=${lat}&lon=${lon}`);
    const json = await res.json();

    if (!json.success || !json.data || json.data.length === 0) {
      container.innerHTML = `
        <div class="card mt-md">
          <div class="flex items-center gap-2xs mb-sm">
            <span class="material-symbols-outlined text-ink-2 text-lg">insights</span>
            <h3 class="font-body text-body font-semibold text-ink">Saran Lokasi Jualan</h3>
          </div>
          <p class="font-body text-body-sm text-ink-2">
            Belum cukup data. Semakin banyak pembeli mencari, saran akan muncul di sini.
          </p>
        </div>
      `;
      return;
    }

    const zones = json.data;

    container.innerHTML = `
      <div class="card mt-md">
        <div class="flex items-center gap-2xs mb-sm">
          <span class="material-symbols-outlined text-accent text-lg" style="font-variation-settings: 'FILL' 1;">insights</span>
          <h3 class="font-body text-body font-semibold text-ink">Saran Lokasi Jualan</h3>
        </div>
        <p class="font-body text-body-sm text-ink-2 mb-sm">
          Berdasarkan aktivitas pencarian pembeli di jam yang sama
        </p>
        <div class="flex flex-col gap-xs">
          ${zones.map((z) => `
            <div class="flex items-center justify-between p-sm rounded-md border border-rule bg-paper-2">
              <div class="flex items-center gap-sm">
                <span class="font-display text-headline-sm text-accent w-7 text-center" style="font-family: var(--font-display);">${z.rank}</span>
                <div>
                  <p class="font-body text-body-sm font-semibold text-ink">${z.label}</p>
                  <p class="font-body text-body-sm text-ink-2 flex items-center gap-1">
                    <span class="material-symbols-outlined text-xs">near_me</span> ${z.jarak_meter}m
                    <span class="mx-1 text-rule">·</span>
                    <span class="material-symbols-outlined text-xs">search</span> ${z.total_searches}
                  </p>
                </div>
              </div>
              <button class="nav-to-zone btn-pill btn-pill--secondary py-1 px-2.5 text-label-sm"
                data-lat="${z.lat}" data-lon="${z.lon}">
                <span class="material-symbols-outlined text-lg">directions</span>
              </button>
            </div>
          `).join('')}
        </div>
        <p class="font-body text-body-sm text-ink-2 mt-sm">
          Data diperbarui setiap jam. Saldo koin diperlukan untuk hak tayang Pro.
        </p>
      </div>
    `;

    container.querySelectorAll('.nav-to-zone').forEach((btn) => {
      btn.addEventListener('click', () => {
        const zLat = btn.dataset.lat;
        const zLon = btn.dataset.lon;
        if (window._radarMap) {
          window._radarMap.setView([parseFloat(zLat), parseFloat(zLon)], 16);
        }
      });
    });
  } catch (err) {
    console.error('Suggestions load error:', err);
    container.innerHTML = `
      <div class="card mt-md">
        <p class="font-body text-body-sm text-ink-2">Gagal memuat saran lokasi.</p>
      </div>
    `;
  }
}
