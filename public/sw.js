// ============================================================
// TRAVELIKE SERVICE WORKER — Offline + PWA + OneSignal Push
// ============================================================

// ⚠️ IMPORTANTE: OneSignal necesita que su script esté importado
// en el SW para poder gestionar las notificaciones push.
importScripts("https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.sw.js");

const CACHE_NAME = "travelike-v2";
const API_HOSTS = ["supabase.co", "googleapis.com", "generativelanguage", "onesignal.com", "open.er-api.com"];

const PRECACHE = ["/", "/index.html"];

// ---- INSTALL ----
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE))
  );
  self.skipWaiting();
});

// ---- ACTIVATE: limpiar caches viejos ----
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ---- FETCH: lógica de caché ----
self.addEventListener("fetch", event => {
  const { request } = event;
  const url = new URL(request.url);

  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // APIs externas → Network-first
  const isAPI = API_HOSTS.some(h => url.hostname.includes(h));
  if (isAPI) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" }
      }))
    );
    return;
  }

  // Assets → Cache-first con actualización en background
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        if (response.ok && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);

      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }
      return networkFetch.then(r => r || new Response("Offline", { status: 503 }));
    })
  );
});

// ---- Push y notificationclick los gestiona el SDK de OneSignal (importado arriba) ----
