import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource-variable/instrument-sans'
import '@fontsource/ibm-plex-mono/400.css'
import '@fontsource/ibm-plex-mono/500.css'
import 'leaflet/dist/leaflet.css'
import './index.css'
import App from './App.tsx'

/*
 * El service worker se actualiza solo, pero la pestaña abierta seguía mostrando la versión
 * vieja hasta cerrarla. Al tomar el control una versión nueva, se recarga una sola vez.
 */
if ('serviceWorker' in navigator) {
  let recargando = false
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargando) return
    recargando = true
    location.reload()
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
