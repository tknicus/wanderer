const CACHE_NAME = 'wanderer-cache-v8';
const urlsToCache = [
  './',
  './index.html',
  './wanderer.png',
  './manifest.json', // Gi-dungangan nako og comma diri, Boss!
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://lh3.googleusercontent.com/d/15aQxvPrKO7S2lVUdhQ99BrwpJqcNKohl'
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

// 3. Fetch strategy uban ang saktong Cache-First Navigation Fallback
self.addEventListener('fetch', event => {
  // PANG-KONTRA SA SUPABASE CACHE:
  // Kon ang gipangayo nga data gikan sa Supabase, AYAW I-CACHE! Kuhaa diretso sa internet.
  if (event.request.url.includes('supabase.co')) {
    return; // Mo-bypass ni sa Service Worker aron presko pirme ang database results.
  }

  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('./index.html')
        .then(cachedResponse => {
          if (cachedResponse) return cachedResponse;
          return caches.match('./');
        })
        .then(response => {
          return response || fetch(event.request);
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request).then(networkResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            // I-cache lang ang mga regular http/https requests, ayaw apila ang uban
            if (event.request.url.startsWith('http')) {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          });
        });
      }).catch(() => {
        // Safe fallback kung offline
      })
  );
});