/* Hallmark · genre: modern-minimal · macrostructure: Long Form · design-system: design.md
 * theme: custom (warm-terakota) · topup page · designed-as-app
 */
import { isAuthenticated, authFetch, getToken } from '../lib/auth.js';
import { API_BASE, TOPUP_MIN_RUPIAH } from '../config/constants.js';

export async function renderTopup() {
  if (!isAuthenticated()) {
    window.location.hash = '/';
    return;
  }

  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = '';

  let coinBalance = 0;
  try {
    const res = await authFetch('/merchant/dashboard');
    const json = await res.json();
    if (json.success && json.data) {
      coinBalance = json.data.coin_balance;
    }
  } catch (err) {
    console.error('Failed to fetch balance:', err);
  }

  app.innerHTML = `
    <div class="px-margin-mobile flex flex-col gap-md pb-28">
      <!-- Header -->
      <div class="pt-xs">
        <h2 class="font-display text-headline text-ink" style="font-family: var(--font-display);">Isi Saldo Koin</h2>
        <p class="font-body text-body-sm text-ink-2 mt-2xs">
          Saldo untuk mengaktifkan paket Standard atau Pro.
        </p>
      </div>

      <!-- Balance -->
      <section class="card flex items-center justify-between">
        <div>
          <p class="font-mono text-label-sm text-ink-2 uppercase tracking-wider">Saldo Saat Ini</p>
          <p class="font-display text-display-s text-accent" style="font-family: var(--font-display);" id="current-balance">Rp${coinBalance.toLocaleString('id-ID')}</p>
        </div>
        <div class="w-12 h-12 rounded-lg bg-paper-2 flex items-center justify-center">
          <span class="material-symbols-outlined text-2xl text-accent" style="font-variation-settings: 'FILL' 1;">account_balance_wallet</span>
        </div>
      </section>

      <!-- Nominal Selection -->
      <section class="flex flex-col gap-sm">
        <p class="font-body text-label font-semibold text-ink">Pilih Nominal</p>
        <div class="grid grid-cols-2 gap-sm" id="nominal-grid">
          <button class="nominal-btn card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm" data-amount="10000">
            <span class="font-display text-headline-sm text-ink" style="font-family: var(--font-display);">Rp10.000</span>
          </button>
          <button class="nominal-btn card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm" data-amount="25000">
            <span class="font-display text-headline-sm text-ink" style="font-family: var(--font-display);">Rp25.000</span>
          </button>
          <button class="nominal-btn card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm" data-amount="50000">
            <span class="font-display text-headline-sm text-ink" style="font-family: var(--font-display);">Rp50.000</span>
          </button>
          <button class="nominal-btn card text-center hover:border-ink-2 transition-colors cursor-pointer py-sm" data-amount="100000">
            <span class="font-display text-headline-sm text-ink" style="font-family: var(--font-display);">Rp100.000</span>
          </button>
        </div>
        <p class="font-mono text-label-sm text-ink-2">Minimum Rp${TOPUP_MIN_RUPIAH.toLocaleString('id-ID')}</p>
      </section>

      <!-- QRIS Display -->
      <section id="qris-section" class="hidden card text-center flex-col gap-md">
        <p class="font-body text-label font-semibold text-ink">Pindai QRIS Berikut</p>
        <div class="w-44 h-44 mx-auto border border-rule rounded-md bg-paper-2 flex items-center justify-center overflow-hidden">
          <img id="qris-image" class="w-full h-full object-contain" src="" alt="QR Code" style="display:none" />
          <span id="qris-placeholder" class="material-symbols-outlined text-5xl text-ink-2">qr_code_2</span>
        </div>
        <p class="font-body text-body text-ink" id="qris-amount-text">Rp0</p>
        <p class="font-mono text-label-sm text-ink-2">ID: <span id="qris-tx-id">—</span></p>
        <p class="font-mono text-label-sm text-ink-2">Status: <span id="qris-status" class="text-accent font-semibold">Menunggu Pembayaran</span></p>
      </section>

      <!-- Info -->
      <section class="rounded-md bg-paper-2 border border-rule p-sm">
        <p class="font-body text-body-sm text-ink-2">
          Saldo koin bersifat <strong class="text-ink">non-refundable</strong> dan hanya untuk hak tayang di Radar Bokek.
          Konversi: <strong class="text-ink">Rp1.000 = 1 Koin</strong>
        </p>
      </section>
    </div>
  `;

  let selectedAmount = null;
  let currentTxId = null;

  document.querySelectorAll('.nominal-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      selectedAmount = Number(btn.dataset.amount);
      document.querySelectorAll('.nominal-btn').forEach((b) => {
        b.classList.remove('border-accent', 'bg-accent/5');
        b.classList.add('border-rule');
      });
      btn.classList.remove('border-rule');
      btn.classList.add('border-accent', 'bg-accent/5');

      generateQRIS(selectedAmount);
    });
  });

  async function generateQRIS(amount) {
    const section = document.getElementById('qris-section');
    const amountText = document.getElementById('qris-amount-text');
    const txId = document.getElementById('qris-tx-id');
    const statusEl = document.getElementById('qris-status');

    try {
      const res = await authFetch('/merchant/wallet/topup', {
        method: 'POST',
        body: JSON.stringify({ amount_rupiah: amount }),
      });
      const data = await res.json();

      if (data.success) {
        amountText.textContent = `Rp${amount.toLocaleString('id-ID')}`;
        txId.textContent = data.transaction_id;
        currentTxId = data.transaction_id;
        if (statusEl) statusEl.textContent = 'Menunggu Pembayaran';
        section.classList.remove('hidden');
        section.style.display = 'flex';

        const qrisImg = document.getElementById('qris-image');
        const qrisPlaceholder = document.getElementById('qris-placeholder');
        if (qrisImg && qrisPlaceholder) {
          qrisImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(data.qris_string)}`;
          qrisImg.style.display = 'block';
          qrisPlaceholder.style.display = 'none';
          qrisImg.onerror = () => {
            qrisImg.style.display = 'none';
            qrisPlaceholder.style.display = 'block';
          };
        }
      } else {
        alert(data.message || 'Gagal membuat permintaan top-up');
      }
    } catch (err) {
      console.error('Top-up request failed:', err);
      alert('Gagal terhubung ke server. Silakan coba lagi.');
    }
  }
}
