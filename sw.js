// Claudionoid service worker — network first, cache fallback (works offline once visited).
const CACHE_NAME = 'claudio-v15';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/privacy.html',
  '/terms.html',
  '/delete-account.html',
  '/legal.css',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/apple-touch-icon.png',
  '/favicon-32x32.png',
];

// Install — cache the app shell
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS)));
  self.skipWaiting();
});

// Activate — drop old caches (claudio-v1, claudio-v2, …)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
  self.clients.claim();
});

// Fetch — same-origin GETs only; API, Stripe and fonts always go to the network.
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(req)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      })
      .catch(async () => {
        const hit = await caches.match(req);
        if (hit) return hit;
        // Offline navigation to any page → the app shell.
        if (req.mode === 'navigate') return caches.match('/index.html');
        return Response.error();
      })
  );
});
