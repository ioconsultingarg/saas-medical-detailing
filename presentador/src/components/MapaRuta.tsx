import { useEffect, useMemo } from 'react'
import L from 'leaflet'
import { MapContainer, Marker, Polyline, TileLayer, Tooltip, useMap } from 'react-leaflet'
import { CloudOff } from 'lucide-react'
import { prefiereMenosMovimiento } from '../lib/tiempo'
import type { RegistroVisita, Visita } from '../types'

interface Props {
  visitas: Visita[]
  registros: Record<string, RegistroVisita>
  seleccionId: string | null
  posicionApm: { lat: number; lng: number } | null
  online: boolean
  onSeleccionar: (id: string) => void
}

function icono(n: number, estado: RegistroVisita['estado'] | 'pendiente', seleccionado: boolean) {
  const base =
    'display:flex;align-items:center;justify-content:center;border-radius:9999px;font:600 13px/1 "IBM Plex Mono",monospace;transition:transform 160ms cubic-bezier(.23,1,.32,1);'
  const tam = seleccionado ? 38 : 30
  const estilos: Record<string, string> = {
    completada: 'background:#fff;color:#047857;border:2px solid #047857;',
    en_curso: 'background:#0b1220;color:#fff;border:2px solid #fff;box-shadow:0 0 0 3px rgba(52,211,153,.55);',
    pendiente: 'background:#fff;color:#0b1220;border:2px solid #0b1220;',
  }
  const sombra = seleccionado ? 'box-shadow:0 8px 20px -4px rgba(11,18,32,.45);' : 'box-shadow:0 2px 6px rgba(11,18,32,.25);'
  const contenido = estado === 'completada' ? '✓' : String(n)
  return L.divIcon({
    className: 'pin-visita',
    iconSize: [tam, tam],
    iconAnchor: [tam / 2, tam / 2],
    html: `<div style="${base}width:${tam}px;height:${tam}px;${estilos[estado]}${sombra}">${contenido}</div>`,
  })
}

const iconoApm = L.divIcon({
  className: 'pin-visita',
  iconSize: [22, 22],
  iconAnchor: [11, 11],
  html: '<div style="width:22px;height:22px;border-radius:9999px;background:#0369a1;border:3px solid #fff;box-shadow:0 0 0 6px rgba(3,105,161,.18),0 2px 6px rgba(11,18,32,.3)"></div>',
})

function Enfocar({ centro }: { centro: [number, number] | null }) {
  const map = useMap()
  useEffect(() => {
    if (!centro) return
    if (prefiereMenosMovimiento()) map.setView(centro, Math.max(map.getZoom(), 14))
    else map.flyTo(centro, Math.max(map.getZoom(), 14), { duration: 0.55 })
  }, [centro, map])
  return null
}

function AjustarTamano() {
  const map = useMap()
  useEffect(() => {
    const el = map.getContainer()
    const obs = new ResizeObserver(() => map.invalidateSize())
    obs.observe(el)
    return () => obs.disconnect()
  }, [map])
  return null
}

export function MapaRuta({ visitas, registros, seleccionId, posicionApm, online, onSeleccionar }: Props) {
  const ruta = useMemo(() => visitas.map((v) => [v.lat, v.lng] as [number, number]), [visitas])
  const limites = useMemo(() => L.latLngBounds(ruta).pad(0.12), [ruta])
  const seleccion = visitas.find((v) => v.id === seleccionId)
  const centro = useMemo<[number, number] | null>(() => (seleccion ? [seleccion.lat, seleccion.lng] : null), [seleccion])

  return (
    <div className="relative isolate h-full overflow-hidden rounded-2xl border border-line bg-sunken">
      <MapContainer bounds={limites} scrollWheelZoom={false} zoomControl={false} className="h-full w-full" attributionControl>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          maxZoom={19}
          className="teselas-neutras"
        />
        <Polyline positions={ruta} pathOptions={{ color: '#0b1220', weight: 3, opacity: 0.55, dashArray: '2 8', lineCap: 'round' }} />
        {visitas.map((v, i) => {
          const estado = registros[v.id]?.estado ?? 'pendiente'
          return (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={icono(i + 1, estado, v.id === seleccionId)}
              zIndexOffset={v.id === seleccionId ? 1000 : estado === 'en_curso' ? 500 : 0}
              eventHandlers={{ click: () => onSeleccionar(v.id) }}
              keyboard
              title={`${v.hora} · ${v.medico.nombre}`}
            >
              <Tooltip direction="top" offset={[0, -16]}>
                <span className="num">{v.hora}</span> · {v.medico.nombre}
              </Tooltip>
            </Marker>
          )
        })}
        {posicionApm && <Marker position={[posicionApm.lat, posicionApm.lng]} icon={iconoApm} title="Tu ubicación" />}
        <Enfocar centro={centro} />
        <AjustarTamano />
      </MapContainer>

      {!online && (
        <div className="material pointer-events-none absolute top-3 left-3 z-[500] inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-[12px] font-medium text-ink-2">
          <CloudOff size={14} aria-hidden="true" />
          Sin conexión · zonas ya vistas
        </div>
      )}
    </div>
  )
}
