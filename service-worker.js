
const CACHE_NAME = "planneo-v7";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./planneo-2.0.html",
    "./manifest.json"
];

// Instalar y guardar los archivos disponibles
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                for (const archivo of ARCHIVOS) {
                    try {
                        await cache.add(archivo);
                    } catch (error) {
                        console.warn(
                            "No se pudo guardar en caché:",
                            archivo,
                            error
                        );
                    }
                }
            })
            .then(() => self.skipWaiting())
    );
});

// Activar la nueva versión y limpiar cachés anteriores
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys()
            .then(nombres => Promise.all(
                nombres
                    .filter(nombre =>
                        nombre.startsWith("planneo-") &&
                        nombre !== CACHE_NAME
                    )
                    .map(nombre => caches.delete(nombre))
            ))
            .then(() => self.clients.claim())
    );
});

// Intentar obtener los recursos de Internet y guardar copias locales
self.addEventListener("fetch", event => {
    if (event.request.method !== "GET") return;

    const url = new URL(event.request.url);

    // No interceptar peticiones a otros sitios
    if (url.origin !== self.location.origin) return;

    event.respondWith(
        fetch(event.request)
            .then(respuesta => {
                if (respuesta && respuesta.ok) {
                    const copia = respuesta.clone();

                    caches.open(CACHE_NAME)
                        .then(cache => cache.put(event.request, copia))
                        .catch(error => {
                            console.warn("Error de caché:", error);
                        });
                }

                return respuesta;
            })
            .catch(async () => {
                const archivoGuardado = await caches.match(event.request);

                if (archivoGuardado) {
                    return archivoGuardado;
                }

                if (event.request.mode === "navigate") {
                    const pagina = await caches.match("./index.html");

                    if (pagina) return pagina;
                }

                return Response.error();
            })
    );
});

// Gestionar los clics en las notificaciones
self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(async clientes => {
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
```
