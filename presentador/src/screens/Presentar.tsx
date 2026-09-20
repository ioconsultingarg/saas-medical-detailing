import { memo, useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as EventoPuntero, type ReactNode } from 'react'
import { ArrowRight, Boxes, ChevronLeft, ChevronRight, LayoutGrid, Maximize2, Minimize2, PenLine, RotateCw, X } from 'lucide-react'
import { BarraAnotacion, CapaAnotacion, coloresLapiz, type Trazo } from '../components/Anotacion'
import { Sheet } from '../components/Sheet'
import { StockPanel } from '../components/StockPanel'
import { ChipProducto, MonogramaProducto } from '../components/ui'
import { diapositivaPorId, presentacionesOficiales, presentacionPublicable, productosDe } from '../data/presentaciones'
import { productos } from '../data/productos'
import { recursos } from '../data/recursos'
import { ir } from '../lib/ruta'
import { prefiereMenosMovimiento } from '../lib/tiempo'
import { etiquetaRecurso, RecursoContenido } from '../recursos/RecursoContenido'
import { componentesDiapositiva } from '../slides'
import { DiapositivaCtx, Lienzo } from '../slides/SlideKit'
import { useDemo } from '../state/demo'

type Panel = 'indice' | 'stock' | null

/** Estado del pase de página: `p` va de 0 a 1; `objetivo` null mientras el dedo arrastra */
interface Giro {
  desde: number
  hasta: number
  p: number
  objetivo: 0 | 1 | null
}

interface Arrastre {
  x0: number
  y0: number
  ancho: number
  dir: 0 | 1 | -1
  sinDestino: boolean
  muestras: { x: number; t: number }[]
}

/** La diapositiva no se vuelve a renderizar en cada cuadro del giro */
const Pagina = memo(function Pagina({ id, interactivo, vistos, abrir }: { id: string; interactivo: boolean; vistos: ReadonlySet<string>; abrir: (id: string) => void }) {
  const Componente = componentesDiapositiva[id]
  const valor = useMemo(() => ({ interactivo, vistos, abrir, activa: true }), [interactivo, vistos, abrir])
  return (
    <Lienzo>
      <DiapositivaCtx.Provider value={valor}>
        <Componente />
      </DiapositivaCtx.Provider>
    </Lienzo>
  )
})

/** Hoja con frente y dorso que gira sobre su borde izquierdo, como la página de un libro */
function CapaPagina({ angulo, z, sombra, children }: { angulo: number; z: number; sombra: number; children: ReactNode }) {
  const t = Math.min(1, Math.abs(angulo) / 180)
  const girando = angulo !== 0
  const luz = Math.min(1, t * 2)
  // la opacidad va en cada cara: aplicada a la hoja 3D rompería preserve-3d
  const desvanecer = t > 0.9 ? Math.max(0, (1 - t) / 0.1) : 1
  const cara = { backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' } as const

  return (
    <div
      className="absolute inset-0"
      style={{
        zIndex: z,
        transformStyle: 'preserve-3d',
        transformOrigin: 'left center',
        transform: girando ? `rotateY(${angulo}deg)` : undefined,
        pointerEvents: girando ? 'none' : undefined,
      }}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded-[12px] sm:rounded-[18px]"
        style={{ ...cara, opacity: desvanecer, boxShadow: girando ? `0 ${24 * luz}px ${60 * luz}px -12px rgb(0 0 0 / ${0.5 * luz})` : undefined }}
      >
        {children}
        {girando && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: `linear-gradient(to left, rgb(0 0 0 / ${0.3 * luz}), rgb(0 0 0 / ${0.06 * luz}) 55%, rgb(255 255 255 / ${0.1 * luz}))` }}
          />
        )}
        {sombra > 0 && (
          <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: `linear-gradient(to right, rgb(0 0 0 / ${0.32 * sombra}), transparent 55%)` }} />
        )}
      </div>
      {girando && (
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-[12px] sm:rounded-[18px]"
          style={{ ...cara, opacity: desvanecer, transform: 'rotateY(180deg)', background: 'linear-gradient(to right, #d3d9e1, #eef1f5 35%, #f8f9fb 70%, #dde2e8)' }}
        />
      )}
    </div>
  )
}

export function Presentar({ presentacionId }: { presentacionId: string }) {
  const { estado, visitaActiva, despachar, avisar } = useDemo()
  const presentacion = useMemo(
    () => [...estado.personales, presentacionPublicable, ...presentacionesOficiales].find((p) => p.id === presentacionId) ?? null,
    [estado.personales, presentacionId],
  )
  const ids = useMemo(() => (presentacion?.diapositivas ?? []).filter((id) => componentesDiapositiva[id]), [presentacion])

  const [indice, setIndice] = useState(0)
  const [giro, setGiro] = useState<Giro | null>(null)
  const [recursoId, setRecursoId] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [anotando, setAnotando] = useState(false)
  const [colorLapiz, setColorLapiz] = useState(coloresLapiz[0].valor)
  const [trazos, setTrazos] = useState<Record<string, Trazo[]>>({})
  const [limpio, setLimpio] = useState(false)
  const giroRef = useRef<Giro | null>(null)
  const indiceRef = useRef(0)
  const arrastre = useRef<Arrastre | null>(null)
  const raf = useRef(0)
  const hojaRef = useRef<HTMLDivElement>(null)
  const reducido = useMemo(() => prefiereMenosMovimiento(), [])

  const actualId = ids[indice]
  const vistos = useMemo(() => new Set(estado.hotspotsVistos), [estado.hotspotsVistos])

  useEffect(() => {
    indiceRef.current = indice
  }, [indice])

  useEffect(() => () => cancelAnimationFrame(raf.current), [])

  const fijarGiro = useCallback((g: Giro | null) => {
    giroRef.current = g
    setGiro(g)
  }, [])

  /** Resorte críticamente amortiguado hacia el objetivo: arranca rápido y se asienta sin rebote */
  const animar = useCallback(() => {
    cancelAnimationFrame(raf.current)
    let ultimo = performance.now()
    const paso = (ahora: number) => {
      const g = giroRef.current
      if (!g || g.objetivo === null) return
      const dt = Math.min(0.05, (ahora - ultimo) / 1000)
      ultimo = ahora
      const p = g.p + (g.objetivo - g.p) * (1 - Math.exp(-dt * 10))
      if (Math.abs(g.objetivo - p) < 0.004) {
        if (g.objetivo === 1) {
          indiceRef.current = g.hasta
          setIndice(g.hasta)
        }
        fijarGiro(null)
        return
      }
      fijarGiro({ ...g, p })
      raf.current = requestAnimationFrame(paso)
    }
    raf.current = requestAnimationFrame(paso)
  }, [fijarGiro])

  /** Termina en el acto un giro en curso: la navegación nunca espera a que termine una animación */
  const cerrarGiro = useCallback(() => {
    const g = giroRef.current
    if (!g) return indiceRef.current
    cancelAnimationFrame(raf.current)
    const final = g.objetivo === 1 || (g.objetivo === null && g.p > 0.5) ? g.hasta : g.desde
    indiceRef.current = final
    setIndice(final)
    fijarGiro(null)
    return final
  }, [fijarGiro])

  const pasar = useCallback(
    (destino: number) => {
      const base = cerrarGiro()
      if (destino < 0 || destino >= ids.length || destino === base) return
      if (reducido) {
        indiceRef.current = destino
        setIndice(destino)
        return
      }
      fijarGiro({ desde: base, hasta: destino, p: 0, objetivo: 1 })
      animar()
    },
    [animar, cerrarGiro, fijarGiro, ids.length, reducido],
  )

  const mover = useCallback((delta: number) => pasar(cerrarGiro() + delta), [cerrarGiro, pasar])

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
      if (e.key === 'ArrowRight' || e.key === 'PageDown') mover(1)
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') mover(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mover, recursoId, panel])

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

  // ---- Arrastre: la hoja sigue al dedo y, al soltar, la velocidad decide si pasa o vuelve ----

  function alPresionar(e: EventoPuntero<HTMLDivElement>) {
    if (anotando || (e.pointerType === 'mouse' && e.button !== 0)) return
    if ((e.target as HTMLElement).closest('button, a, input, [data-no-arrastre]')) return
    const hoja = hojaRef.current
    if (!hoja) return
    cerrarGiro()
    arrastre.current = {
      x0: e.clientX,
      y0: e.clientY,
      ancho: hoja.getBoundingClientRect().width,
      dir: 0,
      sinDestino: false,
      muestras: [{ x: e.clientX, t: e.timeStamp }],
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  function alMover(e: EventoPuntero<HTMLDivElement>) {
    const a = arrastre.current
    if (!a) return
    const dx = e.clientX - a.x0
    const dy = e.clientY - a.y0
    a.muestras.push({ x: e.clientX, t: e.timeStamp })
    if (a.muestras.length > 6) a.muestras.shift()

    if (a.dir === 0) {
      // umbral de 10 px antes de decidir la dirección, para no confundir un toque con un arrastre
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      if (Math.abs(dy) > Math.abs(dx)) {
        arrastre.current = null
        return
      }
      a.dir = dx < 0 ? 1 : -1
      const hasta = indiceRef.current + a.dir
      a.sinDestino = hasta < 0 || hasta >= ids.length
      if (!a.sinDestino && !reducido) fijarGiro({ desde: indiceRef.current, hasta, p: 0, objetivo: null })
    }

    const g = giroRef.current
    if (a.sinDestino || reducido || !g) return
    fijarGiro({ ...g, p: Math.min(1, Math.max(0, -dx * a.dir) / (a.ancho * 0.85)) })
  }

  function alSoltar(e: EventoPuntero<HTMLDivElement>, cancelado = false) {
    const a = arrastre.current
    arrastre.current = null
    if (!a || a.dir === 0 || a.sinDestino) return
    const primera = a.muestras[0]
    const ultima = a.muestras[a.muestras.length - 1]
    const velocidad = (ultima.x - primera.x) / Math.max(1, ultima.t - primera.t)
    const aFavor = -velocidad * a.dir
    const avance = Math.max(0, -(e.clientX - a.x0) * a.dir) / (a.ancho * 0.85)
    // un gesto corto pero rápido también pasa la página; un retroceso al soltar la devuelve
    const confirmar = !cancelado && aFavor > -0.2 && (avance > 0.4 || aFavor > 0.45)

    if (reducido) {
      if (confirmar) pasar(indiceRef.current + a.dir)
      return
    }
    const g = giroRef.current
    if (!g) return
    fijarGiro({ ...g, objetivo: confirmar ? 1 : 0 })
    animar()
  }

  const altoCromo = limpio ? '48px' : '176px'
  const capas = giro ? [giro.desde, giro.hasta].sort((a, b) => a - b) : [indice]
  const adelante = giro ? giro.hasta > giro.desde : true
  const hojaQueGira = giro ? (adelante ? giro.desde : giro.hasta) : -1

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
      <div
        className="relative flex min-h-0 flex-1 touch-pan-y items-center justify-center px-3 select-none sm:px-16"
        onPointerDown={alPresionar}
        onPointerMove={alMover}
        onPointerUp={(e) => alSoltar(e)}
        onPointerCancel={(e) => alSoltar(e, true)}
      >
        <div className="relative w-full" style={{ maxWidth: `calc((100dvh - ${altoCromo} - env(safe-area-inset-top) - env(safe-area-inset-bottom)) * 1.6)`, perspective: '2600px' }}>
          <div ref={hojaRef} className="relative w-full rounded-[12px] shadow-[0_30px_80px_-20px_rgb(0_0_0/0.7)] sm:rounded-[18px]" style={{ aspectRatio: '16 / 10', transformStyle: 'preserve-3d' }}>
            {capas.map((i) => {
              const id = ids[i]
              const gira = i === hojaQueGira
              const angulo = gira && giro ? (adelante ? -giro.p * 180 : -(1 - giro.p) * 180) : 0
              const enReposo = !giro && i === indice
              return (
                <CapaPagina key={id} angulo={angulo} z={gira ? 2 : 1} sombra={giro && !gira ? Math.sin(giro.p * Math.PI) : 0}>
                  <div className="relative h-full w-full">
                    <Pagina id={id} interactivo={enReposo && !anotando} vistos={vistos} abrir={abrir} />
                    {enReposo && (
                      <CapaAnotacion
                        activo={anotando}
                        color={colorLapiz}
                        trazos={trazosActuales}
                        onTrazo={(t) => setTrazos((prev) => ({ ...prev, [actualId]: [...(prev[actualId] ?? []), t] }))}
                      />
                    )}
                  </div>
                </CapaPagina>
              )
            })}
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

        <button type="button" onClick={() => mover(-1)} disabled={indice === 0} className="press absolute left-2 z-10 hidden size-12 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-25 sm:flex" aria-label="Pantalla anterior">
          <ChevronLeft size={26} aria-hidden="true" />
        </button>
        <button type="button" onClick={() => mover(1)} disabled={indice === ids.length - 1} className="press absolute right-2 z-10 hidden size-12 cursor-pointer items-center justify-center rounded-full text-white/80 hover:bg-white/10 disabled:opacity-25 sm:flex" aria-label="Pantalla siguiente">
          <ChevronRight size={26} aria-hidden="true" />
        </button>

        {limpio && (
          <button type="button" onClick={() => setLimpio(false)} className="press material-oscuro absolute top-[calc(8px+env(safe-area-inset-top))] right-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full text-white/80" aria-label="Mostrar controles">
            <Minimize2 size={18} aria-hidden="true" />
          </button>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        Pantalla {indice + 1} de {ids.length}: {diapositivaPorId[actualId].titulo}
      </p>

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
                  onClick={() => pasar(i)}
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
                    setPanel(null)
                    pasar(i)
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
