/* PLANNEO - Service Worker v25: actualización automática + Firebase Messaging */
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyDlHZChuc600vie5rnDqyBXk4gypQ4tgc",
  authDomain: "planneo-a3bca.firebaseapp.com",
  projectId: "planneo-a3bca",
  storageBucket: "planneo-a3bca.firebasestorage.app",
  messagingSenderId: "594631604240",
  appId: "1:594631604240:web:2be7df45a75e284235b295",
  measurementId: "G-T10WL2SLPE"
});

const messaging = firebase.messaging();
const CACHE_NAME = "planneo-presentacion-v25";
const APP_URL = "https://luisfelipesalamancadiaz-beep.github.io/Planneo/";
const ARCHIVOS = ["./", "./index.html", "./manifest.json", "./icono-192.png", "./icono-512.png"];

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
      .then(keys => Promise.all(keys.filter(key => key.startsWith("planneo-") && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// Network-first: al publicar una versión nueva se usa primero GitHub Pages; caché solo si no hay conexión.
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.cache === "only-if-cached" && event.request.mode !== "same-origin") return;

  event.respondWith((async () => {
    try {
      const response = await fetch(event.request, { cache: "no-store" });
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {});
      }
      return response;
    } catch (error) {
      const cached = await caches.match(event.request);
      if (cached) return cached;
      if (event.request.mode === "navigate") {
        const fallback = await caches.match("./index.html");
        if (fallback) return fallback;
      }
      return Response.error();
    }
  })());
});

messaging.onBackgroundMessage(payload => {
  const notification = payload.notification || {}, data = payload.data || {};
  return self.registration.showNotification(notification.title || data.title || "Planneo", {
    body: notification.body || data.body || "Tienes un nuevo recordatorio.",
    icon: "./icono-192.png",
    badge: "./icono-192.png",
    tag: data.tag || "planneo-recordatorio",
    data: { url: data.url || APP_URL }
  });
});

self.addEventListener("message", event => {
  if (!event.data || event.data.type !== "SHOW_NOTIFICATION") return;
  const { title, body, tag } = event.data;
  event.waitUntil(self.registration.showNotification(title || "Planneo", {
    body: body || "", icon: "./icono-192.png", badge: "./icono-192.png",
    tag: tag || "planneo-notification", renotify: true, data: { url: APP_URL }
  }));
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || APP_URL;
  event.waitUntil(self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(async clients => {
    for (const client of clients) {
      if ("focus" in client) {
        await client.focus();
        if ("navigate" in client) await client.navigate(targetUrl);
        return;
      }
    }
    await self.clients.openWindow(targetUrl);
  }));
});
