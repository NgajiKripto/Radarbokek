/* Hallmark · component: vendor-card · modern-minimal · design-system: design.md */
import { formatDistance } from '../lib/haversine.js';
import { encodeHTML } from '../lib/sanitizer.js';

export function renderVendorCard(vendor, userLat, userLon) {
  const sheet = document.getElementById('bottom-sheet');
  const card = document.getElementById('vendor-card');
  if (!sheet || !card) return;

  const name = encodeHTML(vendor.business_name || '');
  const category = encodeHTML(vendor.category || '');
  const imgUrl = encodeHTML(vendor.menu_spanduk_url || '');
  const ratingVal = vendor.reputasi?.rating_rata_rata;
  const ulasanCount = vendor.reputasi?.total_ulasan;

  let distText = '—';
  if (userLat != null && userLon != null && vendor.lat != null && vendor.lon != null) {
    if (vendor.estimasi_jarak_meter != null) {
      distText = formatDistance(vendor.estimasi_jarak_meter);
    }
  }

  const qrisTag = vendor.metode_pembayaran?.includes('QRIS')
    ? '<span class="px-1.5 py-0.5 rounded-pill bg-teal/10 border border-teal/30 text-teal font-mono text-[10px] font-medium">QRIS</span>'
    : '';
  const cashTag = vendor.metode_pembayaran?.includes('CASH')
    ? '<span class="px-1.5 py-0.5 rounded-pill bg-ink/10 border border-ink/20 text-ink font-mono text-[10px] font-medium">CASH</span>'
    : '';

  const imgHtml = imgUrl
    ? `<img src="${imgUrl}" alt="${name}" class="w-20 h-20 object-cover rounded-md border border-rule" />`
    : `<div class="w-20 h-20 rounded-md border border-rule bg-paper-2 flex items-center justify-center shrink-0">
        <span class="material-symbols-outlined text-3xl text-ink-2">restaurant</span>
      </div>`;

  const starHtml = (ratingVal != null && ulasanCount != null)
    ? `<span class="flex items-center text-highlight-ink font-mono text-label-sm" style="font-size: 11px;">
        <span class="material-symbols-outlined text-sm mr-0.5" style="font-variation-settings: 'FILL' 1;">star</span>
        ${Number(ratingVal)} (${Number(ulasanCount)})
      </span>`
    : '';

  const priceNum = Number(vendor.price_baseline) || 0;
  const priceDisplay = priceNum >= 1000
    ? `Rp${(priceNum / 1000).toFixed(0)}k`
    : `Rp${priceNum}`;

  card.innerHTML = `
    ${imgHtml}
    <div class="flex-grow flex flex-col justify-between py-0.5 min-w-0">
      <div>
        <h3 class="font-body text-body font-semibold text-ink leading-tight truncate">${name}</h3>
        <div class="flex items-center gap-2 mt-1">${starHtml}</div>
      </div>
      <div class="flex items-center gap-1 text-ink-2 font-mono text-label-sm" style="font-size: 11px;">
        <span class="material-symbols-outlined text-sm">near_me</span>
        ${distText}
      </div>
    </div>
    <div class="flex flex-col justify-between items-end shrink-0">
      <div class="text-right">
        <p class="font-mono text-label-sm text-ink-2 leading-none mb-1" style="font-size: 10px;">Mulai</p>
        <p class="font-display text-headline-sm text-accent leading-none" style="font-family: var(--font-display);">${priceDisplay}</p>
      </div>
      <div class="flex gap-1">${qrisTag}${cashTag}</div>
    </div>
  `;

  sheet.classList.remove('hidden');
}

export function hideVendorCard() {
  const sheet = document.getElementById('bottom-sheet');
  if (sheet) sheet.classList.add('hidden');
}
