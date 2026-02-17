
const CACHE_NAME = 'basirah-offline-v1';
const MUSHAF_CACHE_NAME = 'quran-mushaf-images-v1'; // Harus sama dengan services/mushafService.ts

// Library inti dari importmap dan aset statis utama
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/logo.svg',
  '/index.tsx', // Entry point
  '/services/quranMeta.ts', // Struktur Juz & Sajdah (Core Logic)
  '/services/mushafService.ts', // Logika URL Mushaf
  
  // Tailwind
  'https://cdn.tailwindcss.com',
  
  // Fonts
  'https://fonts.googleapis.com/css2?family=Amiri:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&family=Lora:ital,wght@0,400;0,500;1,400&display=swap',

  // Libraries (Sesuai importmap di index.html)
  'https://esm.sh/react-dom@^19.2.4/',
  'https://esm.sh/react-router-dom@^7.13.0',
  'https://esm.sh/react@^19.2.4',
  'https://esm.sh/react@^19.2.4/',
  'https://esm.sh/lucide-react@^0.563.0',
  'https://esm.sh/idb@^8.0.3',
  'https://esm.sh/html2canvas@1.4.1',

  // Core Data (Agar teks Quran & Info Surat bisa dibuka offline)
  '/qruan-json/quran.json',
  '/qruan-json/chapters/id.json',
  '/qruan-json/surah-info.json'
];

// Install Event: Cache Core Assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Langsung aktifkan SW baru
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching core assets');
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Hapus cache lama versi aplikasi, TAPI JANGAN hapus cache gambar mushaf
          if (cacheName !== CACHE_NAME && cacheName !== MUSHAF_CACHE_NAME && cacheName.startsWith('basirah-offline')) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Handle Requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Mushaf Images (android.quran.com) -> Cache First
  // Ini memungkinkan "Lazy Caching" saat user membaca tanpa download full
  if (url.hostname.includes('android.quran.com')) {
      event.respondWith(
          caches.open(MUSHAF_CACHE_NAME).then((cache) => {
              return cache.match(event.request).then((cachedResponse) => {
                  return cachedResponse || fetch(event.request).then((networkResponse) => {
                      // Hanya cache jika sukses (200)
                      if(networkResponse.ok) {
                          cache.put(event.request, networkResponse.clone());
                      }
                      return networkResponse;
                  });
              });
          })
      );
      return;
  }

  // 2. External Libraries, Fonts, Images -> Cache First
  if (
    url.hostname.includes('esm.sh') ||
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('gstatic.com') ||
    url.hostname.includes('tailwindcss.com') ||
    event.request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((response) => {
          return caches.open(CACHE_NAME).then((cache) => {
             // Cache for next time
             if (response.status === 200) {
                 cache.put(event.request, response.clone());
             }
             return response;
          });
        });
      })
    );
    return;
  }

  // 3. Audio Files (everyayah) -> Network First (handled by App's internal downloader usually)
  // Biarkan aplikasi menangani caching audio spesifik, SW hanya fallback
  if (url.hostname.includes('everyayah.com')) {
     return; // Default browser handling
  }

  // 4. Local App Files (.tsx, .ts, .json, .css) -> Stale While Revalidate
  // Strategi ini menyajikan versi cache agar cepat/offline, tapi tetap update di background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request).then((networkResponse) => {
           if (networkResponse.status === 200) {
               caches.open(CACHE_NAME).then((cache) => {
                   cache.put(event.request, networkResponse.clone());
               });
           }
           return networkResponse;
        }).catch(() => {
            // Jika offline dan tidak ada di cache
            return cachedResponse; 
        });

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }

  // Default: Network First
  event.respondWith(
      fetch(event.request).catch(() => {
          return caches.match(event.request);
      })
  );
});
