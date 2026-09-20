import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/saas-medical-detailing/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'IO-Pharma · e-detailing y CRM para laboratorios',
        short_name: 'IO-Pharma',
        description: 'Ruta del día, presentaciones interactivas, stock, academia y cierre de visita para visitadores médicos',
        theme_color: '#f5f6f8',
        background_color: '#f5f6f8',
        display: 'standalone',
        orientation: 'any',
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
        globPatterns: ['**/*.{js,css,html,svg,ico,woff2,pdf}'],
        // el modelo 3D (three.js) supera el límite por defecto de 2 MB
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        // sin esto, una versión nueva queda esperando y el usuario sigue viendo la anterior
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // videos de public/media: se guardan al verlos y quedan para la visita sin señal
            urlPattern: ({ url }) => url.pathname.includes('/media/'),
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 60 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
          {
            // teselas del mapa ya vistas: quedan disponibles sin conexión
            urlPattern: /^https:\/\/tile\.openstreetmap\.org\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'teselas-mapa',
              expiration: { maxEntries: 600, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],
})
