import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// GitHub Pages serves the site from /<repo-name>/. Locally we use the root.
// The deploy workflow sets BASE_PATH=/kleine-ontdekker/.
const base = process.env.BASE_PATH || '/'

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'favicon.svg', 'audio/**/*'],
      manifest: {
        name: 'Kleine Ontdekker',
        short_name: 'Ontdekker',
        description: 'Spelenderwijs cijfers, letters, vormen en kleuren leren.',
        lang: 'nl',
        display: 'standalone',
        orientation: 'any',
        background_color: '#FFF4DE',
        theme_color: '#FFF4DE',
        start_url: base,
        scope: base,
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cache everything the app needs, including recorded audio clips,
        // so it works fully offline once opened.
        globPatterns: ['**/*.{js,css,html,svg,png,woff2,mp3,m4a,json}'],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      },
    }),
  ],
})
