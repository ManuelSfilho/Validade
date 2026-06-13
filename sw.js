const CACHE_NAME = 'lancamentos-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './produtos.xlsx'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  // produtos.xlsx: tenta rede primeiro (dados atualizados), cai pro cache se offline
  if (req.url.includes('produtos.xlsx')) {
    event.respondWith(
      fetch(req).then((res) => {
        const resClone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }
  // demais arquivos: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
