import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  Boxes, Building2, CalendarRange, CircleHelp, CornerDownLeft, FileCheck, Gavel, GraduationCap,
  Layers, Library, type LucideIcon, Plug, RefreshCw, Rocket, Search, ShieldAlert, Sparkles,
  Stethoscope, Target, UserCog, Users,
} from 'lucide-react'
import { cuentas } from '../data/cuentas'
import { medicos } from '../data/crm'
import { licitaciones } from '../data/licitaciones'
import { presentacionesOficiales } from '../data/presentaciones'
import { buscar, useCursorFila, type Buscable } from '../lib/buscador'
import { RESORTE_PANEL } from '../lib/resortes'
import { ir } from '../lib/ruta'
import { useSesion } from '../state/sesion'

/*
 * Paleta de comandos (⌘K / Ctrl+K).
 *
 * Una sola entrada a todo: los 36 médicos del fichero, las presentaciones, las
 * cuentas, las licitaciones y cada pantalla del rol. En una tablet se abre con la
 * lupa de la barra; con teclado, sin levantar las manos.
 *
 * Adaptado de la Command Palette de beUI (MIT, Saurabh). Ver CREDITS.md.
 */

interface Comando extends Buscable {
  detalle?: string
  Icono: LucideIcon
  hacer: () => void
}

const PANTALLAS_APM: [string, string, LucideIcon, string][] = [
  ['/', 'Hoy', CalendarRange, 'agenda ruta del dia visitas'],
  ['/medicos', 'Médicos', Users, 'fichero cartera'],
  ['/biblioteca', 'Biblioteca', Library, 'presentaciones material'],
  ['/stock', 'Material', Boxes, 'muestras disponibilidad lotes'],
  ['/academia', 'Academia', GraduationCap, 'capacitacion cursos certificados'],
  ['/asistente', 'Asistente', Sparkles, 'preguntar datos ia'],
  ['/integraciones', 'Integraciones y API', Plug, 'sap salesforce webhooks'],
  ['/actividad', 'Actividad', RefreshCw, 'sincronizacion sin conexion pendientes'],
]

const PANTALLAS_LAB: [string, string, LucideIcon, string][] = [
  ['/lab', 'Material y aprobaciones', FileCheck, 'piezas versiones revision publicar'],
  ['/lab/catalogo', 'Catálogo y muestras', Boxes, 'productos lotes cupos'],
  ['/lab/cuentas', 'Cuentas institucionales', Building2, 'droguerias cadenas financiadores'],
  ['/lab/licitaciones', 'Licitaciones', Gavel, 'procesos pliegos organismos'],
  ['/lab/lanzamientos', 'Lanzamientos', Rocket, 'adopcion cronograma objetivo'],
  ['/lab/segmentacion', 'Segmentos y potencial', Target, 'rfm recategorizacion cartera'],
  ['/lab/equipo', 'Equipo y territorios', UserCog, 'visitadores zonas'],
  ['/lab/farmacovigilancia', 'Seguridad', ShieldAlert, 'eventos adversos farmacovigilancia'],
  ['/asistente', 'Asistente', Sparkles, 'preguntar datos ia'],
  ['/integraciones', 'Integraciones y API', Plug, 'sap salesforce webhooks'],
]

function comandos(esLab: boolean, abrirAyuda: () => void): Comando[] {
  const pantallas = (esLab ? PANTALLAS_LAB : PANTALLAS_APM).map(([ruta, etiqueta, Icono, claves]) => ({
    id: `pantalla:${ruta}`,
    etiqueta,
    grupo: 'Ir a',
    claves: claves.split(' '),
    Icono,
    hacer: () => ir(ruta),
  }))

  const ayuda: Comando = {
    id: 'accion:ayuda',
    etiqueta: 'Abrir la ayuda',
    grupo: 'Acciones',
    claves: ['manual', 'soporte', 'como se usa'],
    Icono: CircleHelp,
    hacer: abrirAyuda,
  }

  if (esLab) {
    return [
      ...pantallas,
      ...cuentas.map((c) => ({
        id: `cuenta:${c.id}`,
        etiqueta: c.nombre,
        grupo: 'Cuentas',
        detalle: `${c.localidad} · ${c.kam}`,
        claves: [c.tipo, c.localidad, c.zona, c.kam],
        Icono: Building2,
        hacer: () => ir(`/lab/cuentas/${c.id}`),
      })),
      ...licitaciones.map((l) => ({
        id: `licitacion:${l.id}`,
        etiqueta: l.organismo,
        grupo: 'Licitaciones',
        detalle: l.expediente,
        claves: [l.estadoInicial, l.expediente, l.objeto],
        Icono: Gavel,
        hacer: () => ir('/lab/licitaciones'),
      })),
      ayuda,
    ]
  }

  return [
    ...pantallas,
    ...medicos.map((m) => ({
      id: `medico:${m.id}`,
      etiqueta: m.nombre,
      grupo: 'Médicos',
      detalle: `${m.especialidad} · ${m.barrio}`,
      claves: [m.especialidad, m.institucion, m.barrio, m.zona, m.matricula, `categoria ${m.categoria}`],
      Icono: Stethoscope,
      hacer: () => ir(`/medicos/${m.id}`),
    })),
    ...presentacionesOficiales.map((p) => ({
      id: `presentacion:${p.id}`,
      etiqueta: p.titulo,
      grupo: 'Presentaciones',
      detalle: p.descripcion,
      claves: ['presentar', 'biblioteca'],
      Icono: Layers,
      hacer: () => ir(`/presentar/${p.id}`),
    })),
    ayuda,
  ]
}

export function Paleta({ abierta, onCerrar, onAyuda }: { abierta: boolean; onCerrar: () => void; onAyuda: () => void }) {
  const { sesion } = useSesion()
  const [texto, setTexto] = useState('')
  const entrada = useRef<HTMLInputElement>(null)
  const lista = useRef<HTMLDivElement>(null)
  const sinMovimiento = useReducedMotion()

  const todos = useMemo(() => comandos(sesion?.rol === 'lab', onAyuda), [sesion?.rol, onAyuda])
  // más de ocho resultados en una lista sin scroll visible cansa: se corta y se avisa
  const encontrados = useMemo(() => buscar(todos, texto), [todos, texto])
  const filas = encontrados.slice(0, 8)
  const { activa, mover, moverActiva } = useCursorFila(filas, texto)

  useEffect(() => {
    if (!abierta) return
    setTexto('')
    mover(null)
    const t = window.setTimeout(() => entrada.current?.focus(), 40)
    return () => window.clearTimeout(t)
  }, [abierta, mover])

  // Escape cierra aunque el foco se haya ido del campo (por ejemplo tras usar el mouse)
  useEffect(() => {
    if (!abierta) return
    function alEscape(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onCerrar() }
    }
    window.addEventListener('keydown', alEscape)
    return () => window.removeEventListener('keydown', alEscape)
  }, [abierta, onCerrar])

  // la fila resaltada siempre a la vista, incluso llegando con el teclado
  useEffect(() => {
    lista.current?.querySelector('[data-activa="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [activa, texto])

  function alTeclear(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); moverActiva(1) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); moverActiva(-1) }
    else if (e.key === 'Enter') {
      e.preventDefault()
      const elegida = filas[activa]
      if (elegida) { onCerrar(); elegida.hacer() }
    } else if (e.key === 'Escape') { e.preventDefault(); onCerrar() }
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {abierta && (
        <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-black/55 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onCerrar}
            aria-hidden="true"
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Buscar en IO-Pharma"
            className="material relative w-full max-w-[560px] overflow-hidden rounded-2xl border border-line shadow-(--shadow-sheet)"
            initial={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={sinMovimiento ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.98 }}
            transition={sinMovimiento ? { duration: 0.12 } : RESORTE_PANEL}
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search size={18} aria-hidden="true" className="shrink-0 text-ink-3" />
              <input
                ref={entrada}
                type="text"
                role="combobox"
                aria-expanded="true"
                aria-controls="paleta-lista"
                aria-activedescendant={filas[activa] ? `paleta-${filas[activa].id}` : undefined}
                autoComplete="off"
                spellCheck={false}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                onKeyDown={alTeclear}
                placeholder="Buscar un médico, una pantalla, una acción…"
                className="min-h-14 flex-1 bg-transparent text-[16px] text-ink outline-none placeholder:text-ink-3"
              />
              <kbd className="num hidden shrink-0 rounded-md border border-line bg-sunken px-1.5 py-0.5 text-[11px] text-ink-3 sm:block">
                esc
              </kbd>
            </div>

            <div ref={lista} id="paleta-lista" role="listbox" aria-label="Resultados" className="max-h-[52vh] overflow-y-auto p-2">
              {filas.length === 0 ? (
                <p className="px-3 py-8 text-center text-[14px] text-ink-3">
                  Nada coincide con “{texto}”.
                </p>
              ) : (
                filas.map((c, i) => {
                  const esActiva = i === activa
                  const nuevoGrupo = i === 0 || filas[i - 1].grupo !== c.grupo
                  return (
                    <div key={c.id}>
                      {nuevoGrupo && <div className="eyebrow px-3 pt-3 pb-1.5">{c.grupo}</div>}
                      <button
                        type="button"
                        id={`paleta-${c.id}`}
                        role="option"
                        aria-selected={esActiva}
                        data-activa={esActiva}
                        onMouseMove={() => !esActiva && mover(c.id)}
                        onClick={() => { onCerrar(); c.hacer() }}
                        className="relative flex min-h-12 w-full cursor-pointer items-center gap-3 rounded-xl px-3 text-left"
                      >
                        {esActiva && (
                          <motion.span
                            layoutId="paleta-activa"
                            className="absolute inset-0 rounded-xl bg-sunken"
                            transition={sinMovimiento ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 38, mass: 0.5 }}
                            aria-hidden="true"
                          />
                        )}
                        <c.Icono size={17} aria-hidden="true" className={`relative shrink-0 ${esActiva ? 'text-accent' : 'text-ink-3'}`} />
                        <span className="relative min-w-0 flex-1">
                          <span className="block truncate text-[15px] font-medium text-ink">{c.etiqueta}</span>
                          {c.detalle && <span className="block truncate text-[13px] text-ink-3">{c.detalle}</span>}
                        </span>
                        {esActiva && <CornerDownLeft size={15} aria-hidden="true" className="relative shrink-0 text-ink-3" />}
                      </button>
                    </div>
                  )
                })
              )}
              {encontrados.length > filas.length && (
                <p className="px-3 pt-2 pb-1 text-[12px] text-ink-3">
                  y <span className="num">{encontrados.length - filas.length}</span> resultados más: seguí escribiendo para acotar.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

/** Atajo global: ⌘K en Mac, Ctrl+K en el resto. Se ignora mientras se escribe en otro campo. */
export function useAtajoPaleta(abrir: () => void) {
  useEffect(() => {
    function alTeclear(e: KeyboardEvent) {
      if (e.key.toLowerCase() !== 'k' || !(e.metaKey || e.ctrlKey)) return
      e.preventDefault()
      abrir()
    }
    window.addEventListener('keydown', alTeclear)
    return () => window.removeEventListener('keydown', alTeclear)
  }, [abrir])
}
