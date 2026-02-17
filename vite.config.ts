
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'Basirah - Al-Quran Digital',
        short_name: 'Basirah',
        description: 'Aplikasi Al-Quran Digital dengan fitur Tadabbur, Refleksi Emosi, dan desain klasik yang menenangkan jiwa.',
        theme_color: '#fcfbf7',
        background_color: '#fcfbf7',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-64x64.png',
            sizes: '64x64',
            type: 'image/png'
          },
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'  
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
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
          // Note: Mushaf Images and Audio are handled manually in the app services using Cache API directly
          // to give user explicit control over large downloads.
        ]
      }
    })
  ],
});
