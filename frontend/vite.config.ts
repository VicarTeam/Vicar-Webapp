import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import webfontDownload from 'vite-plugin-webfont-dl';
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    webfontDownload(),
    vue(),
    vueDevTools(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['icon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Vicar',
        short_name: 'Vicar',
        description: 'Charakterverwaltung für World of Darkness und Darkborne',
        lang: 'de',
        dir: 'ltr',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#101013',
        theme_color: '#101013',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Nur die App-Shell precachen – NICHT die vielen statischen Symbol-PNGs.
        globPatterns: ['**/*.{js,css,html,woff,woff2}'],
        navigateFallback: '/index.html',
        // Backend-Navigationen (Discord-Login /api/auth/login/..., OAuth-Callback
        // /api/auth/callback/...) NICHT mit der App-Shell beantworten, sondern ans
        // Netzwerk/Backend durchlassen. Sonst schluckt der SPA-Fallback den Redirect
        // und man landet scheinbar wieder im Frontend (nur ein Hard-Reload half).
        navigateFallbackDenylist: [/^\/api(\/|$)/],
        runtimeCaching: [
          {
            // Hochgeladene Bilder (Avatare/Skill-Tree) vom Backend-CDN. Dateinamen
            // sind UUID-basiert/immutable -> CacheFirst. `includes` deckt sowohl
            // same-origin `/api/cdn/...` als auch ein evtl. blankes `/cdn/...` ab.
            urlPattern: ({ url }) => url.pathname.includes('/cdn/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'vicar-cdn-images',
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Statische Spiel-Symbole (Clans/Stämme/Sphären/...).
            urlPattern: ({ url }) => url.pathname.startsWith('/img/'),
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'vicar-static-images',
              expiration: { maxEntries: 400, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      // Service-Worker im Dev deaktiviert (Docker-HMR unberührt).
      devOptions: { enabled: false },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    host: true,
    // Im Docker-Container Polling nutzen, damit Datei-Änderungen vom Host
    // zuverlässig erkannt werden (HMR). Auf dem Host-Dev bleibt alles normal.
    watch: process.env.DOCKER_DEV ? { usePolling: true } : undefined,
  },
})
