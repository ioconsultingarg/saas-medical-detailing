import type { Hotspot } from '../types'

interface Props {
  hotspots: Hotspot[]
  onHotspot: (hotspot: Hotspot) => void
}

export function HotspotOverlay({ hotspots, onHotspot }: Props) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {hotspots.map((hotspot) => (
        <button
          key={hotspot.id}
          className="hotspot-hit"
          onClick={() => onHotspot(hotspot)}
          aria-label={
            hotspot.accion.tipo === 'abrir_popup' ? hotspot.accion.titulo : 'Reproducir video'
          }
          style={{
            left: `${hotspot.x * 100}%`,
            top: `${hotspot.y * 100}%`,
            width: `${hotspot.ancho * 100}%`,
            height: `${hotspot.alto * 100}%`,
          }}
        >
          <span className="hotspot-marker" aria-hidden="true">
            +
          </span>
        </button>
      ))}
    </div>
  )
}
