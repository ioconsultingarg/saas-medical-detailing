import { useCallback, useEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCw } from 'lucide-react'
import { partirTitulo } from '../lib/titulos'
import type { ContentNode, Hotspot } from '../types'
import { HotspotOverlay } from './HotspotOverlay'
import { Popup } from './Popup'

interface Props {
  linea: ContentNode
  actualId: string
  onIr: (id: string) => void
  onSalir: () => void
}

type DocConFullscreen = Document & {
  webkitFullscreenElement?: Element | null
  webkitExitFullscreen?: () => void
  webkitFullscreenEnabled?: boolean
}
type ElementoConFullscreen = HTMLElement & { webkitRequestFullscreen?: () => void }

function enPantallaCompleta() {
  const d = document as DocConFullscreen
  return Boolean(d.fullscreenElement ?? d.webkitFullscreenElement)
}

// iPhone no soporta pantalla completa de elementos: ahí el botón no se muestra
function pantallaCompletaDisponible() {
  const d = document as DocConFullscreen
  return Boolean(d.fullscreenEnabled ?? d.webkitFullscreenEnabled)
}

const UMBRAL_SWIPE = 60
const SIN_SECCIONES: ContentNode[] = []

export function Presenter({ linea, actualId, onIr, onSalir }: Props) {
  const secciones = linea.children ?? SIN_SECCIONES
  const indice = Math.max(
    0,
    secciones.findIndex((s) => s.id === actualId),
  )
  const actual = secciones[indice]
  const { categoria, producto } = partirTitulo(linea.titulo)

  const [direccion, setDireccion] = useState<'next' | 'prev'>('next')
  const [popup, setPopup] = useState<{ titulo: string; texto: string } | null>(null)
  const [vistos, setVistos] = useState<Set<string>>(() => new Set())
  const [completa, setCompleta] = useState(false)
  const raizRef = useRef<HTMLDivElement>(null)
  const inicioGesto = useRef<{ x: number; y: number } | null>(null)

  const ir = useCallback(
    (destino: number) => {
      const siguiente = secciones[destino]
      if (!siguiente || destino === indice) return
      setDireccion(destino > indice ? 'next' : 'prev')
      onIr(siguiente.id)
    },
    [secciones, indice, onIr],
  )

  useEffect(() => {
    if (popup) return
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') ir(indice + 1)
      else if (e.key === 'ArrowLeft') ir(indice - 1)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [ir, indice, popup])

  useEffect(() => {
    function onCambio() {
      setCompleta(enPantallaCompleta())
    }
    document.addEventListener('fullscreenchange', onCambio)
    document.addEventListener('webkitfullscreenchange', onCambio)
    return () => {
      document.removeEventListener('fullscreenchange', onCambio)
      document.removeEventListener('webkitfullscreenchange', onCambio)
    }
  }, [])

  function alternarPantallaCompleta() {
    const d = document as DocConFullscreen
    if (enPantallaCompleta()) {
      if (d.exitFullscreen) void d.exitFullscreen().catch(() => {})
      else d.webkitExitFullscreen?.()
      return
    }
    const el = raizRef.current as ElementoConFullscreen | null
    if (!el) return
    if (el.requestFullscreen) void el.requestFullscreen().catch(() => {})
    else el.webkitRequestFullscreen?.()
  }

  // El mouse ya tiene flechas y botones; el gesto es para dedo y lápiz
  function onPointerDown(e: PointerEvent<HTMLElement>) {
    if (e.pointerType === 'mouse') return
    inicioGesto.current = { x: e.clientX, y: e.clientY }
  }

  function onPointerUp(e: PointerEvent<HTMLElement>) {
    const inicio = inicioGesto.current
    inicioGesto.current = null
    if (!inicio) return
    const dx = e.clientX - inicio.x
    const dy = e.clientY - inicio.y
    if (Math.abs(dx) > UMBRAL_SWIPE && Math.abs(dx) > Math.abs(dy) * 1.5) {
      ir(dx < 0 ? indice + 1 : indice - 1)
    }
  }

  function onHotspot(hotspot: Hotspot) {
    setVistos((prev) => new Set(prev).add(hotspot.id))
    if (hotspot.accion.tipo === 'abrir_popup') {
      setPopup({ titulo: hotspot.accion.titulo, texto: hotspot.accion.texto })
    } else {
      window.open(hotspot.accion.url, '_blank', 'noopener')
    }
  }

  if (!actual) return null

  const esDocumento = actual.tipo !== 'imagen'
  const nombrePieza = `${producto} — ${actual.titulo}`

  return (
    <div ref={raizRef} className="presenter" style={{ '--line': linea.color ?? '#0f6e63' } as CSSProperties}>
      <header className="p-top">
        <button className="p-btn" onClick={onSalir} aria-label="Volver al catálogo">
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="p-btn__label">Catálogo</span>
        </button>

        <div className="p-id">
          <span className="p-id__dot" aria-hidden="true" />
          <span className="p-id__text">
            {categoria && <span className="p-id__cat">{categoria}</span>}
            <span className="p-id__name">{producto}</span>
          </span>
        </div>

        <span className="p-count" aria-live="polite">
          {indice + 1} / {secciones.length}
        </span>

        {pantallaCompletaDisponible() && (
          <button
            className="p-btn p-btn--icon"
            onClick={alternarPantallaCompleta}
            aria-label={completa ? 'Salir de pantalla completa' : 'Pantalla completa'}
            aria-pressed={completa}
          >
            {completa ? <Minimize2 size={18} aria-hidden="true" /> : <Maximize2 size={18} aria-hidden="true" />}
          </button>
        )}
      </header>

      <main
        className="p-stage"
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          inicioGesto.current = null
        }}
      >
        <div className="p-fit">
          <div key={actual.id} data-dir={direccion} className={`p-slide ${esDocumento ? 'p-slide--doc' : ''}`}>
            {actual.tipo === 'imagen' && <img src={actual.url} alt={nombrePieza} draggable={false} />}
            {actual.tipo === 'pdf' && <iframe src={actual.url} title={nombrePieza} />}
            {actual.tipo === 'video' && <video src={actual.url} controls />}

            {actual.hotspots && actual.hotspots.length > 0 && (
              <HotspotOverlay hotspots={actual.hotspots} vistos={vistos} onHotspot={onHotspot} />
            )}
          </div>
        </div>

        <span className="p-rotate">
          <RotateCw size={14} aria-hidden="true" />
          Girá el teléfono para ver la pieza más grande
        </span>
      </main>

      <nav className="p-dock" aria-label="Secciones de la línea">
        <button
          className="p-btn p-nav"
          onClick={() => ir(indice - 1)}
          disabled={indice === 0}
          aria-label="Sección anterior"
        >
          <ChevronLeft size={22} aria-hidden="true" />
        </button>

        <div className="p-sections">
          {secciones.map((seccion, i) => (
            <button
              key={seccion.id}
              className={`p-chip ${i === indice ? 'is-active' : ''}`}
              onClick={() => ir(i)}
              aria-label={seccion.titulo}
              aria-current={i === indice ? 'page' : undefined}
            >
              <span className="p-chip__n" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="p-chip__title" aria-hidden="true">
                {seccion.titulo}
              </span>
            </button>
          ))}
        </div>

        <button
          className="p-btn p-nav"
          onClick={() => ir(indice + 1)}
          disabled={indice === secciones.length - 1}
          aria-label="Sección siguiente"
        >
          <ChevronRight size={22} aria-hidden="true" />
        </button>
      </nav>

      {popup && <Popup titulo={popup.titulo} texto={popup.texto} onClose={() => setPopup(null)} />}
    </div>
  )
}
