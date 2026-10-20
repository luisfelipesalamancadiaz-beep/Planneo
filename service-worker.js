// ==========================================
// PLANNEO - SERVICE WORKER + FIREBASE
// ==========================================

importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);

// Firebase
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

// ==========================================
// CACHE
// ==========================================

const CACHE_NAME = "planneo-v25";

const ARCHIVOS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icono-192.png",
  "./icono-512.png"
];

// ==========================================
// INSTALACIÓN
// ==========================================

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ARCHIVOS))
      .then(() => self.skipWaiting())
  );
});

// ==========================================
// ACTIVACIÓN
// ==========================================

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self
