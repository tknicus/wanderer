const CACHE_NAME = 'wanderer-cache-v9';

// Listahan sa mga importanteng files
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './wanderer.png',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/sweetalert2@11',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2'
];

// 1. INSTALL: Bulletproof Caching (I-cache tagsa-tagsa aron dili madamay ang uban kon naay mag-error)
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Nag-abli sa cache...');
      return Promise.all(
        urlsToCache.map(url => {
          return cache.add(url).catch(err => {
            console.warn('Wala na-cache ang file:', url, err);
            // Dili nato i-throw ang error aron magpadayon gihapon ang pag-cache sa uban!
          });
        })
      );
    }).then(() => self.skipWaiting())
  );
});

// 2. ACTIVATE: Limpyohan ang karaang cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Gipapas ang daan nga cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. FETCH: Strategy (Anti-Supabase Cache + Offline Fallback)
self.addEventListener('fetch', event => {
  // PANG-KONTRA SA SUPABASE CACHE: Bypass dayon kung database request
  if (event.request.url.includes('supabase.co')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // I-return kung naa sa cache
        if (response) {
          return response;
        }
        
        // Kung wala sa cache, kuhaon online
        return fetch(event.request).then(networkResponse => {
          if (event.request.url.startsWith('http')) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        // KUNG OFFLINE UG WALA SA CACHE: Ibalik ang index.html aron dili mo-crash ang PWA
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});