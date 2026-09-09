import { useState } from 'react'
import type { ContentNode, Hotspot } from '../types'
import { HotspotOverlay } from './HotspotOverlay'
import { Popup } from './Popup'

interface Props {
  nodo: ContentNode
}

export function NodeViewer({ nodo }: Props) {
  const [popup, setPopup] = useState<{ titulo: string; texto: string } | null>(null)

  function handleHotspot(hotspot: Hotspot) {
    if (hotspot.accion.tipo === 'abrir_popup') {
      setPopup({ titulo: hotspot.accion.titulo, texto: hotspot.accion.texto })
    } else {
      window.open(hotspot.accion.url, '_blank')
    }
  }

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 800, margin: '0 auto' }}>
      {nodo.tipo === 'imagen' && (
        <img src={nodo.url} alt={nodo.titulo} style={{ width: '100%', display: 'block', borderRadius: 8 }} />
      )}
      {nodo.tipo === 'pdf' && (
        <iframe
          src={nodo.url}
          title={nodo.titulo}
          style={{ width: '100%', height: '75vh', border: '1px solid #e2e8f0', borderRadius: 8 }}
        />
      )}
      {nodo.tipo === 'video' && (
        <video src={nodo.url} controls style={{ width: '100%', borderRadius: 8 }} />
      )}

      {nodo.hotspots && nodo.hotspots.length > 0 && (
        <HotspotOverlay hotspots={nodo.hotspots} onHotspot={handleHotspot} />
      )}

      {popup && <Popup titulo={popup.titulo} texto={popup.texto} onClose={() => setPopup(null)} />}
    </div>
  )
}
