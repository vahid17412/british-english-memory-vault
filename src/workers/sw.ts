/// <reference lib="webworker" />
declare let self: ServiceWorkerGlobalScope;

const CACHE_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || 'v1';
const CACHE_NAME = `naharpaz-srs-${CACHE_VERSION}`;

// Pre-cache only critical shell assets. Let runtime handle the rest.
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192x192.png'
];

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Install Fail Safe: Prevent missing files from breaking SW install
      return Promise.allSettled(
        ASSETS_TO_CACHE.map(asset => cache.add(asset))
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
          return false;
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;

  // 1. Ignore non-GET requests and dev/API/Next.js dynamic routes
  if (
    request.method !== 'GET' ||
    request.url.startsWith('chrome-extension://') ||
    request.url.includes('/api/') ||
    request.url.includes('/_next/data/')
  ) {
    return;
  }

  // 2. Offline Fallback for Navigation
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/') as Promise<Response>)
    );
    return;
  }

  // 3. Stale-While-Revalidate with strict caching rules
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse.ok && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          event.waitUntil(
            caches.open(CACHE_NAME).then((cache) => cache.put(request, responseToCache))
          );
        }
        return networkResponse;
      }).catch(() => {
        // Silent catch for offline execution
      });

      return cachedResponse || fetchPromise as Promise<Response>;
    })
  );
});
