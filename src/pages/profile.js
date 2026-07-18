/* Hallmark · genre: modern-minimal · macrostructure: Long Form · design-system: design.md
 * theme: custom (warm-terakota) · profile page · designed-as-app
 */
import { isAuthenticated, authFetch } from '../lib/auth.js';
import { sanitizeText, isValidPrice } from '../lib/sanitizer.js';
import { compressImage } from '../lib/image-compressor.js';

const CATEGORIES = ['Makanan', 'Minuman'];

export function renderProfile() {
  if (!isAuthenticated()) {
    window.location.hash = '/';
    return;
  }

  const app = document.getElementById('app');
  const topBar = document.getElementById('top-app-bar');
  topBar.style.display = '';

  app.innerHTML = `
    <div class="px-margin-mobile flex flex-col gap-md pb-xl">
      <!-- Header -->
      <div class="pt-xs">
        <h2 class="font-display text-headline text-ink" style="font-family: var(--font-display);">Profil Dagangan</h2>
        <p class="font-body text-body-sm text-ink-2 mt-2xs">Kelola informasi jualanmu</p>
      </div>

      <!-- Profile Header -->
      <section class="card flex items-center gap-md">
        <div class="w-16 h-16 rounded-lg bg-paper-2 border border-rule relative cursor-pointer overflow-hidden shrink-0" id="avatar-area" title="Ganti foto profil">
          <img id="avatar-preview" class="w-full h-full object-cover hidden" src="" alt="Foto Profil" />
          <span id="avatar-placeholder" class="material-symbols-outlined text-3xl text-ink-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">store</span>
          <div class="absolute -bottom-1 -right-1 bg-accent text-accent-ink p-1 rounded-md flex items-center justify-center">
            <span class="material-symbols-outlined text-xs">edit</span>
          </div>
        </div>
        <input type="file" id="input-avatar" accept="image/jpeg,image/png,image/webp" class="hidden" />
        <div>
          <h3 class="font-body text-body font-semibold text-ink" id="profile-name">Nama Dagangan</h3>
          <span class="inline-flex items-center px-2 py-0.5 rounded-pill bg-teal text-teal-ink font-mono text-label-sm mt-2xs" id="profile-tier" style="font-size: 10px;">TIER: FREE</span>
        </div>
      </section>

      <!-- Form -->
      <section class="flex flex-col gap-md">
        <!-- Business Name -->
        <div class="flex flex-col gap-2xs">
          <label class="font-body text-label font-semibold text-ink">Nama Dagangan</label>
          <div class="relative">
            <input type="text" id="input-name" maxlength="40" required
              class="w-full border border-rule rounded-md p-sm font-body text-body text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 bg-paper outline-none transition-colors"
              placeholder="Masukkan nama dagangan" />
            <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-ink-2 text-lg">store</span>
          </div>
          <p class="font-mono text-label-sm text-ink-2" id="name-counter">0/40</p>
        </div>

        <!-- Category + Price -->
        <div class="grid grid-cols-2 gap-md">
          <div class="flex flex-col gap-2xs">
            <label class="font-body text-label font-semibold text-ink">Kategori</label>
            <div class="relative">
              <select id="input-category"
                class="w-full border border-rule rounded-md p-sm font-body text-body text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 bg-paper appearance-none outline-none transition-colors">
                ${CATEGORIES.map((c) => `<option value="${c}">${c}</option>`).join('')}
              </select>
              <span class="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined pointer-events-none text-ink-2">expand_more</span>
            </div>
          </div>

          <div class="flex flex-col gap-2xs">
            <label class="font-body text-label font-semibold text-ink">Harga Mulai</label>
            <div class="relative flex items-center">
              <span class="absolute left-3 font-mono text-label font-semibold text-ink-2">Rp</span>
              <input type="number" id="input-price" min="0" max="1000000"
                class="w-full border border-rule rounded-md p-sm pl-10 font-mono text-label text-ink focus:border-accent focus:ring-2 focus:ring-accent/20 bg-paper outline-none transition-colors"
                placeholder="0" />
            </div>
          </div>
        </div>

        <!-- Upload -->
        <div class="flex flex-col gap-2xs">
          <label class="font-body text-label font-semibold text-ink">Foto Spanduk Menu</label>
          <div class="upload-area h-36 w-full flex flex-col items-center justify-center gap-2xs bg-paper cursor-pointer" id="upload-area">
            <span class="material-symbols-outlined text-3xl text-ink-2">add_a_photo</span>
            <p class="font-body text-body-sm text-ink-2">Tap untuk unggah foto</p>
            <p class="font-body text-body-sm text-ink-2/60">JPG, PNG maks 5MB</p>
          </div>
          <input type="file" id="input-photo" accept="image/jpeg,image/png" class="hidden" />
        </div>

        <!-- QRIS Tip -->
        <div class="flex flex-col gap-2xs">
          <div class="flex items-center gap-1.5">
            <label class="font-body text-label font-semibold text-ink">QRIS Tip Mandiri</label>
            <span class="material-symbols-outlined text-accent text-sm" title="Khusus akun Pro">info</span>
          </div>
          <div class="h-28 w-full flex items-center justify-center gap-2 bg-paper cursor-pointer hover:bg-paper-2 transition-colors border border-rule border-dashed rounded-md" id="qris-upload-area">
            <img id="qris-preview" class="h-full object-contain hidden" src="" alt="QRIS Preview" />
            <span id="qris-placeholder-text" class="flex items-center gap-2 text-ink-2">
              <span class="material-symbols-outlined text-2xl">qr_code_2</span>
              <span class="font-body text-body-sm">Tap unggah foto QRIS</span>
            </span>
          </div>
          <input type="file" id="input-qris-photo" accept="image/jpeg,image/png,image/webp" class="hidden" />
          <p class="font-body text-body-sm text-ink-2">Pelanggan bisa kirim tip langsung ke dompetmu.</p>
        </div>
      </section>

      <!-- Save -->
      <button id="btn-save" class="btn-pill btn-pill--primary w-full py-3 text-body mt-sm">
        <span class="material-symbols-outlined text-lg">save</span>
        Simpan Perubahan
      </button>
    </div>
  `;

  // Char counter
  const nameInput = document.getElementById('input-name');
  const nameCounter = document.getElementById('name-counter');
  nameInput.addEventListener('input', () => {
    nameCounter.textContent = `${nameInput.value.length}/40`;
  });

  // Avatar upload
  const avatarArea = document.getElementById('avatar-area');
  const avatarInput = document.getElementById('input-avatar');
  let avatarBlob = null;

  avatarArea.addEventListener('click', () => avatarInput.click());
  avatarInput.addEventListener('change', async () => {
    if (avatarInput.files.length > 0) {
      const file = avatarInput.files[0];
      if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); avatarInput.value = ''; return; }
      if (!file.type.match(/image\/(jpeg|png|webp)/)) { alert('Format tidak didukung.'); avatarInput.value = ''; return; }
      try {
        const result = await compressImage(file, { maxWidth: 400, maxHeight: 400, quality: 0.7 });
        avatarBlob = result.blob;
        const preview = document.getElementById('avatar-preview');
        const placeholder = document.getElementById('avatar-placeholder');
        preview.src = result.url;
        preview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      } catch (err) {
        console.error('Avatar compression failed:', err);
        alert('Gagal mengompresi foto profil.');
      }
    }
  });

  // Spanduk upload
  const uploadArea = document.getElementById('upload-area');
  const fileInput = document.getElementById('input-photo');
  let compressedBlob = null;

  uploadArea.addEventListener('click', () => fileInput.click());
  fileInput.addEventListener('change', async () => {
    if (fileInput.files.length > 0) {
      const file = fileInput.files[0];
      if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); fileInput.value = ''; return; }
      if (!file.type.match(/image\/(jpeg|png|webp)/)) { alert('Format tidak didukung.'); fileInput.value = ''; return; }

      uploadArea.innerHTML = `
        <span class="material-symbols-outlined text-3xl text-accent animate-spin">sync</span>
        <p class="font-body text-body-sm text-ink-2">Mengompresi...</p>
      `;

      try {
        const result = await compressImage(file, { maxWidth: 800, maxHeight: 800, quality: 0.7 });
        compressedBlob = result.blob;

        const savingsPct = Math.round((1 - result.compressedSize / result.originalSize) * 100);
        uploadArea.innerHTML = `
          <span class="material-symbols-outlined text-3xl text-teal">check_circle</span>
          <p class="font-body text-body-sm text-ink"></p>
          <p class="font-body text-body-sm text-ink-2">
            ${(result.compressedSize / 1024).toFixed(0)}KB (hemat ${savingsPct}%) · ${result.width}×${result.height} WebP
          </p>
        `;
        uploadArea.querySelector('p').textContent = file.name;
      } catch (err) {
        console.error('Compression failed:', err);
        uploadArea.innerHTML = `
          <span class="material-symbols-outlined text-3xl text-error">error</span>
          <p class="font-body text-body-sm text-ink-2">Gagal mengompresi. Coba lagi.</p>
        `;
        compressedBlob = null;
      }
    }
  });

  // QRIS upload
  const qrisUploadArea = document.getElementById('qris-upload-area');
  const qrisInput = document.getElementById('input-qris-photo');
  let qrisBlob = null;

  if (qrisUploadArea) {
    qrisUploadArea.addEventListener('click', () => qrisInput.click());
    qrisInput.addEventListener('change', async () => {
      if (qrisInput.files.length > 0) {
        const file = qrisInput.files[0];
        if (file.size > 5 * 1024 * 1024) { alert('Ukuran file maksimal 5MB'); qrisInput.value = ''; return; }
        if (!file.type.match(/image\/(jpeg|png|webp)/)) { alert('Format tidak didukung.'); qrisInput.value = ''; return; }
        try {
          const result = await compressImage(file, { maxWidth: 600, maxHeight: 600, quality: 0.7 });
          qrisBlob = result.blob;
          const preview = document.getElementById('qris-preview');
          const placeholder = document.getElementById('qris-placeholder-text');
          preview.src = result.url;
          preview.classList.remove('hidden');
          if (placeholder) placeholder.classList.add('hidden');
        } catch (err) {
          console.error('QRIS compression failed:', err);
          alert('Gagal mengompresi foto QRIS.');
        }
      }
    });
  }

  // Load profile
  loadProfileData();

  async function loadProfileData() {
    try {
      const res = await authFetch('/merchant/profile');
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (nameInput) nameInput.value = d.business_name || '';
        nameCounter.textContent = `${(d.business_name || '').length}/40`;
        if (d.category) {
          const catSelect = document.getElementById('input-category');
          if (catSelect) catSelect.value = d.category;
        }
        if (d.price_baseline) {
          const priceInput = document.getElementById('input-price');
          if (priceInput) priceInput.value = d.price_baseline;
        }
        document.getElementById('profile-name').textContent = d.business_name || 'Nama Dagangan';
        document.getElementById('profile-tier').textContent = `TIER: ${(d.current_tier || 'free').toUpperCase()}`;

        if (d.profile_photo_url) {
          const preview = document.getElementById('avatar-preview');
          const placeholder = document.getElementById('avatar-placeholder');
          preview.src = d.profile_photo_url;
          preview.classList.remove('hidden');
          placeholder.classList.add('hidden');
        }

        if (d.qris_tip_photo_url) {
          const preview = document.getElementById('qris-preview');
          const placeholder = document.getElementById('qris-placeholder-text');
          preview.src = d.qris_tip_photo_url;
          preview.classList.remove('hidden');
          if (placeholder) placeholder.classList.add('hidden');
        }
      }
    } catch (err) {
      console.error('Load profile failed:', err);
    }
  }

  // Save
  document.getElementById('btn-save').addEventListener('click', async () => {
    const name = sanitizeText(nameInput.value, 40);
    const category = document.getElementById('input-category').value;
    const price = document.getElementById('input-price').value;

    if (name.length < 3) { alert('Nama dagangan minimal 3 karakter'); return; }
    if (!isValidPrice(price)) { alert('Harga tidak valid'); return; }

    const btn = document.getElementById('btn-save');
    btn.innerHTML = '<span class="material-symbols-outlined animate-spin text-lg">sync</span> Menyimpan...';
    btn.disabled = true;

    try {
      let menuSpandukUrl = null;
      let avatarUrl = null;
      let qrisPhotoUrl = null;

      if (avatarBlob) {
        const formData = new FormData();
        formData.append('photo', avatarBlob, 'avatar.webp');
        const uploadRes = await authFetch('/merchant/upload/avatar', { method: 'POST', headers: {}, body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) avatarUrl = uploadData.url;
      }

      if (compressedBlob) {
        const formData = new FormData();
        formData.append('spanduk', compressedBlob, 'spanduk.webp');
        const uploadRes = await authFetch('/merchant/upload', { method: 'POST', headers: {}, body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) menuSpandukUrl = uploadData.url;
      }

      if (qrisBlob) {
        const formData = new FormData();
        formData.append('photo', qrisBlob, 'qris.webp');
        const uploadRes = await authFetch('/merchant/upload/qris', { method: 'POST', headers: {}, body: formData });
        const uploadData = await uploadRes.json();
        if (uploadData.success) qrisPhotoUrl = uploadData.url;
      }

      const res = await authFetch('/merchant/profile', {
        method: 'PUT',
        body: JSON.stringify({
          business_name: name,
          category,
          price_baseline: Number(price),
          menu_spanduk_url: menuSpandukUrl,
          profile_photo_url: avatarUrl,
          qris_tip_photo_url: qrisPhotoUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        btn.innerHTML = '<span class="material-symbols-outlined text-lg">check_circle</span> Tersimpan';
        document.getElementById('profile-name').textContent = name;
        compressedBlob = null;
        avatarBlob = null;
        qrisBlob = null;
        setTimeout(() => {
          btn.innerHTML = '<span class="material-symbols-outlined text-lg">save</span> Simpan Perubahan';
          btn.disabled = false;
        }, 2000);
      }
    } catch (err) {
      btn.innerHTML = '<span class="material-symbols-outlined text-lg">error</span> Gagal';
      setTimeout(() => {
        btn.innerHTML = '<span class="material-symbols-outlined text-lg">save</span> Simpan Perubahan';
        btn.disabled = false;
      }, 2000);
    }
  });
}
