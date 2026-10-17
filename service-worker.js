const CACHE_NAME = "planneo-v10";
const ARCHIVOS = [
    "./",
    "./index.html",
    "./planneo.html",
    "./manifest.json",
    "./service-worker.js"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                for (const archivo of ARCHIVOS) {
                    try {
                        await cache.add(archivo);
                    } catch (error) {
                        console.warn("No se pudo guardar en caché:", archivo, error);
                    }
                }
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(nombres => Promise.all(
                nombres
                    .filter(nombre => nombre.startsWith("planneo-") && nombre !== CACHE_NAME)
                    .map(nombre => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;
    const url = new URL(event.request.url);
    if (url.origin !== self.location.origin) return;
    event.respondWith(
        fetch(event.request)
            .then(respuesta => {
                if (respuesta && respuesta.ok) {
                    const copia = respuesta.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copia)).catch(() => {});
                }
                return respuesta;
            })
            .catch(async () => {
                const archivoGuardado = await caches.match(event.request);
                if (archivoGuardado) return archivoGuardado;
                if (event.request.mode === "navigate") {
                    return (await caches.match("./index.html")) || (await caches.match("./planneo.html")) || Response.error();
                }
                return Response.error();
            })
    );
});

// Recibir mensajes desde la página para mostrar notificaciones
self.addEventListener("message", event => {
    if (event.data && event.data.type === "SHOW_NOTIFICATION") {
        const { title, body, tag } = event.data;
        event.waitUntil(
            self.registration.showNotification(title || "Planneo", {
                body: body || "",
                icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📒</text></svg>",
                badge: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📒</text></svg>",
                tag: tag || "planneo-notification",
                renotify: true
            })
        );
    }
});

self.addEventListener("notificationclick", event => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: "window", includeUncontrolled: true })
            .then(async clientes => {
                for (const cliente of clientes) {
                    if ("focus" in cliente) {
                        await cliente.focus();
                        return;
                    }
                }
                await self.clients.openWindow("./");
            })
    );
});
