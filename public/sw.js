// GymLog service worker — v3
// 修正:導航 network-first(永遠攞最新版),只有 hashed assets 先 cache-first
// 升級時清晒舊 cache,避免舊 shell + 新 assets 混合 → 白畫面
const CACHE = 'gymlog-v4';

self.addEventListener('install', (e) => {
  e.waitUntil(
    // 安裝新 SW 時清晒所有舊 cache(包括舊版 gymlog-v1/v2)
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) return;

  // 導航(HTML)→ network-first:有新版本就攞新,offline 先用 cache
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then((c) => c.put('./index.html', clone));
          }
          return res;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // hashed assets (immutable)→ cache-first
  e.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && req.url.indexOf('/assets/') >= 0) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(req, clone));
      }
      return res;
    }))
  );
});
