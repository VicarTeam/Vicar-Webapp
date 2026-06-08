import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import webfontDownload from 'vite-plugin-webfont-dl';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    webfontDownload(),
    vue(),
    vueDevTools(),
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
