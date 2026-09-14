import type { ReactNode } from 'react'
import { Boxes, CalendarRange, CloudOff, Library, RefreshCw, Stethoscope } from 'lucide-react'
import { cronometro } from '../lib/formato'
import type { Ruta } from '../lib/ruta'
import { useAhora } from '../lib/tiempo'
import { nombreCorto, useDemo } from '../state/demo'

const navegacion = [
  { href: '#/', etiqueta: 'Hoy', Icono: CalendarRange, activa: (r: Ruta) => r.nombre === 'hoy' },
  { href: '#/biblioteca', etiqueta: 'Biblioteca', Icono: Library, activa: (r: Ruta) => r.nombre === 'biblioteca' || r.nombre === 'constructor' },
  { href: '#/stock', etiqueta: 'Stock', Icono: Boxes, activa: (r: Ruta) => r.nombre === 'stock' },
  { href: '#/actividad', etiqueta: 'Actividad', Icono: RefreshCw, activa: (r: Ruta) => r.nombre === 'actividad' },
]

function Logo() {
  return (
    <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0b1220" />
      <path d="M10 22V10h6.5a4 4 0 0 1 0 8H10" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.5" cy="22.5" r="2.6" fill="#7cc4ee" />
    </svg>
  )
}

function EstadoConexion() {
  const { online, pendientes } = useDemo()
  const sincronizando = online && pendientes > 0

  return (
    <a
      href="#/actividad"
      className={`press inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full border px-3 text-[13px] font-medium ${
        online ? 'border-line bg-surface text-ink-2 hover:bg-sunken' : 'border-warn/30 bg-warn-soft text-warn'
      }`}
    >
      {!online ? (
        <CloudOff size={16} aria-hidden="true" />
      ) : sincronizando ? (
        <RefreshCw size={15} aria-hidden="true" className="spinner" />
      ) : (
        <span aria-hidden="true" className="size-2 rounded-full bg-ok" />
      )}
      <span className="hidden sm:inline">
        {!online ? 'Sin conexión' : sincronizando ? 'Sincronizando…' : 'Sincronizado'}
      </span>
      {pendientes > 0 && (
        <span className="num rounded-full bg-ink px-1.5 text-[11px] leading-5 text-white" aria-label={`${pendientes} pendientes`}>
          {pendientes}
        </span>
      )}
    </a>
  )
}

function VisitaEnCurso() {
  const { visitaActiva, estado } = useDemo()
  const ahora = useAhora(1000, Boolean(visitaActiva))
  if (!visitaActiva) return null
  const inicio = estado.registros[visitaActiva.id]?.checkIn ?? ahora

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-full bg-ink py-1 pr-1 pl-3 text-white shadow-(--shadow-float)">
      <span aria-hidden="true" className="anillo-pulso relative size-2 shrink-0 rounded-full bg-[#34d399] text-[#34d399]" />
      <span className="hidden min-w-0 truncate text-[13px] font-medium lg:inline">{nombreCorto(visitaActiva)}</span>
      <span className="num text-[13px] text-white/80" aria-label="Tiempo de visita">
        {cronometro(ahora - inicio)}
      </span>
      <a href="#/cierre" className="press inline-flex min-h-9 items-center rounded-full bg-white px-3 text-[13px] font-semibold text-ink hover:bg-white/90">
        Cerrar visita
      </a>
    </div>
  )
}

export function Shell({ ruta, children }: { ruta: Ruta; children: ReactNode }) {
  const { apm } = useDemo()

  return (
    <div className="min-h-dvh">
      <a
        href="#contenido"
        className="sr-only z-[90] rounded-lg bg-ink px-4 py-3 text-white focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Saltar al contenido
      </a>

      {/* Riel lateral: tablet y desktop */}
      <nav
        aria-label="Principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col items-center border-r border-line bg-surface pt-[calc(16px+env(safe-area-inset-top))] pb-6 md:flex"
      >
        <a href="#/" aria-label="Presentador, inicio" className="press mb-6 rounded-xl p-1.5">
          <Logo />
        </a>
        <ul className="flex flex-col gap-1.5">
          {navegacion.map(({ href, etiqueta, Icono, activa }) => {
            const actual = activa(ruta)
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={actual ? 'page' : undefined}
                  className={`press flex w-[72px] flex-col items-center gap-1 rounded-xl py-2.5 text-[12px] font-medium ${
                    actual ? 'bg-ink text-white' : 'text-ink-3 hover:bg-sunken hover:text-ink'
                  }`}
                >
                  <Icono size={21} strokeWidth={actual ? 2.2 : 1.8} aria-hidden="true" />
                  {etiqueta}
                </a>
              </li>
            )
          })}
        </ul>
        <div className="mt-auto flex flex-col items-center gap-1 text-center">
          <span
            aria-hidden="true"
            className="flex size-10 items-center justify-center rounded-full bg-sunken text-[13px] font-semibold text-ink-2"
          >
            {apm.nombre
              .split(' ')
              .map((p) => p[0])
              .join('')}
          </span>
          <span className="sr-only">{apm.nombre}</span>
        </div>
      </nav>

      <div className="md:pl-[88px]">
        <div className="material sticky top-0 z-30 border-b border-line/70 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <a href="#/" className="press -ml-1.5 flex size-11 items-center justify-center rounded-xl md:hidden" aria-label="Presentador, inicio">
              <Logo />
            </a>
            <div className="hidden min-w-0 items-center gap-2 text-[13px] text-ink-3 md:flex">
              <Stethoscope size={16} aria-hidden="true" />
              <span className="truncate">
                {apm.laboratorio} · {apm.zona}
              </span>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              <VisitaEnCurso />
              <EstadoConexion />
            </div>
          </div>
        </div>

        <main id="contenido" tabIndex={-1} className="mx-auto max-w-[1440px] px-4 pb-[calc(104px+env(safe-area-inset-bottom))] outline-none sm:px-6 md:pb-12 lg:px-8">
          {children}
        </main>
      </div>

      {/* Barra inferior: celular */}
      <nav
        aria-label="Principal"
        className="material fixed inset-x-0 bottom-0 z-40 border-t border-line/70 pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="grid grid-cols-4">
          {navegacion.map(({ href, etiqueta, Icono, activa }) => {
            const actual = activa(ruta)
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={actual ? 'page' : undefined}
                  className={`press flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${actual ? 'text-ink' : 'text-ink-3'}`}
                >
                  <span className={`flex h-7 w-12 items-center justify-center rounded-full ${actual ? 'bg-ink text-white' : ''}`}>
                    <Icono size={19} strokeWidth={actual ? 2.2 : 1.8} aria-hidden="true" />
                  </span>
                  {etiqueta}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}
