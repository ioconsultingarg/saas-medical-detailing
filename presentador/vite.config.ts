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
      includeAssets: ['icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'],
      manifest: {
        id: '/saas-medical-detailing/',
        lang: 'es-AR',
        dir: 'ltr',
        categories: ['business', 'medical', 'productivity'],
        name: 'IO-Pharma · e-detailing y CRM para laboratorios',
        short_name: 'IO-Pharma',
        description: 'Ruta del día, presentaciones interactivas, stock, academia y cierre de visita para visitadores médicos',
        theme_color: '#0a0f16',
        background_color: '#0a0f16',
        display: 'standalone',
        orientation: 'any',
        start_url: '/saas-medical-detailing/',
        scope: '/saas-medical-detailing/',
        icons: [
          { src: '/saas-medical-detailing/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/saas-medical-detailing/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/saas-medical-detailing/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: '/saas-medical-detailing/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
        // el navegador las muestra en el diálogo de instalación
        screenshots: [
          { src: '/saas-medical-detailing/captura-escritorio.png', sizes: '1280x800', type: 'image/png', form_factor: 'wide', label: 'La ruta del día en escritorio' },
          { src: '/saas-medical-detailing/captura-movil.png', sizes: '750x1624', type: 'image/png', form_factor: 'narrow', label: 'La ruta del día en el celular' },
        ],
        shortcuts: [
          { name: 'Agenda de hoy', url: '/saas-medical-detailing/#/', description: 'Ruta y visitas del día' },
          { name: 'Biblioteca', url: '/saas-medical-detailing/#/biblioteca', description: 'Presentaciones aprobadas' },
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
