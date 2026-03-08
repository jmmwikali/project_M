const CACHE = 'agrofeeds-v1';
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
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});