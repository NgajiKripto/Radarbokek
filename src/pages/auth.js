/* Hallmark · genre: modern-minimal · macrostructure: Long Form · design-system: design.md
 * theme: custom (warm-terakota) · auth page · designed-as-app
 */
import { login, register, isAuthenticated } from '../lib/auth.js';

export function renderAuth(mode = 'login') {
  if (isAuthenticated()) {
    window.location.hash = '/merchant/dashboard';
    return;
  }

  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = '';

  let currentMode = mode;

  function renderForm() {
    const isLogin = currentMode === 'login';

    app.innerHTML = `
      <div class="px-margin-mobile flex flex-col gap-lg pt-lg pb-xl">
        <!-- Header -->
        <section class="text-center">
          <div class="w-16 h-16 rounded-xl bg-accent/10 flex items-center justify-center mx-auto mb-md">
            <span class="material-symbols-outlined text-accent text-[36px]" style="font-variation-settings: 'FILL' 1;">storefront</span>
          </div>
          <h2 class="font-display text-headline text-ink" style="font-family: var(--font-display);">${isLogin ? 'Masuk' : 'Daftar Akun'}</h2>
          <p class="font-body text-body-sm text-ink-2 mt-2xs">
            ${isLogin ? 'Kelola lapakmu' : 'Mulai berjualan di Radar Bokek'}
          </p>
        </section>

        <!-- Form -->
        <form id="auth-form" class="flex flex-col gap-md">
          <!-- Email -->
          <div class="flex flex-col gap-2xs">
            <label class="font-body text-label font-semibold text-ink">Email</label>
            <input type="email" id="input-email" required
              class="w-full border border-rule rounded-md p-sm font-body text-body text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 bg-paper outline-none transition-colors"
              placeholder="contoh@email.com" />
          </div>

          <!-- Password -->
          <div class="flex flex-col gap-2xs">
            <label class="font-body text-label font-semibold text-ink">Password</label>
            <input type="password" id="input-password" required minlength="6"
              class="w-full border border-rule rounded-md p-sm font-body text-body text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 bg-paper outline-none transition-colors"
              placeholder="Minimal 6 karakter" />
          </div>

          ${!isLogin ? `
          <input type="hidden" id="input-role" value="merchant" />
          <p class="font-body text-body-sm text-ink-2 text-center">Akun hanya untuk pedagang. Pembeli bisa langsung pakai tanpa daftar.</p>
          ` : ''}

          <!-- Error message -->
          <div id="error-msg" class="hidden rounded-md bg-error/10 border border-error/30 p-sm font-body text-body-sm text-error">
          </div>

          <!-- Submit -->
          <button type="submit" id="btn-submit"
            class="btn-pill btn-pill--primary w-full py-3 text-body">
            ${isLogin ? 'Masuk' : 'Daftar'}
            <span class="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </form>

        <!-- Toggle mode -->
        <section class="text-center">
          <p class="font-body text-body-sm text-ink-2">
            ${isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
            <button id="toggle-mode" class="text-accent font-semibold ml-1 hover:underline">
              ${isLogin ? 'Daftar' : 'Masuk'}
            </button>
          </p>
        </section>
      </div>
    `;

    document.getElementById('auth-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('input-email').value.trim();
      const password = document.getElementById('input-password').value;
      const errorMsg = document.getElementById('error-msg');
      const btn = document.getElementById('btn-submit');

      btn.disabled = true;
      btn.textContent = 'Memproses...';
      errorMsg.classList.add('hidden');

      try {
        let result;

        if (isLogin) {
          result = await login(email, password);
        } else {
          const role = document.getElementById('input-role').value;
          result = await register(email, password, role);
          if (result.success) {
            result = await login(email, password);
          }
        }

        if (result.success) {
          const role = result.role || localStorage.getItem('rb_role');
          if (role === 'merchant') {
            window.location.hash = '/merchant/dashboard';
          } else {
            window.location.hash = '/map';
          }
        } else {
          errorMsg.textContent = result.message || 'Terjadi kesalahan';
          errorMsg.classList.remove('hidden');
        }
      } catch (err) {
        errorMsg.textContent = 'Gagal terhubung ke server';
        errorMsg.classList.remove('hidden');
      } finally {
        btn.disabled = false;
        btn.innerHTML = `${isLogin ? 'Masuk' : 'Daftar'} <span class="material-symbols-outlined text-lg">arrow_forward</span>`;
      }
    });

    document.getElementById('toggle-mode').addEventListener('click', () => {
      currentMode = currentMode === 'login' ? 'register' : 'login';
      renderForm();
    });
  }

  renderForm();
}
