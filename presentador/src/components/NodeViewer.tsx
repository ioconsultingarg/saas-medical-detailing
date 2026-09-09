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
    <div className="stage">
      <div className="stage-header">
        <span className="stage-title">{nodo.titulo}</span>
        <span className="badge">{nodo.tipo}</span>
      </div>

      <div className="stage-body">
        {nodo.tipo === 'imagen' && <img src={nodo.url} alt={nodo.titulo} />}
        {nodo.tipo === 'pdf' && <iframe src={nodo.url} title={nodo.titulo} />}
        {nodo.tipo === 'video' && <video src={nodo.url} controls />}

        {nodo.hotspots && nodo.hotspots.length > 0 && (
          <HotspotOverlay hotspots={nodo.hotspots} onHotspot={handleHotspot} />
        )}
      </div>

      {popup && <Popup titulo={popup.titulo} texto={popup.texto} onClose={() => setPopup(null)} />}
    </div>
  )
}
