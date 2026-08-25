// GymLog service worker — app shell cache-first + 更新時換新版
const CACHE = 'gymlog-v1';
const PRECACHE = ['./', './index.html', './manifest.webmanifest', './favicon.svg'];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      // 只快取同源成功回應
      if (res.ok && req.url.indexOf('/assets/') >= 0) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
