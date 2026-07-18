/* Hallmark · component: vendor-marker · modern-minimal · design-system: design.md */

export function createVendorMarkerIcon(type) {
  const L = window.L;
  if (!L) return null;

  let colorClass = 'bg-highlight text-highlight-ink';
  let icon = 'restaurant';
  let extraClass = '';
  let labelHtml = '';

  if (type === 'pro') {
    colorClass = 'bg-accent text-accent-ink';
    icon = 'verified';
    extraClass = 'marker-pulse';
    labelHtml = `<div class="absolute -top-5 left-4 bg-ink text-accent font-mono text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap" style="font-family: var(--font-mono);">
      PRO
    </div>`;
  } else if (type === 'muted') {
    colorClass = 'bg-paper-3 text-ink-2';
    icon = 'speed';
    extraClass = 'opacity-40';
    labelHtml = `<div class="absolute -top-5 -left-2 bg-error/10 text-error font-mono text-[10px] px-1.5 py-0.5 rounded-sm whitespace-nowrap" style="font-family: var(--font-mono);">
      Melaju Cepat
    </div>`;
  }

  return L.divIcon({
    className: `custom-div-icon relative ${extraClass}`,
    html: `<div class="inline-block relative w-9 h-9 flex items-center justify-center rounded-md border border-ink/20 ${colorClass}" style="box-shadow: 0 2px 6px oklch(15% 0.01 60 / 0.15);">
      <span class="material-symbols-outlined text-lg">${icon}</span>
      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 border-ink/20 rotate-45" style="background: inherit; border-right: 1px solid oklch(15% 0.01 60 / 0.2); border-bottom: 1px solid oklch(15% 0.01 60 / 0.2);"></div>
    </div>${labelHtml}`,
    iconSize: type === 'muted' ? [100, 50] : [44, 50],
    iconAnchor: type === 'muted' ? [50, 50] : [22, 50],
    popupAnchor: [0, -50],
  });
}

export function getMarkerType(vendor) {
  if (vendor.status_gerak === 'melaju_cepat') return 'muted';
  if (vendor.current_tier === 'pro') return 'pro';
  return 'standard';
}
