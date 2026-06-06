/**
 * sw.js — Minimal offline-first service worker (PWA).
 * Caches the app shell so the simulator works on airplane mode after first load.
 * Note: the Three.js CDN module is cached at runtime when first fetched online.
 */
const CACHE = "cortexsim-v1";
const SHELL = [
  "./",
  "./index.html",
  "./app.html",
  "./src/css/styles.css",
  "./src/js/landing.js",
  "./src/js/ui/app.js",
  "./src/js/ui/copilot.js",
  "./src/js/engine/worker.js",
  "./src/js/engine/snn-engine.js",
  "./src/js/engine/models.js",
  "./src/js/engine/rng.js",
  "./src/js/engine/presets.js",
  "./src/js/analytics/metrics.js",
  "./src/js/analytics/toolbox.js",
  "./src/js/viz/network3d.js",
  "./src/js/viz/raster.js",
  "./src/js/viz/charts.js",
  "./src/js/io/export.js",
  "./src/js/io/codegen.js",
  "./src/js/io/storage.js",
  "./manifest.webmanifest",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  e.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request)
        .then((res) => {
          if (res && res.status === 200 && (request.url.startsWith(self.location.origin) || request.url.includes("cdn.jsdelivr.net"))) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
