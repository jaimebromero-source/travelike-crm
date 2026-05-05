// Travelike CRM — Service Worker v1.2
// Estrategia: Cache First para assets, Network First para datos dinámicos
// Los documentos personales (billetes PDF base64) viven en localStorage, accesibles offline siempre.

const CACHE_NAME = 'travelike-v1.2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/assets/', // Vite genera hashes — se cachean dinámicamente abajo
];

const ALWAYS_NETWORK = [
  '/api/',
  '/.netlify/functions/',
  'supabase.co',
  'onesignal.com',
  'open.er-api.com',
  'nominatim.openstreetmap.org',
  'cdn.jsdelivr.net/npm/world-atlas',
];

const CACHE_CDN = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdnjs.cloudflare.com',
];

// Install — precachear solo index.html
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(['/', '/index.html']))
  );
  self.skipWaiting();
});

// Activate — limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — estrategia inteligente
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Siempre red para APIs y funciones serverless
  if (ALWAYS_NETWORK.some(pattern => url.includes(pattern))) {
    event.respondWith(fetch(event.request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // CDN fonts/libs: cache first con fallback de red
  if (CACHE_CDN.some(pattern => url.includes(pattern))) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        }).catch(() => new Response('', { status: 503 }));
      })
    );
    return;
  }

  // Assets de Vite (JS, CSS, imágenes): cache first
  if (url.includes('/assets/') || url.match(/\.(js|css|png|jpg|webp|svg|woff2?)(\?.*)?$/)) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        if (cached) return cached;
        return fetch(event.request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // Navegación (HTML): network first con fallback a index.html cacheado
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Default: network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// Mensaje desde la app para forzar actualización
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
