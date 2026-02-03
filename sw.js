const CACHE_NAME = "rv-fit-v7"; // Subí la versión para forzar actualización

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./sw.js",
  "./splash.png",          // Asegúrate de que tu archivo sea .png
  "./apple-touch-icon.png",
  "./icon-192.png",        // Asegúrate de renombrar tu icon-129 a icon-192
  "./icon-512.png"         // Asegúrate de convertir tu jpg a png
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log("Caching shell assets...");
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
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
  event.respondWith(
    caches.match(event.request).then(response => {
      // Devuelve caché si existe, si no, va a internet
      return response || fetch(event.request).catch(() => {
        // Opcional: Si no hay internet y no está en caché
        // aquí podrías retornar una página offline genérica si quisieras
      });
    })
  );
});
