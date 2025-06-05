const CACHE_NAME = 'globalmeetup-shell-v1';
const DYNAMIC_CACHE_NAME = 'globalmeetup-dynamic-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-144x144.png',
  '/offline.html' // Added offline page to cache
];

// install event - updated to include offline.html in shell cache
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install event');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Opened shell cache:', CACHE_NAME);
        const cachePromises = urlsToCache.map(urlToCache => {
          return cache.add(new Request(urlToCache, {cache: 'reload'})) // Force reload from network
            .catch(err => console.warn(`[Service Worker] Failed to cache ${urlToCache} into shell cache:`, err));
        });
        return Promise.all(cachePromises)
          .then(() => {
            console.log('[Service Worker] All specified shell assets attempted to cache.');
          });
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[Service Worker] Caching app shell failed overall:', error);
      })
  );
});

// activate event - remains the same as previous step (cleans old shell and dynamic caches)
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activate event');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName.startsWith('globalmeetup-shell')) {
            console.log('[Service Worker] Deleting old shell cache:', cacheName);
            return caches.delete(cacheName);
          }
          if (cacheName !== DYNAMIC_CACHE_NAME && cacheName.startsWith('globalmeetup-dynamic')) {
            console.log('[Service Worker] Deleting old dynamic cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Clients claimed');
      return self.clients.claim();
    })
  );
});

// fetch event - updated to serve offline.html for failed navigations
self.addEventListener('fetch', (event) => {
  const apiUrlPattern = '/api/';

  if (event.request.url.includes(apiUrlPattern) && event.request.method === 'GET') {
    // API GET Requests (Network First, then Cache)
    // console.log('[Service Worker] API GET Request (Network First):', event.request.url);
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            const responseToCache = networkResponse.clone();
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(() => {
          // console.log('[Service Worker] Network failed for API GET, trying cache:', event.request.url);
          return caches.match(event.request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                return cachedResponse;
              }
              // Optional: Return a specific JSON error for failed API calls when offline and not cached
              // return new Response(JSON.stringify({ error: "Offline and data not available" }),
              //                          { headers: { 'Content-Type': 'application/json' } });
              return undefined; // Results in a browser network error if not found.
            });
        })
    );
  } else if ( // Strategy for App Shell assets & Navigations (Cache first, then Network, with offline fallback for navigation)
    event.request.mode === 'navigate' ||
    (event.request.destination === 'style') ||
    (event.request.destination === 'script') ||
    (event.request.destination === 'manifest') ||
    (event.request.destination === 'image' && urlsToCache.some(url => event.request.url.endsWith(url)))
  ) {
    // console.log('[Service Worker] App Shell/Static/Navigate Request (Cache First):', event.request.url);
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Return cached response if found, otherwise fetch from network
          return response || fetch(event.request).catch(error => {
            // console.warn('[Service Worker] Network fetch failed for app shell/navigate:', event.request.url, error);
            // If it's a navigation request that failed, show the offline page
            if (event.request.mode === 'navigate') {
              console.log('[Service Worker] Serving offline.html for failed navigation to:', event.request.url);
              return caches.match('/offline.html');
            }
            // For other failed assets (CSS, JS, images), let the browser handle the error
            return undefined;
          });
        })
    );
  }
  // Other requests (e.g., API POST/PUT) are not handled by event.respondWith(),
  // so they pass through to the network by default.
});
