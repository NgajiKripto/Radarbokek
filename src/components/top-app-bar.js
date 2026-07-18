/**
 * Top App Bar component
 * Shows brand + notification bell
 * Visibility controlled per-page
 */

export function showTopBar() {
  const bar = document.getElementById('top-app-bar');
  if (bar) bar.style.display = '';
}

export function hideTopBar() {
  const bar = document.getElementById('top-app-bar');
  if (bar) bar.style.display = 'none';
}

/**
 * Update notification badge count
 */
export function setNotificationCount(count) {
  const badge = document.getElementById('notification-badge');
  if (badge) {
    badge.textContent = count > 99 ? '99+' : count;
    badge.classList.toggle('hidden', count === 0);
  }
}
