/**
 * Bottom Navigation component
 * 3-tab nav: Cari (map), Jualan (dashboard), Profil (profile)
 * Used in index.html as static HTML; this script handles active state + role-based visibility
 */

export function initBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  // Update active state based on current hash
  function updateActive() {
    const hash = window.location.hash.slice(1) || '/';
    const path = hash.split('?')[0];

    nav.querySelectorAll('.bottom-nav__item').forEach((item) => {
      const route = item.dataset.route;
      if (route === path) {
        item.classList.add('bottom-nav__item--active');
      } else {
        item.classList.remove('bottom-nav__item--active');
      }
    });
  }

  window.addEventListener('hashchange', updateActive);
  updateActive();
}
