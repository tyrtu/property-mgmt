const CACHE_NAME = "renthive-cache-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", async (event) => {
    console.log("[Service Worker] Installing...");

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log("[Service Worker] Pre-caching offline page");
            return cache.addAll([
                "/",
                "/index.html",
                OFFLINE_URL,
                "/manifest.json",
                "/favicon.ico",
            ]);
        })
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    console.log("[Service Worker] Activated");
    event.waitUntil(
        caches.keys().then((cacheNames) =>
            Promise.all(
                cacheNames.map((cache) => {
                    if (cache !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", cache);
                        return caches.delete(cache);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    if (event.request.mode === "navigate") {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL));
            })
        );
    }
});
