import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react'
import { productos } from '../data/productos'
import { etiquetaNivel } from '../data/stock'
import type { NivelStock, ProductoId } from '../types'

/** Monograma geométrico de cada marca ficticia */
export function MonogramaProducto({ id, size = 20, className = '' }: { id: ProductoId; size?: number; className?: string }) {
  const p = productos[id]
  if (id === 'cardio') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
        <circle cx="9" cy="12" r="7" fill={p.color} />
        <circle cx="15.5" cy="12" r="5.5" fill={p.acento} style={{ mixBlendMode: 'multiply' }} />
      </svg>
    )
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <rect x="2" y="2" width="20" height="20" rx="6" fill={p.color} />
      <path d="M7 15.5c1.6-4 8.4-4 10 0M8.5 11.5c1-2.2 6-2.2 7 0" stroke={p.acento} strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export function ChipProducto({ id, detalle = false }: { id: ProductoId; detalle?: boolean }) {
  const p = productos[id]
  return (
    <span className="chip" translate="no">
      <MonogramaProducto id={id} size={14} />
      {p.marca}
      {detalle && <span className="font-normal text-ink-3">· {p.linea}</span>}
    </span>
  )
}

const estiloNivel: Record<NivelStock, { clase: string; Icono: typeof CheckCircle2 }> = {
  alto: { clase: 'bg-ok-soft text-ok', Icono: CheckCircle2 },
  bajo: { clase: 'bg-warn-soft text-warn', Icono: AlertTriangle },
  sin: { clase: 'bg-bad-soft text-bad', Icono: XCircle },
}

/** Semáforo de inventario: color + ícono + texto, nunca solo color */
export function Semaforo({ nivel }: { nivel: NivelStock }) {
  const { clase, Icono } = estiloNivel[nivel]
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${clase}`}>
      <Icono size={13} strokeWidth={2.4} aria-hidden="true" />
      {etiquetaNivel[nivel]}
    </span>
  )
}

export function EncabezadoPantalla({
  eyebrow,
  titulo,
  descripcion,
  acciones,
}: {
  eyebrow?: ReactNode
  titulo: ReactNode
  descripcion?: ReactNode
  acciones?: ReactNode
}) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 pt-6 pb-5 md:pt-8">
      <div className="min-w-0">
        {eyebrow && <div className="eyebrow mb-2">{eyebrow}</div>}
        <h1 className="text-[28px] leading-[1.1] font-semibold text-ink md:text-[34px]">{titulo}</h1>
        {descripcion && <p className="mt-2 max-w-[60ch] text-[15px] leading-relaxed text-ink-3">{descripcion}</p>}
      </div>
      {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
    </header>
  )
}

/** Control segmentado accesible (botones con aria-pressed) */
export function Segmentado<T extends string>({
  opciones,
  valor,
  onCambio,
  etiqueta,
}: {
  opciones: { valor: T; texto: ReactNode }[]
  valor: T
  onCambio: (v: T) => void
  etiqueta: string
}) {
  return (
    <div role="group" aria-label={etiqueta} className="inline-flex max-w-full overflow-x-auto rounded-xl bg-sunken p-1">
      {opciones.map((o) => {
        const activo = o.valor === valor
        return (
          <button
            key={o.valor}
            type="button"
            aria-pressed={activo}
            onClick={() => onCambio(o.valor)}
            className={`press inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-lg px-3.5 text-[14px] font-medium whitespace-nowrap ${
              activo ? 'bg-surface text-ink shadow-(--shadow-card)' : 'text-ink-3 hover:text-ink'
            }`}
          >
            {o.texto}
          </button>
        )
      })}
    </div>
  )
}

/** Anillo de progreso para KPIs */
export function Anillo({ valor, total, size = 64, color = 'var(--color-ink)', grosor = 6 }: { valor: number; total: number; size?: number; color?: string; grosor?: number }) {
  const r = (size - grosor) / 2
  const c = 2 * Math.PI * r
  const p = total > 0 ? Math.min(1, valor / total) : 0
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-sunken)" strokeWidth={grosor} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={grosor}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - p)}
        style={{ transition: 'stroke-dashoffset 600ms var(--ease-fluid)' }}
      />
    </svg>
  )
}
