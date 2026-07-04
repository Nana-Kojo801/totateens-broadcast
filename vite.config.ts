import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'totateens_icon_rounded.png'],
      manifest: {
        name: 'TOTATeens Broadcast',
        short_name: 'TOTA Broadcast',
        description: 'Daily devotional WhatsApp broadcast — upload once, the whole month takes care of itself.',
        theme_color: '#2F7D5C',
        background_color: '#F7F7F4',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/totateens_icon_rounded.png', sizes: '192x192', type: 'image/png' },
          { src: '/totateens_icon_rounded.png', sizes: '512x512', type: 'image/png' },
          { src: '/totateens_icon_rounded.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  server: {
    watch: {
      // Prevent Vite HMR from triggering full-page reloads when whatsapp-web.js
      // writes session/auth files during QR scan and authentication.
      ignored: ['**/.wwebjs_auth/**', '**/.wwebjs_cache/**'],
    },
  },
})
