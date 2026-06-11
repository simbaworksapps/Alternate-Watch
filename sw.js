const CACHE_NAME = "simba-alternate-watch-v526";
const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./public/SIMBA.jpg",
  "./public/apple-touch-icon.png",
  "./public/simba-header-mark.png",
  "./public/simba-app-icon-192.png",
  "./public/simba-app-icon-512.png",
  "./public/simba-app-icon-1024.png",
  "./src/app.js",
  "./src/airports.js",
  "./src/data.js",
  "./src/rules.js",
  "./src/styles.css",
  "./src/weather-stations.js"
];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("./index.html").then((cached) => cached || caches.match("./")))
    );
    return;
  }
  event.respondWith(caches.match(event.request).then((cached) => cached || fetch(event.request)));
});
