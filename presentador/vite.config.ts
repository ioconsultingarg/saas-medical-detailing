import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/saas-medical-detailing/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Presentador Medical Detailing',
        short_name: 'Presentador',
        description: 'Visor interactivo de material de detailing para APMs',
        theme_color: '#0f6e63',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/saas-medical-detailing/',
        scope: '/saas-medical-detailing/',
        icons: [
          {
            src: '/saas-medical-detailing/icon.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,ico}'],
      },
    }),
  ],
})
