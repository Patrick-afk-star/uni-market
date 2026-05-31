import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { VitePWA } from 'vite-plugin-pwa'
export default defineConfig({
  plugins: [react(), VitePWA({
    registerType: 'autoUpdate',
    includeAssets: [
      'favicon.ico',
      'apple-touch-icon.png',
      'mask-icon.svg'
    ],
    devOptions: {
      enabled: true,
    },
    workbox: {
      cleanupOutdatedCaches: true,
      clientsClaim: true,
      skipWaiting: true,
      globPatterns: ["**/*.{js,css,html,ico,png,svg,webmanifest}"],
    },
    manifest: {
      name: 'Student Marketplace',
      short_name: 'Market',
      description: 'The premium, responsive marketplace built for students.',
      start_url: '/',
      display: 'standalone',
      orientation: 'portrait',
      background_color: '#0d0f0e',
      theme_color: '#0d0f0e',
      categories: ['shopping', 'education'],
      icons: [
        {
          src: '/icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: '/icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
})