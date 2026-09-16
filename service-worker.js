const CACHE_NAME = "planneo-v1";

const ARCHIVOS = [
  "./",
 "./index.html",
  "./manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS);
    })
  );

  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );

  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((respuesta) => {
      return respuesta || fetch(event.request);
    })
  );
});

self.addEventListener("push", (event) => {
  let datos = {
    titulo: "Planneo",
    mensaje: "Tienes un nuevo recordatorio."
  };

  if (event.data) {
    try {
      datos = event.data.json();
    } catch {
      datos.mensaje = event.data.text();
    }
  }

  event.waitUntil(
    self.registration.showNotification(datos.titulo, {
      body: datos.mensaje,
      icon: "./icono.png",
      badge: "./icono.png"
    })
  );
});