```javascript
const CACHE_NAME = "planneo-v5";

const ARCHIVOS = [
    "./",
    "./index.html",
    "./manifest.json"
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARCHIVOS))
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

    event.respondWith(
        fetch(event.request)
            .then(respuesta => {
                if (respuesta && respuesta.ok && new URL(event.request.url).origin === self.location.origin) {
                    const copia = respuesta.clone();

                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, copia);
                    });
                }

                return respuesta;
            })
            .catch(() => caches.match(event.request))
    );
});

self.addEventListener("notificationclick", event => {
    event.notification.close();

    event.waitUntil(
        self.clients.matchAll({
            type: "window",
            includeUncontrolled: true
        }).then(clientes => {
            for (const cliente of clientes) {
                if ("focus" in cliente) {
                    return cliente.focus();
                }
            }

            return self.clients.openWindow("./");
        })
    );
});
```
