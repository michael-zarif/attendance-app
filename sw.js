const CACHE_NAME = 'attendance-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/styles.css',
    '/script.js',
    'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.js'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            })
    );
});
