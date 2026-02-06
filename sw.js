const CACHE_NAME = "rv-fit-v10";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",

  "./apple-touch-icon.png",
  "./icon-192.png",
  "./icon-512.png",

  "./splash-iphone16pro-portrait-1206x2622.png",
  "./splash-iphone16pro-landscape-2622x1206.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.all(
        FILES_TO_CACHE.map(url =>
          cache.add(url).catch(() => {})
        )
      )
    )
  );

  // NO activamos inmediatamente
  // Esperamos a que el usuario acepte update
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;

      return fetch(event.request).then(networkResponse => {
        return caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        if (event.request.mode === "navigate") {
          return caches.match("./index.html");
        }
      });
    })
  );
});

// Escucha mensaje para activar nueva versión
self.addEventListener("message", event => {
  if (event.data === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
