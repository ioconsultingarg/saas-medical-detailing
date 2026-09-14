import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as EventoPuntero } from 'react'
import { ArrowRight, Boxes, ChevronLeft, ChevronRight, LayoutGrid, Maximize2, Minimize2, PenLine, RotateCw, X } from 'lucide-react'
import { BarraAnotacion, CapaAnotacion, coloresLapiz, type Trazo } from '../components/Anotacion'
import { Sheet } from '../components/Sheet'
import { StockPanel } from '../components/StockPanel'
import { ChipProducto, MonogramaProducto } from '../components/ui'
import { diapositivaPorId, presentacionesOficiales, productosDe } from '../data/presentaciones'
import { productos } from '../data/productos'
import { recursos } from '../data/recursos'
import { ir } from '../lib/ruta'
import { etiquetaRecurso, RecursoContenido } from '../recursos/RecursoContenido'
import { componentesDiapositiva } from '../slides'
import { DiapositivaCtx, Lienzo } from '../slides/SlideKit'
import { useDemo } from '../state/demo'

type Panel = 'indice' | 'stock' | null

export function Presentar({ presentacionId }: { presentacionId: string }) {
  const { estado, visitaActiva, despachar, avisar } = useDemo()
  const presentacion = useMemo(
    () => [...estado.personales, ...presentacionesOficiales].find((p) => p.id === presentacionId) ?? null,
    [estado.personales, presentacionId],
  )
  const ids = useMemo(() => (presentacion?.diapositivas ?? []).filter((id) => componentesDiapositiva[id]), [presentacion])

  const [indice, setIndice] = useState(0)
  const [direccion, setDireccion] = useState<1 | -1>(1)
  const [recursoId, setRecursoId] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [anotando, setAnotando] = useState(false)
  const [colorLapiz, setColorLapiz] = useState(coloresLapiz[0].valor)
  const [trazos, setTrazos] = useState<Record<string, Trazo[]>>({})
  const [limpio, setLimpio] = useState(false)
  const gesto = useRef<{ x: number; y: number; t: number } | null>(null)

  const actualId = ids[indice]
  const vistos = useMemo(() => new Set(estado.hotspotsVistos), [estado.hotspotsVistos])

  const irA = useCallback(
    (destino: number) => {
      if (destino < 0 || destino >= ids.length || destino === indice) return
      setDireccion(destino > indice ? 1 : -1)
      setIndice(destino)
    },
    [ids.length, indice],
  )

  // Telemetría: tiempo en cada pantalla, asociado a la visita en curso
  useEffect(() => {
    if (!actualId) return
    const inicio = Date.now()
    return () => despachar({ tipo: 'tiempo', diapositivaId: actualId, ms: Date.now() - inicio })
  }, [actualId, despachar])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (recursoId || panel) return
      if ((e.target as HTMLElement)?.closest('input, textarea, select')) return
      if (e.key === 'ArrowRight' || e.key === 'PageDown') irA(indice + 1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') irA(indice - 1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [indice, irA, recursoId, panel])

  const abrir = useCallback(
    (id: string) => {
      setRecursoId(id)
      despachar({ tipo: 'hotspot', recursoId: id })
    },
    [despachar],
  )

  if (!presentacion || ids.length === 0) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="text-[24px] font-semibold text-ink">No encontramos esa presentación</h1>
        <p className="max-w-[40ch] text-ink-3">Puede haberse borrado desde otro dispositivo. Elegí otra desde la biblioteca.</p>
        <a href="#/biblioteca" className="btn-primary">
          Ir a la biblioteca
        </a>
      </div>
    )
  }

  const Componente = componentesDiapositiva[actualId]
  const productoActual = productos[diapositivaPorId[actualId].productoId]
  const recurso = recursoId ? recursos[recursoId] : null
  const trazosActuales = trazos[actualId] ?? []
  const productosPresentacion = productosDe(presentacion)
  const unidadesCarrito = estado.carrito.reduce((a, c) => a + c.cantidad, 0)

  function salir() {
    if (window.history.length > 1) window.history.back()
    else ir('/biblioteca')
  }

  function finalizar() {
    if (visitaActiva) ir('/cierre')
    else {
      avisar('Presentación terminada · sin visita en curso para registrar', 'info')
      ir('/biblioteca')
    }
  }

  function inicioGesto(e: EventoPuntero<HTMLDivElement>) {
    if (anotando || (e.target as HTMLElement).closest('button, a, input')) return
    gesto.current = { x: e.clientX, y: e.clientY, t: performance.now() }
  }

  function finGesto(e: EventoPuntero<HTMLDivElement>) {
    const g = gesto.current
    gesto.current = null
    if (!g) return
    const dx = e.clientX - g.x
    const dy = e.clientY - g.y
    const velocidad = Math.abs(dx) / Math.max(1, performance.now() - g.t)
    // un deslizamiento corto pero rápido también cuenta (emil-design-eng: momentum)
    if (Math.abs(dx) > Math.abs(dy) && (Math.abs(dx) > 70 || (Math.abs(dx) > 24 && velocidad > 0.45))) {
      irA(indice + (dx < 0 ? 1 : -1))
    }
  }

  const altoCromo = limpio ? '48px' : '176px'

  return (
    <div className="fixed inset-0 flex flex-col bg-stage text-white">
      {/* Barra superior */}
      <header
        className={`relative z-30 flex shrink-0 items-center gap-2 px-3 pt-[env(safe-area-inset-top)] transition-[opacity,transform] duration-200 sm:px-5 ${
          limpio ? 'pointer-events-none -translate-y-2 opacity-0' : ''
        }`}
      >
        <div className="flex h-16 w-full items-center gap-2">
          <button type="button" onClick={salir} className="press flex min-h-11 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-[14px] font-medium text-white/85 hover:bg-white/10">
            <X size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Salir</span>
          </button>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 px-2">
            <MonogramaProducto id={productoActual.id} size={18} />
            <h1 className="min-w-0 truncate text-[14px] font-semibold text-white sm:text-[15px]">{presentacion.titulo}</h1>
            <span className="num shrink-0 text-[13px] text-white/55">
              {indice + 1}/{ids.length}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setAnotando((v) => !v)}
              aria-pressed={anotando}
              className={`press flex size-11 cursor-pointer items-center justify-center rounded-xl ${anotando ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/10'}`}
              aria-label="Anotar sobre la pantalla"
            >
              <PenLine size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setPanel('indice')} className="press flex size-11 cursor-pointer items-center justify-center rounded-xl text-white/85 hover:bg-white/10" aria-label="Ver todas las pantallas">
              <LayoutGrid size={19} aria-hidden="true" />
            </button>
            <button type="button" onClick={() => setPanel('stock')} className="press relative flex size-11 cursor-pointer items-center justify-center rounded-xl text-white/85 hover:bg-white/10" aria-label={`Stock y muestras${unidadesCarrito ? `, ${unidadesCarrito} en el carrito` : ''}`}>
              <Boxes size={19} aria-hidden="true" />
              {unidadesCarrito > 0 && <span className="num absolute top-1.5 right-1.5 min-w-4 rounded-full bg-[#34d399] px-1 text-[10px] leading-4 text-ink">{unidadesCarrito}</span>}
            </button>
            <button type="button" onClick={() => setLimpio(true)} className="press hidden size-11 cursor-pointer items-center justify-center rounded-xl text-white/85 hover:bg-white/10 sm:flex" aria-label="Pantalla limpia">
              <Maximize2 size={18} aria-hidden="true" />
            </button>
            <button type="button" onClick={finalizar} className="btn ml-1 bg-white px-3 text-[14px] text-ink hover:bg-white/90 sm:px-4">
              <span className="hidden sm:inline">{visitaActiva ? 'Finalizar' : 'Terminar'}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {/* Escenario */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16" onPointerDown={inicioGesto} onPointerUp={finGesto}>
        <div className="relative w-full" style={{ maxWidth: `calc((100dvh - ${altoCromo} - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 1.6)` }}>
          <div
            key={actualId}
            className="overflow-hidden rounded-[12px] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] sm:rounded-[18px]"
            style={{ animation: `${direccion > 0 ? 'pantalla-desde-derecha' : 'pantalla-desde-izquierda'} 260ms var(--ease-fluid) both` }}
          >
            <Lienzo>
              <DiapositivaCtx.Provider value={{ interactivo: !anotando, vistos, abrir }}>
                <Componente />
              </DiapositivaCtx.Provider>
              <CapaAnotacion
                activo={anotando}
                color={colorLapiz}
                trazos={trazosActuales}
                onTrazo={(t) => setTrazos((prev) => ({ ...prev, [actualId]: [...(prev[actualId] ?? []), t] }))}
              />
            </Lienzo>
          </div>

          {anotando && (
            <div className="absolute -top-2 left-1/2 z-30 -translate-x-1/2 -translate-y-full sm:top-3 sm:translate-y-0">
              <BarraAnotacion
                color={colorLapiz}
                onColor={setColorLapiz}
                hayTrazos={trazosActuales.length > 0}
                onDeshacer={() => setTrazos((prev) => ({ ...prev, [actualId]: (prev[actualId] ?? []).slice(0, -1) }))}
                onBorrar={() => setTrazos((prev) => ({ ...prev, [actualId]: [] }))}
                onCerrar={() => setAnotando(false)}
              />
            </div>
          )}
        </div>

        <button type="button" onClick={() => irA(indice - 1)} disabled={indice === 0} className="press absolute left-2 hidden size-12 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-25 sm:flex" aria-label="Pantalla anterior">
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => irA(indice + 1)} disabled={indice === ids.length - 1} className="press absolute right-2 hidden size-12 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-25 sm:flex" aria-label="Pantalla siguiente">
          <ChevronRight size={26} aria-hidden="true" />
        </button>

        {limpio && (
          <button type="button" onClick={() => setLimpio(false)} className="press material-oscuro absolute top-[calc(8px+env(safe-area-inset-top))] right-3 flex size-11 cursor-pointer items-center justify-center rounded-full text-white/80" aria-label="Mostrar controles">
            <Minimize2 size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="flex items-center justify-center gap-2 px-4 pt-3 text-center text-[12px] text-white/50 landscape:hidden sm:hidden">
        <RotateCw size={14} aria-hidden="true" />
        Girá el teléfono para ver la pieza más grande
      </p>

      {/* Dock de navegación no lineal */}
      <nav
        aria-label="Pantallas de la presentación"
        className={`relative z-30 shrink-0 px-3 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] transition-[opacity,transform] duration-200 sm:px-5 ${
          limpio ? 'pointer-events-none translate-y-2 opacity-0' : ''
        }`}
      >
        <ol className="mx-auto flex max-w-[1100px] gap-1.5 overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
          {ids.map((id, i) => {
            const d = diapositivaPorId[id]
            const p = productos[d.productoId]
            const actual = i === indice
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  onClick={() => irA(i)}
                  aria-current={actual ? 'step' : undefined}
                  className={`press flex min-h-12 cursor-pointer items-center gap-2 rounded-xl px-3 text-left text-[13px] font-medium ${actual ? 'bg-white text-ink' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
                >
                  <span className="num flex size-6 items-center justify-center rounded-md text-[11px]" style={{ background: actual ? p.color : 'rgb(255 255 255 / 0.1)', color: '#fff' }}>
                    {i + 1}
                  </span>
                  <span className="whitespace-nowrap">{d.titulo}</span>
                </button>
              </li>
            )
          })}
        </ol>
      </nav>

      <Sheet
        abierto={Boolean(recurso)}
        onCerrar={() => setRecursoId(null)}
        titulo={recurso?.titulo ?? ''}
        scrimSuave
        ancho="480px"
        subtitulo={
          recurso && (
            <span className="flex flex-wrap items-center gap-2">
              <span className="eyebrow">{etiquetaRecurso(recurso)}</span>
              <ChipProducto id={recurso.productoId} />
            </span>
          )
        }
      >
        {recurso && <RecursoContenido recurso={recurso} />}
      </Sheet>

      <Sheet abierto={panel === 'indice'} onCerrar={() => setPanel(null)} titulo="Saltar a una pantalla" ancho="520px" scrimSuave>
        <ul className="grid grid-cols-2 gap-3">
          {ids.map((id, i) => {
            const Mini = componentesDiapositiva[id]
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => {
                    irA(i)
                    setPanel(null)
                  }}
                  aria-current={i === indice ? 'step' : undefined}
                  className={`press group block w-full cursor-pointer overflow-hidden rounded-xl border-2 text-left ${i === indice ? 'border-ink' : 'border-transparent hover:border-line-2'}`}
                >
                  <div inert className="pointer-events-none">
                    <Lienzo>
                      <Mini />
                    </Lienzo>
                  </div>
                  <span className="flex items-center gap-2 bg-sunken px-3 py-2 text-[13px] font-medium text-ink">
                    <span className="num text-ink-3">{i + 1}</span>
                    <span className="truncate">{diapositivaPorId[id].titulo}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </Sheet>

      <Sheet
        abierto={panel === 'stock'}
        onCerrar={() => setPanel(null)}
        titulo="Stock y muestras"
        subtitulo={<span className="eyebrow">{visitaActiva ? `Para ${visitaActiva.medico.nombre}` : 'Sin visita en curso'}</span>}
        ancho="520px"
      >
        <StockPanel productosEnFoco={productosPresentacion} />
      </Sheet>
    </div>
  )
}
