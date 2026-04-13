// ============================================================
// TRAVELIKE SERVICE WORKER — Offline + PWA
// Estrategia: Cache-first para assets, Network-first para API
// ============================================================

const CACHE_NAME = "travelike-v1";
const API_HOSTS = ["supabase.co", "googleapis.com", "generativelanguage", "onesignal.com", "open.er-api.com"];

// Assets que siempre queremos cachear
const PRECACHE = ["/", "/index.html"];

// ---- INSTALL: precachear el shell de la app ----
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

  // Ignorar extensiones de Chrome y requests que no son GET
  if (request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // Llamadas a APIs externas → Network-first (si falla, no hay fallback)
  const isAPI = API_HOSTS.some(h => url.hostname.includes(h));
  if (isAPI) {
    event.respondWith(
      fetch(request).catch(() => new Response(JSON.stringify({ error: "offline" }), {
        headers: { "Content-Type": "application/json" }
      }))
    );
    return;
  }

  // Assets de la app (JS, CSS, fonts, imágenes) → Cache-first con actualización en background
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(response => {
        // Solo cachear responses válidas
        if (response.ok && response.type !== "opaque") {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      }).catch(() => null);

      // Si tenemos caché, devolvemos inmediatamente y actualizamos en background
      if (cached) {
        event.waitUntil(networkFetch);
        return cached;
      }
      // Si no hay caché, esperamos la red
      return networkFetch.then(r => r || new Response("Offline", { status: 503 }));
    })
  );
});

// ---- Notificaciones push (OneSignal compatible) ----
self.addEventListener("push", event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "TraveLike", {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: data.url || "/"
    })
  );
});

self.addEventListener("notificationclick", event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});
