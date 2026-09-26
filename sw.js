const CACHE_NAME = 'wonderer-cache-v1';
const urlsToCache = [
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://lh3.googleusercontent.com/d/15aQxvPrKO7S2lVUdhQ99BrwpJqcNKohl'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Fallback kung offline ug walay cache
        });
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            return cache.delete(cacheName);
          }
        })
      );
    })
  );
});