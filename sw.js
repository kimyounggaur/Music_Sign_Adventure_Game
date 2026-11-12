const CACHE_NAME = 'melodia-v0.2-20261112-rulebook';

// Update CACHE_NAME whenever index.html or the asset list changes for a fresh offline bundle.
const PRECACHE = [
  './index.html',
  './rulebook.js',
  './rulebook.css',
  './assets/rulebook/05-symbol-palette.svg',
  './assets/rulebook/10-bridge.svg',
  './assets/rulebook/11-codex.svg',
  './assets/rulebook/start.svg',
  './assets/rulebook/controls.svg',
  './assets/rulebook/village.svg',
  './assets/rulebook/tower.svg',
  './assets/rulebook/forest.svg',
  './assets/rulebook/bird.svg',
  './assets/rulebook/rock.svg',
  './assets/rulebook/staff.svg',
  './assets/rulebook/save.svg',
  './scene-remaster.js',
  './adventure-art.js',
  './game-accessibility.js',
  './harmonia-assets.js',
  './assets/harmonia/atlas.json',
  './assets/harmonia/atlas-0.png',
  './assets/harmonia/atlas-1.png',
  './assets/harmonia/atlas-2.png',
  './assets/harmonia/atlas-3.png',
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
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key.startsWith('melodia-') && key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== 'GET') return;
  if (url.searchParams.has('test') || url.searchParams.has('preview')) return;
  const key = event.request.mode === 'navigate' ? './index.html' : event.request;
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(key);
      const fresh = fetch(event.request).then((response) => {
        if (response.ok) cache.put(key, response.clone()).catch(() => {});
        return response;
      }).catch(() => cached || new Response('Offline resource unavailable', {status: 503}));
      return event.request.mode === 'navigate' ? fresh : cached || fresh;
    })
  );
});
