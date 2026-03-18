const CACHE = 'agrofeeds-v13';
const ASSETS = [
  '/project_M/',
  '/project_M/index.html',
  '/project_M/manifest.json',
  '/project_M/icon-192.png',
  '/project_M/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  );
  self.skipWaiting(); // activate immediately
});

self.addEventListener('activate', e => {
  // Delete all old caches
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim(); // take control of all open tabs
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // app.js — always fetch fresh from network, never serve from cache
  if (url.pathname.includes('app.js')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }

  // API calls — always network, never cache
  if (url.pathname.includes('/api/')) {
    e.respondWith(fetch(e.request));
    return;
  }

  // Everything else — cache first, fallback to network
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});