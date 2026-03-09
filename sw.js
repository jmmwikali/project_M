const CACHE = 'agrofeeds-v3';
const ASSETS = [
  '/project_J/',
  '/project_J/index.html',
  '/project_J/app.js',
  '/project_J/manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
   self.skipWaiting(); // ← activate immediately, don't wait
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // ← take control of all open tabs immediately
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});