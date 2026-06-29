// BrandReel — service worker. Runtime cache-first for the app shell so the
// installed PWA opens instantly and works offline after first load.
const CACHE = "brandreel-v3";

self.addEventListener("install", (e) => { self.skipWaiting(); });

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  e.respondWith(
    caches.open(CACHE).then((cache) =>
      cache.match(req).then((cached) => {
        const network = fetch(req).then((resp) => {
          try { if (resp && (resp.ok || resp.type === "opaque")) cache.put(req, resp.clone()); } catch (_) {}
          return resp;
        }).catch(() => cached);
        return cached || network;
      })
    )
  );
});
