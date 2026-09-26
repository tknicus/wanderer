const CACHE_NAME = 'wonderer-cache-v3';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 1. Install Service Worker ug i-cache ang core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// 2. Activate ug limpyo sa daan nga cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Fetch strategy uban ang Navigation Fallback para sa Offline Mode
self.addEventListener('fetch', event => {
  // Kung ang gipangayo kay ang tibuok page navigation (pag-abli sa app)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html').then(response => {
        return response || fetch(event.request);
      }).catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Alang sa ubang files (CSS, JS, images, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      }).catch(() => {
        // Safe fallback kung offline ug walay cache
      })
  );
});