const CACHE_NAME = 'count-cache-v1';
const PRECACHE_URLS = [
  '/count-kanagawa/',
  '/count-kanagawa/index.html',
  '/count-kanagawa/offline.html',
  '/count-kanagawa/favicon-192x192.png',
  '/count-kanagawa/favicon-512x512.png',
  '/count-kanagawa/apple-touch-icon.png'
];

// install: 事前キャッシュ
self.addEventListener('install', (event) => {
  self.skipWaiting(); // 新しいSWをすぐ有効にしたいときに便利
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// activate: 古いキャッシュを掃除
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((k) => k !== CACHE_NAME)
            .map((k) => caches.delete(k))
      );
    }).then(() => self.clients.claim())
  );
});

// fetch: キャッシュ優先（navigation は network-first にするパターン）
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // HTML ナビゲーション要求は network-first（最新のページを優先）
  if (request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'))) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          // 成功したらキャッシュに保存して返す
          const clone = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return resp;
        })
        .catch(() => {
          // ネットワーク失敗 → キャッシュ（もしくは offline.html）
          return caches.match(request).then((resp) => resp || caches.match('/offline.html'));
        })
    );
    return;
  }

  // それ以外
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((resp) => {
        // レスポンスがOKならキャッシュに保存（必要なら）
        if (!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        const clone = resp.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return resp;
      }).catch(() => {
        // 画像等で失敗した場合は代替を返す（省略）。
        return caches.match('/count-kanagawa/offline.html');
      });
    })
  );
});

