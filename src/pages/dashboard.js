/* Hallmark · genre: modern-minimal · macrostructure: Workbench · design-system: design.md
 * theme: custom (warm-terakota) · dashboard · designed-as-app
 */
import { isAuthenticated, getRole } from '../lib/auth.js';
import { GeolocationTracker } from '../lib/geolocation.js';
import { WakeLockManager } from '../lib/wake-lock.js';
import { authFetch } from '../lib/auth.js';
import { FREE_QUOTA_SECONDS, STANDARD_COST_PER_DAY, PRO_COST_PER_DAY, API_BASE } from '../config/constants.js';
import { renderSuggestions } from '../components/heatmap-suggestions.js';

export function renderDashboard() {
  if (!isAuthenticated()) {
    window.location.hash = '/';
    return;
  }

  if (renderDashboard._cleanup) {
    renderDashboard._cleanup();
    renderDashboard._cleanup = null;
  }

  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = '';

  let isRadarActive = false;
  let remainingQuota = FREE_QUOTA_SECONDS;
  try {
    const saved = localStorage.getItem('rb_quota');
    if (saved) {
      const parsed = parseInt(saved);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= FREE_QUOTA_SECONDS) {
        remainingQuota = parsed;
      }
    }
  } catch {}

  let coinBalance = 0;
  let currentTier = 'free';
  let statusGerak = 'jalan';
  let intervalId = null;

  const tracker = new GeolocationTracker();
  const wakeLock = new WakeLockManager();

  app.innerHTML = `
    <div class="px-margin-mobile flex flex-col gap-md pb-28">
      <!-- Header -->
      <div class="pt-xs">
        <h2 class="font-display text-headline text-ink" style="font-family: var(--font-display);">Dashboard</h2>
        <p class="font-body text-body-sm text-ink-2 mt-2xs">Kelola status jualanmu</p>
      </div>

      <!-- Status Card — clean, not brutalist -->
      <section class="card">
        <div class="flex items-center justify-between mb-sm">
          <div>
            <p class="font-mono text-label-sm text-ink-2 uppercase tracking-wider">Sisa Kuota</p>
            <p class="font-display text-display-s text-ink" style="font-family: var(--font-display);" id="quota-display">3:00:00</p>
          </div>
          <div class="text-right">
            <p class="font-mono text-label-sm text-ink-2 uppercase tracking-wider">Saldo</p>
            <p class="font-display text-headline-sm text-accent" style="font-family: var(--font-display);" id="coin-display">Rp0</p>
          </div>
        </div>

        <!-- Tier Badge -->
        <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill bg-teal text-teal-ink font-mono text-label-sm mb-sm" id="tier-badge" style="font-size: 11px;">
          TIER: FREE
        </div>

        <!-- Tier Upgrade -->
        <div id="tier-upgrade-section" class="mt-md pt-md border-t border-rule">
          <p class="font-mono text-label text-ink-2 uppercase tracking-wider mb-sm">Upgrade Tier</p>
          <div class="grid grid-cols-2 gap-sm">
            <button id="btn-tier-standard" class="card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm">
              <span class="block font-body text-body-sm font-semibold text-ink">Standard</span>
              <span class="block font-display text-headline-sm text-accent" style="font-family: var(--font-display);">Rp${STANDARD_COST_PER_DAY.toLocaleString('id-ID')}<span class="font-body text-body-sm text-ink-2">/hari</span></span>
            </button>
            <button id="btn-tier-pro" class="card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm">
              <span class="block font-body text-body-sm font-semibold text-ink">Pro</span>
              <span class="block font-display text-headline-sm text-accent" style="font-family: var(--font-display);">Rp${PRO_COST_PER_DAY.toLocaleString('id-ID')}<span class="font-body text-body-sm text-ink-2">/hari</span></span>
            </button>
          </div>
        </div>

        <!-- Active Tier Info -->
        <div id="active-tier-info" class="hidden mt-md pt-md border-t border-rule">
          <p class="font-body text-body-sm text-ink-2">Tier aktif: <span id="active-tier-name" class="font-semibold text-ink"></span></p>
          <button id="btn-tier-downgrade" class="mt-sm font-mono text-label text-ink-2 hover:text-accent transition-colors underline">
            Kembali ke Gratis
          </button>
        </div>
      </section>

      <!-- Radar Toggle — prominent, single-focus -->
      <section class="card text-center">
        <p class="font-mono text-label text-ink-2 uppercase tracking-wider mb-sm">Status Radar</p>
        <button id="radar-toggle" class="w-full py-4 rounded-lg font-body font-semibold text-body transition-colors cursor-pointer
          bg-paper-2 text-ink border border-rule hover:border-ink-2">
          Mulai Berkeliling
        </button>
        <p class="font-body text-body-sm text-ink-2 mt-xs" id="radar-status-text">Radar nonaktif</p>
      </section>

      <!-- Movement Status — toggle pills -->
      <section class="flex gap-sm">
        <button id="btn-jalan" class="flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-highlight text-highlight-ink border border-transparent">
          <span class="material-symbols-outlined text-lg align-middle mr-1">directions_bike</span>
          Lagi Jalan
        </button>
        <button id="btn-mangkal" class="flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-transparent text-ink-2 border border-rule hover:border-ink-2">
          <span class="material-symbols-outlined text-lg align-middle mr-1">stop_circle</span>
          Lagi Mangkal
        </button>
      </section>

      <!-- Battery Saver -->
      <section class="card flex items-center justify-between">
        <div class="flex items-center gap-sm">
          <span class="material-symbols-outlined text-ink-2">battery_saver</span>
          <div>
            <p class="font-body text-body-sm font-semibold text-ink">Hemat Baterai</p>
            <p class="font-body text-body-sm text-ink-2">GPS tiap 45 detik</p>
          </div>
        </div>
        <button id="btn-battery-saver" class="w-12 h-7 rounded-pill border border-rule bg-paper-2 transition-colors relative cursor-pointer">
          <span class="absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-paper border border-rule battery-knob shadow-sm" id="battery-saver-knob"></span>
        </button>
      </section>

      <!-- Velocity Alert -->
      <div id="velocity-alert" class="hidden rounded-md bg-error/10 border border-error/30 p-sm font-body text-body-sm text-error text-center">
        Melaju terlalu cepat (&gt;20 km/jam). Keamanan adalah prioritas.
      </div>

      <!-- Quick Actions -->
      <section class="flex flex-col gap-xs">
        <a href="#/merchant/profile" class="card flex items-center gap-sm hover:border-ink-2 transition-colors">
          <span class="material-symbols-outlined text-ink-2">edit</span>
          <span class="font-body text-body-sm text-ink">Edit Profil Jualan</span>
          <span class="material-symbols-outlined text-ink-2 ml-auto text-lg">chevron_right</span>
        </a>
        <a href="#/merchant/topup" class="card flex items-center gap-sm hover:border-ink-2 transition-colors">
          <span class="material-symbols-outlined text-accent" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
          <span class="font-body text-body-sm text-ink">Isi Saldo Koin</span>
          <span class="material-symbols-outlined text-ink-2 ml-auto text-lg">chevron_right</span>
        </a>
      </section>

      <!-- Predictive Route Suggestions -->
      <div id="suggestions-container"></div>
    </div>
  `;

  // --- Helpers ---
  function formatQuota(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateQuotaDisplay() {
    const el = document.getElementById('quota-display');
    if (el) el.textContent = formatQuota(remainingQuota);
    try { localStorage.setItem('rb_quota', String(remainingQuota)); } catch {}
  }

  function updateCoinDisplay() {
    const el = document.getElementById('coin-display');
    if (el) el.textContent = `Rp${coinBalance.toLocaleString('id-ID')}`;
  }

  function updateTierUI() {
    const badge = document.getElementById('tier-badge');
    const upgradeSection = document.getElementById('tier-upgrade-section');
    const activeInfo = document.getElementById('active-tier-info');
    const activeName = document.getElementById('active-tier-name');

    if (badge) {
      let badgeBg = 'bg-teal text-teal-ink';
      let badgeText = 'TIER: FREE';
      if (currentTier === 'standard') {
        badgeBg = 'bg-highlight text-highlight-ink';
        badgeText = 'TIER: STANDARD';
      } else if (currentTier === 'pro') {
        badgeBg = 'bg-accent text-accent-ink';
        badgeText = 'TIER: PRO';
      }
      badge.className = `inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill ${badgeBg} font-mono text-label-sm mb-sm`;
      badge.textContent = badgeText;
    }

    if (upgradeSection && activeInfo) {
      if (currentTier === 'free') {
        upgradeSection.classList.remove('hidden');
        activeInfo.classList.add('hidden');
      } else {
        upgradeSection.classList.add('hidden');
        activeInfo.classList.remove('hidden');
        if (activeName) activeName.textContent = currentTier.toUpperCase();
      }
    }
  }

  // --- Radar Toggle ---
  async function startRadar() {
    if (isRadarActive) return;
    isRadarActive = true;
    await wakeLock.request();
    tracker.start(handleLocationUpdate, handleLocationError);
    intervalId = setInterval(() => {
      if (remainingQuota > 0) {
        remainingQuota--;
        updateQuotaDisplay();
      } else {
        isRadarActive = false;
        updateToggleUI();
        tracker.stop();
        wakeLock.release();
        if (intervalId) clearInterval(intervalId);
      }
    }, 1000);
    updateToggleUI();
    try {
      await authFetch('/merchant/radar/toggle', {
        method: 'PUT',
        body: JSON.stringify({ is_radar_active: true }),
      });
    } catch (err) {
      console.error('Toggle sync failed:', err);
    }
  }

  function stopRadar() {
    isRadarActive = false;
    tracker.stop();
    wakeLock.release();
    if (intervalId) clearInterval(intervalId);
    updateToggleUI();
    authFetch('/merchant/radar/toggle', {
      method: 'PUT',
      body: JSON.stringify({ is_radar_active: false }),
    }).catch(err => console.error('Toggle sync failed:', err));
  }

  document.getElementById('radar-toggle').addEventListener('click', () => {
    if (isRadarActive) {
      stopRadar();
    } else {
      startRadar();
    }
  });

  function updateToggleUI() {
    const btn = document.getElementById('radar-toggle');
    const statusText = document.getElementById('radar-status-text');
    if (!btn) return;

    if (isRadarActive) {
      btn.className = 'w-full py-4 rounded-lg font-body font-semibold text-body transition-colors cursor-pointer bg-accent text-accent-ink border border-transparent';
      btn.textContent = 'Berhenti Berkeliling';
      if (statusText) statusText.textContent = 'Radar aktif — lokasi disiarkan';
    } else {
      btn.className = 'w-full py-4 rounded-lg font-body font-semibold text-body transition-colors cursor-pointer bg-paper-2 text-ink border border-rule hover:border-ink-2';
      btn.textContent = 'Mulai Berkeliling';
      if (statusText) statusText.textContent = 'Radar nonaktif';
    }
  }

  // --- Movement Status ---
  document.getElementById('btn-jalan')?.addEventListener('click', () => {
    statusGerak = 'jalan';
    updateMovementUI();
  });
  document.getElementById('btn-mangkal')?.addEventListener('click', () => {
    statusGerak = 'mangkal';
    updateMovementUI();
    if (!isRadarActive) {
      startRadar();
    }
  });

  function updateMovementUI() {
    const btnJalan = document.getElementById('btn-jalan');
    const btnMangkal = document.getElementById('btn-mangkal');
    if (!btnJalan || !btnMangkal) return;

    if (statusGerak === 'jalan') {
      btnJalan.className = 'flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-highlight text-highlight-ink border border-transparent';
      btnMangkal.className = 'flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-transparent text-ink-2 border border-rule hover:border-ink-2';
    } else {
      btnMangkal.className = 'flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-teal text-teal-ink border border-transparent';
      btnJalan.className = 'flex-1 py-sm rounded-pill font-body text-body-sm font-semibold text-center transition-colors cursor-pointer bg-transparent text-ink-2 border border-rule hover:border-ink-2';
    }
  }

  // --- Battery Saver ---
  let batterySaver = false;
  try {
    batterySaver = localStorage.getItem('rb_battery_saver') === 'true';
  } catch {}
  tracker.setBatterySaver(batterySaver);
  updateBatterySaverUI();

  document.getElementById('btn-battery-saver')?.addEventListener('click', () => {
    batterySaver = !batterySaver;
    tracker.setBatterySaver(batterySaver);
    try {
      localStorage.setItem('rb_battery_saver', batterySaver.toString());
    } catch {}
    updateBatterySaverUI();
  });

  function updateBatterySaverUI() {
    const btn = document.getElementById('btn-battery-saver');
    const knob = document.getElementById('battery-saver-knob');
    if (!btn || !knob) return;

    if (batterySaver) {
      btn.className = 'w-12 h-7 rounded-pill border border-teal bg-teal transition-colors relative cursor-pointer';
      knob.className = 'absolute top-0.5 right-0.5 w-6 h-6 rounded-full bg-paper border border-teal transition-colors shadow-sm';
    } else {
      btn.className = 'w-12 h-7 rounded-pill border border-rule bg-paper-2 transition-colors relative cursor-pointer';
      knob.className = 'absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-paper border border-rule transition-colors shadow-sm';
    }
  }

  // --- Tier Upgrade ---
  document.getElementById('btn-tier-standard')?.addEventListener('click', () => activateTierAction('standard'));
  document.getElementById('btn-tier-pro')?.addEventListener('click', () => activateTierAction('pro'));
  document.getElementById('btn-tier-downgrade')?.addEventListener('click', () => downgradeTierAction());

  async function activateTierAction(tier) {
    const cost = tier === 'pro' ? PRO_COST_PER_DAY : STANDARD_COST_PER_DAY;
    if (coinBalance < cost) {
      alert(`Saldo koin tidak cukup. Butuh Rp${cost.toLocaleString('id-ID')}, saldo: Rp${coinBalance.toLocaleString('id-ID')}. Silakan isi saldo terlebih dahulu.`);
      window.location.hash = '/merchant/topup';
      return;
    }

    if (!confirm(`Aktifkan tier ${tier.toUpperCase()} seharga Rp${cost.toLocaleString('id-ID')}/hari? Saldo koin bersifat non-refundable.`)) return;

    try {
      const res = await authFetch('/merchant/tier/activate', {
        method: 'POST',
        body: JSON.stringify({ tier }),
      });
      const data = await res.json();

      if (data.success) {
        currentTier = tier;
        coinBalance = data.new_balance;
        updateCoinDisplay();
        updateTierUI();
        alert(data.message);
      } else {
        alert(data.message || 'Gagal mengaktifkan tier');
      }
    } catch (err) {
      console.error('Tier activation failed:', err);
      alert('Gagal mengaktifkan tier. Silakan coba lagi.');
    }
  }

  async function downgradeTierAction() {
    if (!confirm('Kembali ke tier Gratis? Hak tayang Pro/Standard akan berakhir. Saldo yang sudah terpakai tidak dapat dikembalikan.')) return;

    try {
      const res = await authFetch('/merchant/tier/downgrade', { method: 'POST' });
      const data = await res.json();

      if (data.success) {
        currentTier = 'free';
        updateTierUI();
        alert(data.message);
      }
    } catch (err) {
      console.error('Tier downgrade failed:', err);
    }
  }

  // --- Location updates ---
  async function handleLocationUpdate({ lat, lon, speed }) {
    const speedKmh = speed * 3.6;
    const alert = document.getElementById('velocity-alert');

    if (speedKmh > 20) {
      if (alert) alert.classList.remove('hidden');
      statusGerak = 'melaju_cepat';
    } else {
      if (alert) alert.classList.add('hidden');
      if (statusGerak === 'melaju_cepat') statusGerak = 'jalan';
    }

    try {
      await authFetch('/merchant/radar/ping', {
        method: 'POST',
        body: JSON.stringify({
          latitude: lat,
          longitude: lon,
          status_gerak: statusGerak,
          speed_kmh: speedKmh,
        }),
      });
    } catch (err) {
      console.error('Ping failed:', err);
    }
  }

  function handleLocationError(err) {
    console.error('GPS error:', err);
  }

  loadDashboardState();

  renderDashboard._cleanup = () => {
    if (intervalId) clearInterval(intervalId);
    tracker.stop();
    wakeLock.release();
  };

  return { cleanup: renderDashboard._cleanup };

  async function loadDashboardState() {
    try {
      const res = await authFetch('/merchant/dashboard');
      const json = await res.json();

      if (json.success && json.data) {
        const d = json.data;
        coinBalance = d.coin_balance;
        currentTier = d.current_tier;
        remainingQuota = d.remaining_free_quota_seconds;
        statusGerak = d.status_gerak;
        isRadarActive = d.is_radar_active;

        updateCoinDisplay();
        updateQuotaDisplay();
        updateTierUI();
        updateToggleUI();
        updateMovementUI();

        const pos = await tracker.getCurrent().catch(() => null);
        if (pos) {
          renderSuggestions('suggestions-container', pos.lat, pos.lon);
        }
      }
    } catch (err) {
      console.error('Load dashboard state failed:', err);
    }
  }
}
