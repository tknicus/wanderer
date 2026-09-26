const CACHE_NAME = 'wonderer-cache-v2';
const urlsToCache = [
  './index.html',
  './manifest.json'
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://lh3.googleusercontent.com/d/15aQxvPrKO7S2lVUdhQ99BrwpJqcNKohl'  
];

// 1. Install Service Worker ug i-cache ang core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
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

// 3. Fetch strategy: Kuha sa cache, kung wala kay kuha sa network ug i-save sa cache
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response; // Nakita sa cache (Pwedeng offline)
        }
        return fetch(event.request).then(networkResponse => {
          // I-save sa cache ang bag-ong nakuha gikan sa network para magamit sunod
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        }).catch(() => {
          // Kung offline ug walay cache para ani nga request
        });
      })
  );
});