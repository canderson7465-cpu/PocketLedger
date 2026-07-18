const CACHE = 'pocket-ledger-v3';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).catch(()=>{})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => Promise.all(
      names.filter((n) => n !== CACHE).map((n) => caches.delete(n))
    )).then(() => self.clients.claim())
  );
});

// Network-first: always try to fetch the latest version when online (so
// updates show up immediately), and only fall back to the cached copy
// when there's no signal at all — that's what keeps the app usable offline.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).then((response) => {
      const copy = response.clone();
      caches.open(CACHE).then((cache) => cache.put(event.request, copy)).catch(()=>{});
      return response;
    }).catch(() => caches.match(event.request))
  );
});
