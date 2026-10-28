// Firebase Cloud Messaging para Planneo
// Este archivo se encuentra en la raíz de GitHub Pages.
 
importScripts(
"https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js"
);
 
importScripts(
"https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js"
);
 
firebase.initializeApp({
apiKey: "AIzaSyDlHZChuc600vie5rnDqyqBXk4gypQ4tgc",
authDomain: "planneo-a3bca.firebaseapp.com",
projectId: "planneo-a3bca",
storageBucket: "planneo-a3bca.firebasestorage.app",
messagingSenderId: "594631604240",
appId: "1:594631604240:web:2be7df45a75e284235b295",
measurementId: "G-T10WL2SLPE"
});
 
const messaging = firebase.messaging();
 
messaging.onBackgroundMessage((payload) => {
console.log(
"[firebase-messaging-sw.js] Mensaje recibido:",
payload
);
 
const notification = payload.notification || {};
const data = payload.data || {};
 
const title = notification.title || data.title || "Planneo";
const options = {
body: notification.body || data.body || "Tienes un nuevo recordatorio.",
icon: "./icono-192.png",
data: {
url: "https://luisfelipesalamancadiaz-beep.github.io/Planneo/"
}
};
 
return self.registration.showNotification(title, options);
});
 
self.addEventListener("notificationclick", (event) => {
event.notification.close();
 
event.waitUntil(
clients.openWindow(
"https://luisfelipesalamancadiaz-beep.github.io/Planneo/"
)
);
});
