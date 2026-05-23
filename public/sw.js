const CACHE_NAME = "unimarket-cache-v1";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico"
];

// Install Service Worker and cache basic static files
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Map each asset to prevent a single missing asset (like a 404 favicon) from failing the entire install
      const cachePromises = ASSETS_TO_CACHE.map((asset) => {
        return cache.add(asset).catch((error) => {
          console.warn(`[Service Worker] Skipping cache for optional asset: ${asset}`, error);
        });
      });
      return Promise.all(cachePromises);
    })
  );
  self.skipWaiting();
});

// Activate and clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Intercept requests and serve from cache if offline
self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  // Skip API calls or auth callbacks
  if (event.request.url.includes("/api/") || event.request.url.includes("/auth/")) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }

          // Clone the response to store it in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If offline and request is for a page, fallback to index.html
          if (event.request.mode === "navigate") {
            return caches.match("/index.html");
          }
        });
    })
  );
});
