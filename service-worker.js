// Service Worker per PWA - GFV Global Farm View
const CACHE_NAME = 'gfv-vendemmia-v1';
// Usa path relativi per compatibilità con GitHub Pages
const urlsToCache = [
  './',
  './index.html',
  './home.html',
  './calcolatore.html',
  './anagrafica_clienti.html',
  './bilancio.html',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  './firebase-config-shared.js',
  './error-handler.js',
  './loading-handler.js',
  './form-validator.js'
];

// Installazione Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache aperto');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.error('Service Worker: Errore durante il caching', error);
      })
  );
});

// Attivazione Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Rimozione cache vecchia', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch - Strategia Network First con fallback Cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clona la risposta per poterla usare e salvare nella cache
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        
        return response;
      })
      .catch(() => {
        // Se la rete fallisce, prova a recuperare dalla cache
        return caches.match(event.request);
      })
  );
});

