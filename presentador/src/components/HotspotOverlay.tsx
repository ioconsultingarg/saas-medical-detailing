import { Check, Plus } from 'lucide-react'
import type { Hotspot } from '../types'

interface Props {
  hotspots: Hotspot[]
  vistos: Set<string>
  onHotspot: (hotspot: Hotspot) => void
}

export function HotspotOverlay({ hotspots, vistos, onHotspot }: Props) {
  return (
    <div className="hs-layer">
      {hotspots.map((hotspot) => {
        const visto = vistos.has(hotspot.id)
        const nombre = hotspot.accion.tipo === 'abrir_popup' ? hotspot.accion.titulo : 'Reproducir video'

        return (
          <button
            key={hotspot.id}
            className={`hs ${visto ? 'is-visto' : ''}`}
            onClick={() => onHotspot(hotspot)}
            aria-label={visto ? `${nombre} (ya visto)` : nombre}
            style={{
              left: `${hotspot.x * 100}%`,
              top: `${hotspot.y * 100}%`,
              width: `${hotspot.ancho * 100}%`,
              height: `${hotspot.alto * 100}%`,
            }}
          >
            <span className="hs__ring" aria-hidden="true" />
            <span className="hs__badge" aria-hidden="true">
              {visto ? <Check size={14} strokeWidth={3} /> : <Plus size={15} strokeWidth={3} />}
            </span>
          </button>
        )
      })}
    </div>
  )
}
