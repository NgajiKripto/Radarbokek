/* Hallmark · genre: modern-minimal · macrostructure: Marquee Hero · design-system: design.md
 * theme: custom (warm-terakota) · nav: N5 floating-pill · footer: Ft5 statement
 */
import { isAuthenticated, getRole } from '../lib/auth.js';
import { API_BASE } from '../config/constants.js';

export function renderLanding() {
  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = '';

  app.innerHTML = `
    <div class="flex flex-col">
      <!-- Hero — asymmetric editorial split -->
      <section class="px-margin-mobile pt-lg pb-xl">
        <div class="mb-xl">
          <p class="font-mono text-label-sm text-ink-2 uppercase tracking-widest mb-xs">Platform Hyperlocal</p>
          <h2 class="font-display text-display text-ink leading-none" style="font-family: var(--font-display);">
            Hubungkan perut lapar dengan roda UMKM
          </h2>
          <div class="mt-md w-12 h-0.5 bg-accent"></div>
          <p class="font-body text-body-lg text-ink-2 mt-md max-w-[340px]">
            Lacak pedagang keliling di sekitarmu secara real-time. Tanpa install, tanpa ribet.
          </p>
        </div>

        <!-- Primary CTA -->
        <button class="btn-pill btn-pill--primary text-body py-3 px-lg" id="btn-buyer" style="font-size: var(--text-md);">
          Mulai Cari Makan
          <span class="material-symbols-outlined text-lg">arrow_forward</span>
        </button>
      </section>

      <!-- Role Cards — clean, not brutalist -->
      <section class="px-margin-mobile flex flex-col gap-md mb-xl">
        <!-- Buyer Card -->
        <div class="relative card p-lg group cursor-pointer" id="card-buyer">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-teal text-teal-ink text-label-sm font-mono mb-sm" style="font-size: 11px;">
                <span class="material-symbols-outlined text-sm">explore</span>
                PETA REAL-TIME
              </div>
              <h3 class="font-display text-headline text-ink" style="font-family: var(--font-display);">Saya Pembeli</h3>
              <p class="font-body text-body-sm text-ink-2 mt-2xs">
                Temukan gerobak favorit, cek menu hari ini, kuliner tersembunyi di sekitarmu.
              </p>
            </div>
            <div class="w-14 h-14 rounded-lg bg-paper-2 flex items-center justify-center ml-sm shrink-0">
              <span class="material-symbols-outlined text-accent text-[28px]" style="font-variation-settings: 'FILL' 1;">location_on</span>
            </div>
          </div>
          <div class="mt-md pt-md border-t border-rule flex items-center justify-between">
            <span class="font-mono text-label text-ink-2" id="vendor-count">Memuat vendor...</span>
            <span class="material-symbols-outlined text-ink-2 group-hover:text-accent transition-colors">arrow_forward</span>
          </div>
        </div>

        <!-- Merchant Card -->
        <div class="relative card p-lg group cursor-pointer" id="card-merchant">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-accent text-accent-ink text-label-sm font-mono mb-sm" style="font-size: 11px;">
                <span class="material-symbols-outlined text-sm">storefront</span>
                DASHBOARD PEDAGANG
              </div>
              <h3 class="font-display text-headline text-ink" style="font-family: var(--font-display);">Saya Pedagang</h3>
              <p class="font-body text-body-sm text-ink-2 mt-2xs">
                Kelola kuota harian, siarkan lokasi real-time, danjangkau lebih banyak pembeli.
              </p>
            </div>
            <div class="w-14 h-14 rounded-lg bg-paper-2 flex items-center justify-center ml-sm shrink-0">
              <span class="material-symbols-outlined text-accent text-[28px]" style="font-variation-settings: 'FILL' 1;">inventory_2</span>
            </div>
          </div>
          <div class="mt-md pt-md border-t border-rule">
            <button class="btn-pill btn-pill--primary text-body-sm" id="btn-merchant">
              Buka Lapak
              <span class="material-symbols-outlined text-sm">storefront</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Stats — minimal row -->
      <section class="px-margin-mobile pb-xl">
        <div class="flex gap-lg">
          <div class="flex-1">
            <p class="font-mono text-label text-ink-2 uppercase tracking-wider">Pedagang Aktif</p>
            <p class="font-display text-display-s text-ink mt-2xs" style="font-family: var(--font-display);" id="stat-active">—</p>
          </div>
          <div class="w-px bg-rule"></div>
          <div class="flex-1">
            <p class="font-mono text-label text-ink-2 uppercase tracking-wider">Kategori</p>
            <p class="font-display text-display-s text-ink mt-2xs" style="font-family: var(--font-display);">8+</p>
          </div>
        </div>
      </section>

      <!-- Footer statement -->
      <footer class="px-margin-mobile py-lg border-t border-rule">
        <p class="font-body text-body-sm text-ink-2">
          Radar Bokek &mdash; menghubungkan perut lapar dengan roda UMKM, satu lokasi sekaligus.
        </p>
      </footer>
    </div>
  `;

  // Fetch active vendor count
  async function fetchActiveVendorCount() {
    try {
      const res = await fetch(`${API_BASE}/buyer/radar?lat=-6.2&lon=106.816`);
      const data = await res.json();
      if (data.success && data.data) {
        const count = data.data.length;
        document.getElementById('vendor-count').textContent = `${count} pedagang aktif`;
        document.getElementById('stat-active').textContent = count;
      }
    } catch {
      document.getElementById('vendor-count').textContent = '— pedagang aktif';
      document.getElementById('stat-active').textContent = '—';
    }
  }

  // Event listeners
  document.getElementById('btn-buyer').addEventListener('click', () => {
    window.location.hash = '/map';
  });

  document.getElementById('card-buyer').addEventListener('click', () => {
    window.location.hash = '/map';
  });

  document.getElementById('btn-merchant').addEventListener('click', () => {
    if (isAuthenticated() && getRole() === 'merchant') {
      window.location.hash = '/merchant/dashboard';
    } else {
      window.location.hash = '/login';
    }
  });

  document.getElementById('card-merchant').addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    if (isAuthenticated() && getRole() === 'merchant') {
      window.location.hash = '/merchant/dashboard';
    } else {
      window.location.hash = '/login';
    }
  });

  fetchActiveVendorCount();
}
