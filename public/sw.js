const CACHE_NAME = 'mobilya-app-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-services') {
    event.waitUntil(syncServices());
  }
});

async function syncServices() {
  try {
    // IndexedDB'den bekleyen_islemler tablosuna erişiyoruz
    // Normalde localforage.createInstance ile aynı db'ye bağlanılır
    // Ancak sw context'inde localforage olmadığından idb (veya doğrudan IndexedDB api'si) kullanmalıyız.
    // Burada IndexedDB API kullanarak 'localforage' veritabanına erişelim.
    
    const db = await openDB('localforage');
    const tx = db.transaction('keyvaluepairs', 'readonly');
    const store = tx.objectStore('keyvaluepairs');
    
    // "bekleyen_islemler" adlı anahtarı okuyalım
    const request = store.get('bekleyen_islemler');
    
    request.onsuccess = async () => {
      const operations = request.result;
      if (operations && operations.length > 0) {
        console.log('Arka planda senkronizasyon başlatılıyor...', operations);
        
        // Burada gerçek bir sunucu (Supabase/Firebase) API'si çağrılmalı.
        // Örn: await fetch('/api/sync', { method: 'POST', body: JSON.stringify(operations) });
        
        // İşlemler başarıyla sunucuya iletildikten sonra kuyruğu temizleriz.
        const clearTx = db.transaction('keyvaluepairs', 'readwrite');
        const clearStore = clearTx.objectStore('keyvaluepairs');
        clearStore.put([], 'bekleyen_islemler');
        
        console.log('Senkronizasyon tamamlandı.');
        
        // İstemcilere senkronizasyon bittiğini bildirelim
        self.clients.matchAll().then(clients => {
          clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
        });
      }
    };
  } catch (error) {
    console.error('Arka plan senkronizasyon hatası:', error);
  }
}

function openDB(dbName) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}
