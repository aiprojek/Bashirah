
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'logo.svg'],
      manifest: {
        name: 'Bashirah - Al-Quran Digital',
        short_name: 'Bashirah',
        description: 'Aplikasi Al-Quran Digital dengan fitur Tadabbur, Refleksi Emosi, dan desain klasik yang menenangkan jiwa.',
        theme_color: '#fcfbf7',
        background_color: '#fcfbf7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'logo.svg',
            sizes: '64x64',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'logo.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: 'logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            // Definisi ukuran ekstra besar untuk memastikan browser modern
            // merender Splash Screen dengan resolusi sangat tinggi (4K Ready vector)
            src: 'logo.svg',
            sizes: '1024x1024',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        // PENTING: Arahkan semua navigasi ke index.html saat offline (SPA support)
        navigateFallback: '/index.html',
        
        // Caching strategy for static assets (JS, CSS, Images in public folder)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        // Increase limit for caching runtime assets if needed
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024, 
        runtimeCaching: [
          {
            // Cache Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Font Static Files
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // <== 365 days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache Mushaf Images (Quran Pages)
            // Source: android.quran.com
            // Strategy: CacheFirst (Images don't change, serve from cache if available, else fetch and cache)
            urlPattern: /^https:\/\/android\.quran\.com\/.*$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'quran-mushaf-images-v1', // Must match the cache name in mushafService.ts for consistency
              expiration: {
                maxEntries: 1000, // Enough for full Quran (604 pages)
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1 Year
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
            // Cache API Responses (Quran Text, Translation) - StaleWhileRevalidate for freshness
            urlPattern: /^https:\/\/api\.alquran\.cloud\/v1\/.*$/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'api-quran-cloud',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 Days
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          },
          {
             // Cache Quran.com API (Word by Word)
             urlPattern: /^https:\/\/api\.quran\.com\/api\/v4\/.*$/i,
             handler: 'StaleWhileRevalidate',
             options: {
                cacheName: 'api-quran-com-v4',
                expiration: {
                   maxEntries: 50,
                   maxAgeSeconds: 60 * 60 * 24 * 30
                }
             }
          }
        ]
      }
    })
  ],
});