import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa-192.svg', 'pwa-512.svg', 'surco logo.svg'],
      manifest: {
        name: 'Surco Mantenimiento',
        short_name: 'Surco',
        description: 'Gestion de maquinaria agricola, reportes y mantenimientos.',
        theme_color: '#23967F',
        background_color: '#E3D0D8',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
          },
          {
            src: 'pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})
