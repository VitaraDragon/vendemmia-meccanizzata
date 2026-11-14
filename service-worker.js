// Service Worker per PWA - Vendemmia Meccanizzata
const CACHE_NAME = 'vendemmia-meccanizzata-v7';
const APP_VERSION = '7';
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

function isAppShellRequest(request) {
  if (request.method !== 'GET') return false;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return false;
  if (request.mode === 'navigate') return true;
  return url.pathname.endsWith('.html') || url.pathname.endsWith('.js') || url.pathname.endsWith('/');
}

// Installazione: prende i file dal sito, non dalla cache del browser
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(urlsToCache.map(async (path) => {
      try {
        const response = await fetch(path, { cache: 'reload' });
        if (response.ok) {
          await cache.put(path, response);
        }
      } catch (error) {
        console.error('Service Worker: cache fallita', path, error);
      }
    }));
  })());
});

// Attivazione: cancella le cache vecchie e ricarica le finestre già aperte
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter((cacheName) => cacheName !== CACHE_NAME)
        .map((cacheName) => caches.delete(cacheName))
    );
    await self.clients.claim();

    const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    await Promise.all(windows.map((client) => {
      if (typeof client.navigate !== 'function') return Promise.resolve();
      const url = new URL(client.url);
      if (url.searchParams.get('app') === APP_VERSION) return Promise.resolve();
      url.searchParams.set('app', APP_VERSION);
      return client.navigate(url.href);
    }));
  })());
});

// Pagine e script sempre dalla rete. Il resto può usare la cache se si è offline.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  if (!isAppShellRequest(event.request)) {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request))
    );
    return;
  }

  event.respondWith(
    fetch(event.request, { cache: 'reload' })
      .then((response) => {
        if (response && response.ok) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
