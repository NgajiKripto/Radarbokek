import { Router } from './lib/router.js';
import { renderLanding } from './pages/landing.js';
import { renderMap } from './pages/map.js';
import { renderDashboard } from './pages/dashboard.js';
import { renderProfile } from './pages/profile.js';
import { renderTopup } from './pages/topup.js';
import { renderAuth } from './pages/auth.js';
import { isOnline, drainQueue } from './lib/offline-queue.js';
import { authFetch, isAuthenticated, getRole } from './lib/auth.js';

// Initialize router
const router = new Router();

router
  .on('/', () => renderLanding())
  .on('/map', () => renderMap())
  .on('/login', () => renderAuth('login'))
  .on('/register', () => renderAuth('register'))
  .on('/merchant/dashboard', () => renderDashboard())
  .on('/merchant/profile', () => renderProfile())
  .on('/merchant/topup', () => renderTopup());

// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch((err) => {
    console.error('SW registration failed:', err);
  });

  // Listen for sync messages from SW
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data.type === 'SYNC_LOCATION_QUEUE') {
      flushOfflineQueue();
    }
  });
}

// Offline/Online detection
window.addEventListener('online', () => {
  document.getElementById('offline-banner')?.classList.add('hidden');
  flushOfflineQueue();
});

window.addEventListener('offline', () => {
  document.getElementById('offline-banner')?.classList.remove('hidden');
});

// Flush offline location queue
async function flushOfflineQueue() {
  if (!isOnline()) return;
  try {
    const items = await drainQueue();
    for (const item of items) {
      await authFetch('/merchant/radar/ping', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    }
  } catch (err) {
    console.error('Queue flush failed:', err);
  }
}

// Update bottom nav based on auth state
function updateBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  const isAuth = isAuthenticated();
  const role = getRole();

  // Jualan & Profil tabs only for authenticated merchants
  const merchantTabs = nav.querySelectorAll('[data-route="/merchant/dashboard"], [data-route="/merchant/profile"]');
  merchantTabs.forEach(tab => {
    if (isAuth && role === 'merchant') {
      tab.style.display = '';
    } else {
      tab.style.display = 'none';
    }
  });
}

// Listen for auth changes (hashchange + custom authchange event for same-tab login)
window.addEventListener('hashchange', updateBottomNav);
window.addEventListener('authchange', updateBottomNav);

// Start app
router.start();
updateBottomNav();
