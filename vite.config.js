import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['surco logo.svg'],
      manifest: {
        name: 'Surco',
        short_name: 'Surco',
        description: 'Gestion agricola al maximo nivel.',
        theme_color: '#23967F',
        background_color: '#E3D0D8',
        display: 'standalone',
        icons: [
          {
            src: 'surco logo.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
          },
        ],
      },
    }),
  ],
})
