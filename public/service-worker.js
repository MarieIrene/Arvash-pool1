const CACHE_NAME = 'arvash-pool-v1';
const APP_SHELL_URL = '/';
const STATIC_URLS = [
  '/manifest.json',
  '/pwa-icon-192.svg',
  '/pwa-icon-512.svg',
];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    const response = await fetch(APP_SHELL_URL);
    await cache.put(APP_SHELL_URL, response.clone());
    await cache.addAll(STATIC_URLS);

    // Precache the hashed CSS and JavaScript bundles referenced by Vite's HTML.
    const html = await response.text();
    const assets = [...html.matchAll(/(?:src|href)=["']([^"']+\.(?:js|css)(?:\?[^"']*)?)["']/g)]
      .map((match) => new URL(match[1], self.location.origin).href)
      .filter((url) => new URL(url).origin === self.location.origin);

    await Promise.all(assets.map(async (url) => {
      const assetResponse = await fetch(url);
      if (assetResponse.ok) await cache.put(url, assetResponse);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName)),
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const response = await fetch(request);
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
        return response;
      } catch {
        return (await caches.match(request)) || (await caches.match(APP_SHELL_URL));
      }
    })());
    return;
  }

  event.respondWith((async () => {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) return cachedResponse;

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, response.clone());
    }
    return response;
  })());
});