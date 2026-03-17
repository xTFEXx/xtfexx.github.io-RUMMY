const CACHE_NAME = 'rummy-pro-v2';

self.addEventListener('install', (e) => {
    // Ya NO forzamos el skipWaiting aquí. Esperamos a que el usuario presione "Actualizar".
});

self.addEventListener('activate', (e) => {
    // Limpia cachés viejas
    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
        }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // ESTRATEGIA NETWORK-FIRST
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => {
                return caches.match(e.request);
            })
    );
});

// Escucha el botón "Actualizar" de la página
self.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});