const CACHE_NAME = 'rummy-pro-v1';

self.addEventListener('install', (e) => {
    self.skipWaiting(); // Obliga al nuevo SW a instalarse inmediatamente
});

self.addEventListener('activate', (e) => {
    // Limpia cachés viejas si es necesario
    e.waitUntil(caches.keys().then((keyList) => {
        return Promise.all(keyList.map((key) => {
            if (key !== CACHE_NAME) return caches.delete(key);
        }));
    }));
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // ESTRATEGIA NETWORK-FIRST (Red primero, Caché como respaldo)
    e.respondWith(
        fetch(e.request)
            .then((res) => {
                // Si hay internet y responde bien, guardamos una copia fresca en caché
                const resClone = res.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, resClone);
                });
                return res;
            })
            .catch(() => {
                // Si no hay internet, sacamos la versión de la caché
                return caches.match(e.request);
            })
    );
});

// Escucha el mensaje de "Actualizar" desde la ventana de la app
self.addEventListener('message', (e) => {
    if (e.data && e.data.action === 'skipWaiting') {
        self.skipWaiting();
    }
});