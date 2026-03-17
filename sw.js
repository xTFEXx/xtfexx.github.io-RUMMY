const CACHE_NAME = 'rummy-pro-v3';

self.addEventListener('install', (e) => {
    // ⛔ AQUÍ NO DEBE HABER NADA. 
    // Si pones self.skipWaiting() aquí, la página se actualizará sola sin preguntar.
});

self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
        }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => { cache.put(e.request, resClone); });
                return res;
            })
            .catch(() => {
                return caches.match(e.request);
            })
    );
});

// Esta es la cerradura. Solo se abre si index.html le manda la llave ('skipWaiting')
self.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});