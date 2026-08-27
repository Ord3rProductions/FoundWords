import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// The React app is served under /app/ so the marketing homepage can live at the
// site root. A post-build step (scripts/build-site.mjs) moves the Vite output into
// dist/app/, lifts CNAME back to the root, and drops the static homepage at dist/.
export default defineConfig({
  base: '/app/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'icons/*.svg'],
      manifest: {
        name: 'Found Words',
        short_name: 'Found Words',
        description: 'AAC picture board for people with speech and communication difficulties',
        theme_color: '#4A90D9',
        background_color: '#E6E0F3',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/app/',
        scope: '/app/',
        icons: [
          {
            src: 'icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: 'icons/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff,woff2}'],
        cleanupOutdatedCaches: true,
        skipWaiting: false,
      },
    }),
  ],
})
