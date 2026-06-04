// Regist LabOnline — Service Worker
// Strategy:
//   - Navigation / HTML pages : network-first → users always see the latest
//     deploy on first load; cache is used only when offline
//   - /api/* requests         : network-first → fresh Notion data, with cached
//     snapshot as offline fallback
//   - Other static assets     : cache-first → fast load for icon, manifest,
//     and similar rarely-changing files
//
// Bump CACHE_VERSION on any breaking change to invalidate old SW caches.

const CACHE_VERSION = 'lab-v1.2.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const API_CACHE = `${CACHE_VERSION}-api`;

const PRECACHE = [
  '/',
  '/index.html',
  '/dashboard.html',
  '/manifest.json',
  '/icon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => !k.startsWith(CACHE_VERSION)).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // API: network-first, fall back to cached response when offline
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(API_CACHE).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // HTML / navigation: network-first so new deploys are picked up immediately
  const isHtml =
    req.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname.endsWith('.html');
  if (isHtml) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((c) => c || caches.match('/')))
    );
    return;
  }

  // Other static (icon, manifest, etc.): cache-first
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(STATIC_CACHE).then((c) => c.put(req, copy));
        }
        return res;
      });
    })
  );
});
