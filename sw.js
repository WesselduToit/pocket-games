const CACHE_NAME = "pg-f47bf03f9d6c7e5ab1a77704f0048c35ef5165cfd79706da24d01fbe1f13c181";
const FILES = [
  "./games/bounce-house.html",
  "./games/deep-pockets.html",
  "./games/dicewright.html",
  "./games/down-the-hatch.html",
  "./games/dust-bunnies.html",
  "./games/emberlight.html",
  "./games/far-flung.html",
  "./games/matchlock.html",
  "./games/mole-sense.html",
  "./games/night-market.html",
  "./games/roadbound.html",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./index.html",
  "./manifest.webmanifest"
];

self.addEventListener('install', event => {
  // 'reload' skips the browser's own HTTP cache, so a new version never stores stale files.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(FILES.map(file => new Request(file, { cache: 'reload' })))));
});

self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(names => Promise.all(
    names.filter(name => name.startsWith('pg-') && name !== CACHE_NAME).map(name => caches.delete(name))
  )).then(() => self.clients.claim()));
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const menu = new URL('./index.html', self.registration.scope).href;
    const directory = new URL('./', self.registration.scope).pathname;
    const cached = await cache.match(url.pathname === directory ? menu : request, { ignoreSearch: true });
    if (cached) return cached;
    try {
      const response = await fetch(request);
      if (response.ok || request.mode !== 'navigate') return response;
      return await cache.match(menu) || response;
    } catch (error) {
      if (request.mode === 'navigate') {
        const fallback = await cache.match(menu);
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') event.waitUntil(self.skipWaiting());
});
