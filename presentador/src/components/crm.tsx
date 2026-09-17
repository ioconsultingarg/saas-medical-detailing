import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react'
import type { Categoria, Prioridad } from '../data/crm'

export function Avatar({ nombre, size = 40 }: { nombre: string; size?: number }) {
  const letras = nombre
    .replace(/^Dra?\.\s*/, '')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
  return (
    <span
      aria-hidden="true"
      className="flex shrink-0 items-center justify-center rounded-full bg-sunken font-semibold text-ink-2"
      style={{ width: size, height: size, fontSize: size * 0.34 }}
    >
      {letras}
    </span>
  )
}

const estiloCategoria: Record<Categoria, string> = {
  A: 'bg-ink text-white',
  B: 'bg-line-2/70 text-ink',
  C: 'bg-sunken text-ink-3',
}

export function BadgeCategoria({ categoria }: { categoria: Categoria }) {
  return (
    <span className={`num inline-flex h-6 min-w-6 items-center justify-center rounded-md px-1.5 text-[12px] font-semibold ${estiloCategoria[categoria]}`} title={`Categoría ${categoria}`}>
      <span className="sr-only">Categoría </span>
      {categoria}
    </span>
  )
}

/** Variación con flecha y signo: nunca solo color */
export function Variacion({ valor, className = '' }: { valor: number; className?: string }) {
  const pct = Math.round(valor * 100)
  const Icono = pct > 1 ? ArrowUpRight : pct < -1 ? ArrowDownRight : Minus
  const color = pct >= 5 ? 'text-ok' : pct <= -5 ? 'text-bad' : 'text-ink-3'
  return (
    <span className={`num inline-flex items-center gap-0.5 font-medium whitespace-nowrap ${color} ${className}`}>
      <Icono size={14} strokeWidth={2.4} aria-hidden="true" />
      {pct > 0 ? '+' : pct < 0 ? '−' : ''}
      {Math.abs(pct)} %
    </span>
  )
}

export function Sparkline({ valores, ancho = 72, alto = 24, color }: { valores: number[]; ancho?: number; alto?: number; color?: string }) {
  const max = Math.max(...valores)
  const min = Math.min(...valores)
  const rango = max - min || 1
  const puntos = valores.map((v, i) => [(i / (valores.length - 1)) * (ancho - 4) + 2, alto - 3 - ((v - min) / rango) * (alto - 6)])
  const baja = valores[valores.length - 1] < valores[0]
  const trazo = color ?? (baja ? 'var(--color-bad)' : 'var(--color-ok)')
  const [ux, uy] = puntos[puntos.length - 1]
  return (
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} aria-hidden="true" className="shrink-0">
      <polyline points={puntos.map((p) => p.join(',')).join(' ')} fill="none" stroke={trazo} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={ux} cy={uy} r="2.4" fill={trazo} />
    </svg>
  )
}

const estiloPrioridad: Record<Prioridad['nivel'], string> = {
  alta: 'bg-bad-soft text-bad',
  media: 'bg-warn-soft text-warn',
  normal: 'bg-sunken text-ink-3',
}

export function ChipPrioridad({ prioridad }: { prioridad: Prioridad }) {
  if (prioridad.nivel === 'normal') return null
  return (
    <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[12px] font-semibold whitespace-nowrap ${estiloPrioridad[prioridad.nivel]}`}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      Prioridad {prioridad.nivel}
    </span>
  )
}

export function textoDias(dias: number) {
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  return `Hace ${dias} días`
}
