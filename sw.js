const cacheName = 'ilymb-v2';

self.addEventListener('install', (e) => {
  self.skipWaiting(); // Forcer le nouveau SW à prendre le contrôle immédiatement
  e.waitUntil(
    caches.open(cacheName).then((c) => 
      c.addAll(['./', './index.html', './manifest.json', './icon.png'])
    )
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== cacheName) {
            return caches.delete(key); // Supprime l'ancien cache v1
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  // Toujours chercher le manifest sur le réseau pour éviter de bloquer l'installation
  if (e.request.url.includes('manifest.json')) {
    e.respondWith(
      fetch(e.request).catch(() => caches.match(e.request))
    );
    return;
  }
  
  e.respondWith(
    caches.match(e.request).then((r) => r || fetch(e.request))
  );
});
