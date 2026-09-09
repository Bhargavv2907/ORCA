// ============================================================
// ORCA Service Worker — Offline Caching & PWA Engine (Phase 12)
// Network-First with Cache-Fallback strategy for Marine APIs
// ============================================================

const CACHE_NAME = 'orca-marine-v1';
const PRECACHE_ASSETS = [
  '/',
  '/dashboard',
  '/assistant',
  '/map',
  '/manifest.json',
];

// 1. Install Event — Pre-cache core shell pages
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Activate Event — Clean up stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch Event — Network-First for API calls, Cache-First for static assets
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // API Requests -> Network First, Fallback to Cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;
            // Return offline synthetic JSON response if API is unreachable and uncached
            return new Response(
              JSON.stringify({
                dataStatus: 'OFFLINE_CACHE',
                source: 'ORCA Service Worker Offline Cache',
                timestamp: new Date().toISOString(),
                offlineWarning: 'Network disconnected. Serving cached marine conditions.',
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // Static Assets -> Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, networkResponse.clone()));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
