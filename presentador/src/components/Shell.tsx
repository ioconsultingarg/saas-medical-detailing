import { useEffect, useState, type ReactNode } from 'react'
import { Boxes, CalendarRange, ChevronRight, CircleHelp, CloudOff, Ellipsis, FileCheck, GraduationCap, Library, Plug, RefreshCw, ShieldAlert, Sparkles, Stethoscope, UserCog, Users } from 'lucide-react'
import { cronometro } from '../lib/formato'
import type { Ruta } from '../lib/ruta'
import { useAhora } from '../lib/tiempo'
import { nombreCorto, useDemo } from '../state/demo'
import { useAcademia } from '../state/academia'
import { useSesion } from '../state/sesion'
import { Ayuda } from './Ayuda'
import { iniciales, MenuCuenta } from './MenuCuenta'
import { Sheet } from './Sheet'

interface ItemNav {
  href: string
  etiqueta: string
  detalle: string
  Icono: typeof CalendarRange
  activa: (r: Ruta) => boolean
}

const campo: ItemNav[] = [
  { href: '#/', etiqueta: 'Hoy', detalle: 'Agenda y ruta del día', Icono: CalendarRange, activa: (r) => r.nombre === 'hoy' },
  { href: '#/medicos', etiqueta: 'Médicos', detalle: 'Fichero y trazabilidad', Icono: Users, activa: (r) => r.nombre === 'medicos' || r.nombre === 'medico' },
  { href: '#/biblioteca', etiqueta: 'Biblioteca', detalle: 'Presentaciones', Icono: Library, activa: (r) => r.nombre === 'biblioteca' || r.nombre === 'constructor' },
  { href: '#/stock', etiqueta: 'Stock', detalle: 'Inventario y muestras', Icono: Boxes, activa: (r) => r.nombre === 'stock' },
  { href: '#/academia', etiqueta: 'Academia', detalle: 'Capacitación y certificaciones', Icono: GraduationCap, activa: (r) => r.nombre === 'academia' || r.nombre === 'curso' },
]

const gestion: ItemNav[] = [
  { href: '#/asistente', etiqueta: 'Asistente', detalle: 'Preguntale a los datos con IA', Icono: Sparkles, activa: (r) => r.nombre === 'asistente' },
  { href: '#/integraciones', etiqueta: 'API', detalle: 'SAP, Salesforce y webhooks', Icono: Plug, activa: (r) => r.nombre === 'integraciones' },
  { href: '#/actividad', etiqueta: 'Actividad', detalle: 'Sincronización sin conexión', Icono: RefreshCw, activa: (r) => r.nombre === 'actividad' },
]

/** Portal del laboratorio: mismo marco, otros destinos */
const portal: ItemNav[] = [
  { href: '#/lab', etiqueta: 'Material', detalle: 'Piezas, versiones y aprobaciones', Icono: FileCheck, activa: (r) => r.nombre === 'lab' },
  { href: '#/lab/catalogo', etiqueta: 'Catálogo', detalle: 'Productos, lotes y cupos de muestras', Icono: Boxes, activa: (r) => r.nombre === 'labCatalogo' },
  { href: '#/lab/equipo', etiqueta: 'Equipo', detalle: 'Visitadores, territorios y capacitación', Icono: UserCog, activa: (r) => r.nombre === 'labEquipo' },
  { href: '#/lab/farmacovigilancia', etiqueta: 'Seguridad', detalle: 'Bandeja de eventos adversos', Icono: ShieldAlert, activa: (r) => r.nombre === 'labFarmaco' },
]

const gestionLab: ItemNav[] = [
  { href: '#/asistente', etiqueta: 'Asistente', detalle: 'Preguntale a los datos con IA', Icono: Sparkles, activa: (r) => r.nombre === 'asistente' },
  { href: '#/integraciones', etiqueta: 'API', detalle: 'SAP, Salesforce y webhooks', Icono: Plug, activa: (r) => r.nombre === 'integraciones' },
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

function Insignia({ cantidad, className }: { cantidad: number; className: string }) {
  if (cantidad <= 0) return null
  return (
    <span aria-hidden="true" className={`num absolute min-w-4 rounded-full bg-warn px-1 text-[10px] leading-4 text-white ${className}`}>
      {cantidad}
    </span>
  )
}

export function Shell({ ruta, children }: { ruta: Ruta; children: ReactNode }) {
  const { apm } = useDemo()
  const { sesion } = useSesion()
  const { pendientes: cursosPendientes } = useAcademia()
  const [cuentaAbierta, setCuentaAbierta] = useState(false)
  const [masAbierto, setMasAbierto] = useState(false)
  const [ayudaAbierta, setAyudaAbierta] = useState(false)

  // la tecla ? abre la ayuda desde cualquier pantalla, salvo mientras se escribe
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const foco = document.activeElement
      const escribiendo = foco instanceof HTMLElement && (foco.tagName === 'INPUT' || foco.tagName === 'TEXTAREA' || foco.isContentEditable)
      if (e.key === '?' && !escribiendo) {
        e.preventDefault()
        setAyudaAbierta(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
  const nombre = sesion?.nombre ?? apm.nombre
  const esLab = sesion?.rol === 'lab'
  const principales = esLab ? portal : campo
  const secundarios = esLab ? gestionLab : gestion
  const barraInferior = principales.slice(0, 4)
  const enMas = esLab ? secundarios : [campo[4], ...gestion]
  const masActivo = enMas.some((i) => i.activa(ruta))
  const avisoCursos = cursosPendientes > 0 ? <span className="sr-only">, {cursosPendientes} cursos pendientes</span> : null

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
        className="fixed inset-y-0 left-0 z-40 hidden w-[88px] flex-col items-center border-r border-line bg-surface pt-[calc(14px+env(safe-area-inset-top))] pb-4 md:flex"
      >
        <a href="#/" aria-label="IO-Pharma, inicio" className="press mb-4 shrink-0 rounded-xl p-1.5">
          <Logo />
        </a>
        <div className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto">
          {[principales, secundarios].map((grupo, g) => (
            <ul key={g} className="flex flex-col gap-1" aria-label={g === 0 ? 'Trabajo de campo' : 'Gestión'}>
              {g === 1 && (
                <li aria-hidden="true" className="mx-auto my-2 flex w-[60px] flex-col items-center gap-1">
                  <span className="h-px w-full bg-line" />
                  <span className="font-mono text-[9px] tracking-[0.1em] text-ink-3 uppercase">{esLab ? 'Datos' : 'Gestión'}</span>
                </li>
              )}
              {grupo.map(({ href, etiqueta, Icono, activa }) => {
                const actual = activa(ruta)
                return (
                  <li key={href}>
                    <a
                      href={href}
                      aria-current={actual ? 'page' : undefined}
                      className={`press relative flex w-[72px] flex-col items-center gap-1 rounded-xl py-2 text-[12px] font-medium ${
                        actual ? 'bg-ink text-white' : 'text-ink-3 hover:bg-sunken hover:text-ink'
                      }`}
                    >
                      <Icono size={20} strokeWidth={actual ? 2.2 : 1.8} aria-hidden="true" />
                      {etiqueta === 'API' ? <span aria-label="Integraciones y API">API</span> : etiqueta}
                      {href === '#/academia' && (
                        <>
                          <Insignia cantidad={cursosPendientes} className="top-1 right-3" />
                          {avisoCursos}
                        </>
                      )}
                    </a>
                  </li>
                )
              })}
            </ul>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setCuentaAbierta(true)}
          aria-haspopup="dialog"
          aria-expanded={cuentaAbierta}
          aria-label={`Cuenta de ${nombre}`}
          className="press mt-3 flex w-[72px] shrink-0 cursor-pointer flex-col items-center gap-1 rounded-xl py-2 text-[12px] font-medium text-ink-3 hover:bg-sunken hover:text-ink"
        >
          <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-sunken text-[13px] font-semibold text-ink-2">
            {iniciales(nombre)}
          </span>
          Cuenta
        </button>
      </nav>

      <div className="md:pl-[88px]">
        <div className="material sticky top-0 z-30 border-b border-line/70 pt-[env(safe-area-inset-top)]">
          <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-3 px-4 sm:px-6 lg:px-8">
            <a href="#/" className="press -ml-1.5 flex size-11 items-center justify-center rounded-xl md:hidden" aria-label="IO-Pharma, inicio">
              <Logo />
            </a>
            <div className="hidden min-w-0 items-center gap-2 text-[13px] text-ink-3 md:flex">
              <Stethoscope size={16} aria-hidden="true" />
              <span className="truncate">
                {apm.laboratorio} · {esLab ? 'Portal del laboratorio' : apm.zona}
              </span>
            </div>
            <div className="ml-auto flex min-w-0 items-center gap-2">
              {!esLab && <VisitaEnCurso />}
              <EstadoConexion />
              <button
                type="button"
                onClick={() => setAyudaAbierta(true)}
                aria-haspopup="dialog"
                aria-expanded={ayudaAbierta}
                aria-label="Ayuda (tecla ?)"
                title="Ayuda · tecla ?"
                className="press flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 hover:bg-sunken hover:text-ink"
              >
                <CircleHelp size={20} aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setCuentaAbierta(true)}
                aria-haspopup="dialog"
                aria-expanded={cuentaAbierta}
                aria-label={`Cuenta de ${nombre}`}
                className="press flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full md:hidden"
              >
                <span aria-hidden="true" className="flex size-9 items-center justify-center rounded-full bg-ink text-[13px] font-semibold text-white">
                  {iniciales(nombre)}
                </span>
              </button>
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
        <ul className="grid grid-cols-5">
          {barraInferior.map(({ href, etiqueta, Icono, activa }) => {
            const actual = activa(ruta)
            return (
              <li key={href}>
                <a
                  href={href}
                  aria-current={actual ? 'page' : undefined}
                  className={`press flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium ${actual ? 'text-ink' : 'text-ink-3'}`}
                >
                  <span className={`relative flex h-7 w-12 items-center justify-center rounded-full ${actual ? 'bg-ink text-white' : ''}`}>
                    <Icono size={19} strokeWidth={actual ? 2.2 : 1.8} aria-hidden="true" />
                  </span>
                  {etiqueta}
                </a>
              </li>
            )
          })}
          <li>
            <button
              type="button"
              onClick={() => setMasAbierto(true)}
              aria-haspopup="dialog"
              aria-expanded={masAbierto}
              aria-current={masActivo ? 'page' : undefined}
              className={`press flex min-h-16 w-full cursor-pointer flex-col items-center justify-center gap-1 text-[11px] font-medium ${masActivo ? 'text-ink' : 'text-ink-3'}`}
            >
              <span className={`relative flex h-7 w-12 items-center justify-center rounded-full ${masActivo ? 'bg-ink text-white' : ''}`}>
                <Ellipsis size={19} strokeWidth={masActivo ? 2.2 : 1.8} aria-hidden="true" />
                <Insignia cantidad={cursosPendientes} className="-top-0.5 right-1" />
              </span>
              Más
              {avisoCursos}
            </button>
          </li>
        </ul>
      </nav>

      <Sheet abierto={masAbierto} onCerrar={() => setMasAbierto(false)} titulo="Más">
        <ul className="flex flex-col gap-2">
          {enMas.map(({ href, etiqueta, detalle, Icono, activa }) => (
            <li key={href}>
              <a
                href={href}
                onClick={() => setMasAbierto(false)}
                aria-current={activa(ruta) ? 'page' : undefined}
                className="press flex min-h-16 items-center gap-3 rounded-2xl border border-line px-4 py-3 hover:bg-sunken"
              >
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2">
                  <Icono size={19} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                    {etiqueta === 'API' ? 'Integraciones y API' : etiqueta}
                    {href === '#/academia' && cursosPendientes > 0 && (
                      <span className="num rounded-full bg-warn px-1.5 text-[11px] leading-5 text-white">{cursosPendientes}</span>
                    )}
                  </span>
                  <span className="block text-[13px] text-ink-3">{detalle}</span>
                </span>
                <ChevronRight size={18} aria-hidden="true" className="text-ink-3" />
              </a>
            </li>
          ))}
        </ul>
      </Sheet>

      <Ayuda abierto={ayudaAbierta} onCerrar={() => setAyudaAbierta(false)} ruta={ruta} />
      <MenuCuenta abierto={cuentaAbierta} onCerrar={() => setCuentaAbierta(false)} />
    </div>
  )
}
