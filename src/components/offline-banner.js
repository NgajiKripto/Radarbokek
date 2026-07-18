/**
 * Offline banner component
 * Shows warning when network is unavailable
 */

/**
 * Initialize offline banner
 */
export function initOfflineBanner() {
  const banner = document.getElementById('offline-banner');
  if (!banner) return;

  function show() {
    banner.classList.remove('hidden');
  }

  function hide() {
    banner.classList.add('hidden');
  }

  // Initial state
  if (!navigator.onLine) show();

  window.addEventListener('online', hide);
  window.addEventListener('offline', show);

  return { show, hide, isShown: () => !banner.classList.contains('hidden') };
}
