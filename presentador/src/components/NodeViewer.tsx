import { useState } from 'react'
import type { ContentNode, Hotspot } from '../types'
import { HotspotOverlay } from './HotspotOverlay'
import { Popup } from './Popup'

interface Props {
  nodo: ContentNode
  ambiente: string
}

export function NodeViewer({ nodo, ambiente }: Props) {
  const [popup, setPopup] = useState<{ titulo: string; texto: string } | null>(null)

  function handleHotspot(hotspot: Hotspot) {
    if (hotspot.accion.tipo === 'abrir_popup') {
      setPopup({ titulo: hotspot.accion.titulo, texto: hotspot.accion.texto })
    } else {
      window.open(hotspot.accion.url, '_blank')
    }
  }

  const tieneHotspots = Boolean(nodo.hotspots && nodo.hotspots.length > 0)

  return (
    <div className="stage-wrap" style={{ background: ambiente }}>
      <div className="stage">
        <div className="stage-screen" key={nodo.id}>
          {nodo.tipo === 'imagen' && <img src={nodo.url} alt={nodo.titulo} />}
          {nodo.tipo === 'pdf' && <iframe src={nodo.url} title={nodo.titulo} />}
          {nodo.tipo === 'video' && <video src={nodo.url} controls />}

          {tieneHotspots && <HotspotOverlay hotspots={nodo.hotspots!} onHotspot={handleHotspot} />}
        </div>
      </div>

      <div className="stage-caption">
        <span className="stage-caption__title">{nodo.titulo}</span>
        {tieneHotspots ? (
          <span className="hint">
            <span className="hint-dot" />
            Tocá los puntos para ampliar
          </span>
        ) : (
          <span className="badge">{nodo.tipo}</span>
        )}
      </div>

      {popup && <Popup titulo={popup.titulo} texto={popup.texto} onClose={() => setPopup(null)} />}
    </div>
  )
}
