const fs = require('fs');

let sw = fs.readFileSync('public/sw.js', 'utf8');
sw = sw.replace(/CACHE_NAME = 'mobilya-app-v2'/g, "CACHE_NAME = 'mobilya-app-v3'");

// Network first strategy
const oldFetch = `    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // Only cache valid HTTP(S) responses
        if (networkResponse.ok && event.request.url.startsWith('http')) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Ignore fetch errors during offline
      });
      return cachedResponse || fetchPromise;
    })`;

const newFetch = `    fetch(event.request).then((networkResponse) => {
      if (networkResponse.ok && event.request.url.startsWith('http')) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request);
    })`;

sw = sw.replace(oldFetch, newFetch);
fs.writeFileSync('public/sw.js', sw);

let manifest = fs.readFileSync('public/manifest.json', 'utf8');
manifest = manifest.replace(/"MobilyaOps Servis Yönetimi"/g, '"Sohvakeskus"');
manifest = manifest.replace(/"MobilyaOps"/g, '"Sohvakeskus"');
fs.writeFileSync('public/manifest.json', manifest);

let html = fs.readFileSync('index.html', 'utf8');
html = html.replace(/<title>MobilyaOps<\/title>/g, '<title>Sohvakeskus</title>');
fs.writeFileSync('index.html', html);

console.log('Cache busted and files updated');
