const CACHE_NAME = "planneo-v2";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json"
];

/* INSTALACIÓN */
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARCHIVOS);
    })
  );

  self.skipWaiting();
});

/* ACTIVACIÓN */
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

/* CARGA DE ARCHIVOS */
self.addEventListener("fetch", (event) => {

  // Para HTML: primero busca la versión NUEVA en internet
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request)
        .then((respuesta) => {

          const copia = respuesta.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, copia);
          });

          return respuesta;
        })
        .catch(() => {
          return caches.match(event.request);
        })
    );

    return;
  }

  // Para los demás archivos:
  // caché primero, internet como respaldo
  event.respondWith(
    caches.match(event.request).then((respuesta) => {
      return respuesta || fetch(event.request);
    })
  );
});

/* NOTIFICACIONES PUSH */
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
