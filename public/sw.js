const CACHE_NAME = 'radarbokek-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/styles/tokens.css',
  '/src/styles/base.css',
  '/src/styles/components.css',
  '/src/app.js',
];

// Install — precache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate — cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls — network first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    );
    return;
  }

  // Static assets — cache first
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request))
  );
});

// Background Sync — flush offline queue
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-location-queue') {
    event.waitUntil(flushLocationQueue());
  }
});

async function flushLocationQueue() {
  // Will be implemented in Phase 1.8
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_LOCATION_QUEUE' });
  });
}
