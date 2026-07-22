const CACHE_NAME = 'kriolu-app-v4';
const ASSETS = [
  '/kriolu/',
  '/kriolu/index.html',
  '/kriolu/styles.css?v=20260722b',
  '/kriolu/app.js?v=20260722',
  '/kriolu/dictionary.json',
  '/kriolu/manifest.webmanifest',
  '/kriolu/icons/apple-touch-icon.png',
  '/kriolu/icons/icon-192.png',
  '/kriolu/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin + '/kriolu/')) return;

  event.respondWith(
    caches.match(event.request)
      .then((cached) => cached || fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        }))
  );
});
