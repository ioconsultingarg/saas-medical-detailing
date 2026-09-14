import { useEffect, useRef, type PointerEvent as EventoPuntero } from 'react'
import { Eraser, PenLine, Undo2, X } from 'lucide-react'

type CanvasRepintable = HTMLCanvasElement & { repintar?: () => void }

export interface Trazo {
  color: string
  puntos: [number, number][]
}

export const coloresLapiz = [
  { valor: '#cfe94a', nombre: 'Lima' },
  { valor: '#0a6b5d', nombre: 'Teal' },
  { valor: '#ef4444', nombre: 'Rojo' },
  { valor: '#38bdf8', nombre: 'Celeste' },
]

function dibujar(ctx: CanvasRenderingContext2D, trazo: Trazo, w: number, h: number) {
  const pts = trazo.puntos
  if (pts.length === 0) return
  ctx.strokeStyle = trazo.color
  ctx.lineWidth = Math.max(3, w * 0.0042)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0][0] * w, pts[0][1] * h)
  if (pts.length === 1) {
    ctx.lineTo(pts[0][0] * w + 0.1, pts[0][1] * h)
  }
  // curvas cuadráticas entre puntos medios: trazo suave aun con pocos muestreos
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = ((pts[i][0] + pts[i + 1][0]) / 2) * w
    const my = ((pts[i][1] + pts[i + 1][1]) / 2) * h
    ctx.quadraticCurveTo(pts[i][0] * w, pts[i][1] * h, mx, my)
  }
  if (pts.length > 1) {
    const u = pts[pts.length - 1]
    ctx.lineTo(u[0] * w, u[1] * h)
  }
  ctx.stroke()
}

/** Capa de dibujo sobre la diapositiva. Coordenadas normalizadas: el trazo sobrevive a cambios de tamaño. */
export function CapaAnotacion({ activo, color, trazos, onTrazo }: { activo: boolean; color: string; trazos: Trazo[]; onTrazo: (t: Trazo) => void }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const actual = useRef<Trazo | null>(null)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const pintar = () => {
      const { width, height } = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      c.width = Math.round(width * dpr)
      c.height = Math.round(height * dpr)
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      for (const t of trazos) dibujar(ctx, t, width, height)
      if (actual.current) dibujar(ctx, actual.current, width, height)
    }
    pintar()
    const obs = new ResizeObserver(pintar)
    obs.observe(c)
    ;(c as CanvasRepintable).repintar = pintar
    return () => obs.disconnect()
  }, [trazos])

  function punto(e: EventoPuntero<HTMLCanvasElement>): [number, number] {
    const r = e.currentTarget.getBoundingClientRect()
    return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height]
  }

  function repintar() {
    ;(canvas.current as CanvasRepintable | null)?.repintar?.()
  }

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={`absolute inset-0 z-20 h-full w-full ${activo ? 'cursor-crosshair' : 'pointer-events-none'}`}
      style={{ touchAction: activo ? 'none' : 'auto' }}
      onPointerDown={(e) => {
        if (!activo) return
        e.stopPropagation()
        e.currentTarget.setPointerCapture(e.pointerId)
        actual.current = { color, puntos: [punto(e)] }
        repintar()
      }}
      onPointerMove={(e) => {
        if (!activo || !actual.current) return
        const eventos = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
        const r = e.currentTarget.getBoundingClientRect()
        for (const ev of eventos) actual.current.puntos.push([(ev.clientX - r.left) / r.width, (ev.clientY - r.top) / r.height])
        repintar()
      }}
      onPointerUp={() => {
        if (actual.current && actual.current.puntos.length > 0) onTrazo(actual.current)
        actual.current = null
      }}
      onPointerCancel={() => {
        actual.current = null
        repintar()
      }}
    />
  )
}

export function BarraAnotacion({
  color,
  onColor,
  onDeshacer,
  onBorrar,
  onCerrar,
  hayTrazos,
}: {
  color: string
  onColor: (c: string) => void
  onDeshacer: () => void
  onBorrar: () => void
  onCerrar: () => void
  hayTrazos: boolean
}) {
  return (
    <div role="toolbar" aria-label="Herramientas de anotación" className="material-oscuro animate-entrar flex items-center gap-1 rounded-2xl border border-white/10 p-1.5 text-white shadow-(--shadow-float)">
      <span className="flex size-11 items-center justify-center text-white/60" aria-hidden="true">
        <PenLine size={18} />
      </span>
      {coloresLapiz.map((c) => (
        <button
          key={c.valor}
          type="button"
          onClick={() => onColor(c.valor)}
          aria-label={`Color ${c.nombre}`}
          aria-pressed={color === c.valor}
          className="press flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10"
        >
          <span className="size-6 rounded-full" style={{ background: c.valor, boxShadow: color === c.valor ? '0 0 0 2px #0d1117, 0 0 0 4px #fff' : 'none' }} />
        </button>
      ))}
      <span aria-hidden="true" className="mx-1 h-6 w-px bg-white/15" />
      <button type="button" onClick={onDeshacer} disabled={!hayTrazos} className="press flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10 disabled:opacity-35" aria-label="Deshacer último trazo">
        <Undo2 size={18} aria-hidden="true" />
      </button>
      <button type="button" onClick={onBorrar} disabled={!hayTrazos} className="press flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10 disabled:opacity-35" aria-label="Borrar anotaciones de esta pantalla">
        <Eraser size={18} aria-hidden="true" />
      </button>
      <button type="button" onClick={onCerrar} className="press flex size-11 cursor-pointer items-center justify-center rounded-xl hover:bg-white/10" aria-label="Terminar de anotar">
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
