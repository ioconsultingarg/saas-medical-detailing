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
          onClick={() => onHotspot(hotspot)}
          aria-label={
            hotspot.accion.tipo === 'abrir_popup' ? hotspot.accion.titulo : 'Reproducir video'
          }
          style={{
            position: 'absolute',
            left: `${hotspot.x * 100}%`,
            top: `${hotspot.y * 100}%`,
            width: `${hotspot.ancho * 100}%`,
            height: `${hotspot.alto * 100}%`,
            background: 'rgba(37, 99, 235, 0.18)',
            border: '2px dashed rgba(37, 99, 235, 0.6)',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        />
      ))}
    </div>
  )
}
