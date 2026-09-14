import { createContext, useContext, type CSSProperties, type ReactNode } from 'react'
import { Check, Plus } from 'lucide-react'
import { MonogramaProducto } from '../components/ui'
import { productos } from '../data/productos'
import type { ProductoId } from '../types'

export interface ContextoDiapositiva {
  interactivo: boolean
  vistos: ReadonlySet<string>
  abrir: (recursoId: string) => void
}

export const DiapositivaCtx = createContext<ContextoDiapositiva>({
  interactivo: false,
  vistos: new Set(),
  abrir: () => {},
})

/** Unidad del lienzo: 1 = 1% del ancho de la diapositiva */
export const cq = (n: number) => `${n}cqw`

export function Lienzo({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div className={`lienzo ${className}`} style={style}>
      {children}
    </div>
  )
}

interface MarcoProps {
  producto: ProductoId
  seccion: string
  numero: number
  referencias?: string
  children: ReactNode
}

/** Estructura común: marca arriba a la izquierda, sección arriba a la derecha, referencias al pie */
export function Marco({ producto, seccion, numero, referencias, children }: MarcoProps) {
  const p = productos[producto]
  return (
    <div className="absolute inset-0 flex flex-col" style={{ padding: `${cq(4.2)} ${cq(5.2)} ${cq(3)}` }}>
      <div className="flex items-center justify-between" style={{ gap: cq(2) }}>
        <div className="flex items-center" style={{ gap: cq(1) }} translate="no">
          <span className="block" style={{ width: cq(2.4), height: cq(2.4) }}>
            <MonogramaProducto id={producto} size={100} className="h-full w-full" />
          </span>
          <span className="font-semibold" style={{ fontSize: cq(1.45), color: p.color }}>
            {p.marca}
          </span>
          <span className="text-ink-3" style={{ fontSize: cq(1.15) }}>
            {p.detalle}
          </span>
        </div>
        <span className="font-mono text-ink-3 uppercase" style={{ fontSize: cq(1.05), letterSpacing: '0.08em' }}>
          {String(numero).padStart(2, '0')} · {seccion}
        </span>
      </div>

      <div className="relative min-h-0 flex-1" style={{ marginTop: cq(2.6) }}>
        {children}
      </div>

      <div
        className="flex items-end justify-between border-t border-line text-ink-3"
        style={{ gap: cq(3), paddingTop: cq(1.1), fontSize: cq(0.98), lineHeight: 1.35 }}
      >
        <span className="max-w-[78%]">{referencias ?? 'Material de demostración con datos ilustrativos.'}</span>
        <span className="font-mono whitespace-nowrap" translate="no">
          Laboratorio Demo S.A.
        </span>
      </div>
    </div>
  )
}

interface RecursoProps {
  recurso: string
  children: ReactNode
  tono?: 'marca' | 'claro' | 'contorno'
  producto: ProductoId
  className?: string
  style?: CSSProperties
}

/** Hotspot integrado al diseño como botón de la pieza */
export function BotonRecurso({ recurso, children, tono = 'marca', producto, className = '', style }: RecursoProps) {
  const { interactivo, vistos, abrir } = useContext(DiapositivaCtx)
  const p = productos[producto]
  const visto = vistos.has(recurso)
  const colores: Record<string, CSSProperties> = {
    marca: { background: p.color, color: '#fff' },
    claro: { background: '#fff', color: p.colorOscuro },
    contorno: { background: 'transparent', color: p.colorOscuro, boxShadow: `inset 0 0 0 1.5px ${p.color}` },
  }
  const estilo: CSSProperties = {
    ...colores[tono],
    fontSize: cq(1.3),
    gap: cq(0.8),
    padding: `${cq(0.95)} ${cq(1.5)} ${cq(0.95)} ${cq(1)}`,
    borderRadius: cq(3),
    minHeight: 'max(32px, 4.2cqw)',
    ...style,
  }
  const marca = (
    <span
      aria-hidden="true"
      className="relative flex shrink-0 items-center justify-center rounded-full"
      style={{ width: cq(2.2), height: cq(2.2), background: tono === 'marca' ? p.acento : p.color, color: tono === 'marca' ? p.sobreAcento : '#fff' }}
    >
      {!visto && interactivo && <span className="anillo-pulso absolute inset-0 rounded-full" style={{ color: tono === 'marca' ? p.acento : p.color }} />}
      {visto ? <Check className="relative" style={{ width: '62%', height: '62%' }} strokeWidth={3} /> : <Plus className="relative" style={{ width: '62%', height: '62%' }} strokeWidth={3} />}
    </span>
  )

  if (!interactivo) {
    return (
      <span className={`inline-flex items-center font-semibold ${className}`} style={estilo} aria-hidden="true">
        {marca}
        {children}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        abrir(recurso)
      }}
      className={`press inline-flex cursor-pointer items-center font-semibold hover:brightness-110 ${className}`}
      style={estilo}
      aria-label={`${typeof children === 'string' ? children : 'Ver recurso'}${visto ? ' (ya visto)' : ''}`}
    >
      {marca}
      {children}
    </button>
  )
}

/** Hotspot puntual sobre un gráfico o diagrama */
export function PuntoRecurso({ recurso, etiqueta, producto, style }: { recurso: string; etiqueta: string; producto: ProductoId; style: CSSProperties }) {
  const { interactivo, vistos, abrir } = useContext(DiapositivaCtx)
  const p = productos[producto]
  const visto = vistos.has(recurso)
  const punto = (
    <span className="relative flex items-center justify-center rounded-full" style={{ width: cq(2.6), height: cq(2.6), background: p.color, color: '#fff', boxShadow: `0 0 0 ${cq(0.45)} #fff` }}>
      {!visto && interactivo && <span className="anillo-pulso absolute inset-0 rounded-full" style={{ color: p.color }} />}
      {visto ? <Check className="relative" style={{ width: '58%', height: '58%' }} strokeWidth={3} /> : <Plus className="relative" style={{ width: '58%', height: '58%' }} strokeWidth={3} />}
    </span>
  )

  if (!interactivo) {
    return (
      <span aria-hidden="true" className="absolute -translate-x-1/2 -translate-y-1/2" style={style}>
        {punto}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        abrir(recurso)
      }}
      aria-label={`${etiqueta}${visto ? ' (ya visto)' : ''}`}
      className="press absolute flex -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full"
      style={{ minWidth: 'max(40px, 5cqw)', minHeight: 'max(40px, 5cqw)', ...style }}
    >
      {punto}
    </button>
  )
}

/** Gráfico de líneas estático para las piezas (el interactivo vive en el panel del recurso) */
export function LineasPieza({
  semanas,
  series,
  destacar,
  unidad,
}: {
  semanas: number[]
  series: { nombre: string; color: string; valores: number[] }[]
  destacar?: number
  unidad: string
}) {
  const W = 560
  const H = 300
  const pad = { t: 16, r: 18, b: 40, l: 46 }
  const max = Math.ceil(Math.max(...series.flatMap((s) => s.valores)) / 10) * 10 || 10
  const x = (i: number) => pad.l + (i / (semanas.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const ticks = [0, max / 2, max]

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" role="img" aria-label={`${unidad}: ${series.map((s) => `${s.nombre} ${s.valores[s.valores.length - 1]}`).join(', ')}`}>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e6ec" strokeWidth={1} />
          <text x={pad.l - 10} y={y(t) + 4} textAnchor="end" fontSize={12} fill="#56617a" fontFamily="IBM Plex Mono">
            {t}
          </text>
        </g>
      ))}
      {semanas.map((s, i) => (
        <text key={s} x={x(i)} y={H - pad.b + 22} textAnchor="middle" fontSize={12} fill="#56617a" fontFamily="IBM Plex Mono">
          {s}
        </text>
      ))}
      <text x={W - pad.r} y={H - 4} textAnchor="end" fontSize={11} fill="#56617a">
        Semanas
      </text>
      {destacar !== undefined && (
        <line x1={x(destacar)} x2={x(destacar)} y1={pad.t} y2={H - pad.b} stroke="#0b1220" strokeWidth={1} strokeDasharray="3 4" />
      )}
      {series.map((s, si) => (
        <g key={s.nombre}>
          <polyline
            points={s.valores.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
            fill="none"
            stroke={s.color}
            strokeWidth={si === 0 ? 3.5 : 2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx={x(s.valores.length - 1)} cy={y(s.valores[s.valores.length - 1])} r={si === 0 ? 5 : 3.5} fill={s.color} />
          <text
            x={x(s.valores.length - 1) - 8}
            y={y(s.valores[s.valores.length - 1]) - 10}
            textAnchor="end"
            fontSize={13}
            fontWeight={600}
            fill={s.color}
            fontFamily="IBM Plex Mono"
          >
            {s.valores[s.valores.length - 1]}
          </text>
        </g>
      ))}
    </svg>
  )
}
