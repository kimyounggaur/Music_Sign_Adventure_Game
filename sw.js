const CACHE_NAME = 'melodia-v0.1-20260709';

// Update CACHE_NAME whenever index.html or the asset list changes for a fresh offline bundle.
const PRECACHE = [
  './index.html',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './01 Source/G Clef/G Clef.png',
  './01 Source/F Clef/F Clef.png',
  './01 Source/C Clef/C Clef.png',
  './01 Source/Eight Rest/Eight Rest.png',
  './01 Source/Fermata/Fermata.png',
  './01 Source/Segno/Segno.png',
  './01 Source/Repeat-Sign 1/Repeat-Sign 1.png',
  './01 Source/Repeat-Sign 2/Repeat-Sign 2.png',
  './01 Source/Coda.png',
  './01 Source/1st Ending.jpg',
  './01 Source/2nd Ending.jpg',
  './01 Source/1st&2nd Ending.jpg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fresh = fetch(event.request).then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => cached);
      return cached || fresh;
    })
  );
});
