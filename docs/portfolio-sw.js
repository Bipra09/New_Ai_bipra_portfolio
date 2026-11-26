const coreCache = 'bipra-new-portfolio-core-v1';
const modelCache = 'bipra-new-portfolio-runtime-v1';
const local = name => new URL(name, self.registration.scope).href;
const core = ['index.html', 'portfolio.css', 'portfolio.mjs', 'portfolio-data.mjs', 'friday-worker.mjs',
  'myphoto_git.jpeg', 'VX.jpg', 'WHB.jpg', 'safe.jpg', 'RFID.jpg', 'OB.jpg', 'facial.jpg'].map(local);
const runtime = local('friday-runtime.mjs');

self.addEventListener('install', event => {
  event.waitUntil(caches.open(coreCache).then(cache => cache.addAll(core)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const {request} = event;
  if (request.method !== 'GET') return;
  if (request.url === runtime) {
    event.respondWith((async () => {
      const cache = await caches.open(modelCache);
      const cached = await cache.match(request);
      if (cached) return cached;
      const response = await fetch(request);
      if (response.ok) await cache.put(request, response.clone());
      return response;
    })());
  } else if (request.mode === 'navigate' && request.url.startsWith(self.registration.scope)) {
    event.respondWith(fetch(request).catch(async () => (await caches.open(coreCache)).match(local('index.html'))));
  } else if (core.includes(request.url)) {
    event.respondWith((async () => (await (await caches.open(coreCache)).match(request)) || fetch(request))());
  }
});
