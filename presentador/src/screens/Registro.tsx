import { useEffect, useId, useRef, useState, type PointerEvent as EventoPuntero } from 'react'
import { CalendarRange, Check, Clock, Eraser, Layers, Package, Sparkles, Star } from 'lucide-react'
import { ReporteVoz } from '../components/ReporteVoz'
import { Sheet } from '../components/Sheet'
import { StockPanel } from '../components/StockPanel'
import { diapositivaPorId } from '../data/presentaciones'
import { cronometro } from '../lib/formato'
import { ir } from '../lib/ruta'
import type { ExtraccionVoz } from '../lib/extraccionVoz'
import { useAhora } from '../lib/tiempo'
import { nombreCorto, useDemo } from '../state/demo'

const textosCalificacion = [
  '',
  'Baja receptividad · objeciones clínicas sin resolver',
  'Receptividad baja · pidió más información',
  'Receptividad media · dudas de cobertura o costo',
  'Receptivo · interés en probar el tratamiento',
  'Muy receptivo · alta intención de prescripción',
]

/** Marca de los campos que completó la IA: el APM igual revisa antes de guardar */
function MarcaIA() {
  return (
    <span className="chip ml-2 border-transparent bg-accent-soft align-middle text-accent">
      <Sparkles size={12} aria-hidden="true" />
      Completado por IA
    </span>
  )
}

const etiquetas = ['Pidió estudios', 'Interesado en muestras', 'Objeción de costo', 'Objeción de cobertura', 'Volver en 15 días', 'Derivar a MSL']

export function SinVisita() {
  return (
    <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-12 text-center">
      <CalendarRange size={28} aria-hidden="true" className="text-ink-3" />
      <h1 className="text-[20px] font-semibold text-ink">No hay una visita en curso</h1>
      <p className="text-[14px] text-ink-3">Hacé check-in en el consultorio para compartir material y registrar la visita.</p>
      <a href="#/" className="btn-primary mt-2">
        Ir a la agenda de hoy
      </a>
    </div>
  )
}

export function Pasos({ actual }: { actual: 1 | 2 }) {
  const pasos = ['Compartir material', 'Registrar visita']
  return (
    <ol className="flex items-center gap-2 text-[13px]" aria-label="Cierre de visita">
      {pasos.map((p, i) => {
        const n = i + 1
        const hecho = n < actual
        const activo = n === actual
        return (
          <li key={p} className="flex items-center gap-2" aria-current={activo ? 'step' : undefined}>
            {i > 0 && <span aria-hidden="true" className="h-px w-6 bg-line-2" />}
            <span className={`num flex size-6 items-center justify-center rounded-full text-[12px] ${activo ? 'bg-ink text-white' : hecho ? 'bg-ok text-white' : 'bg-sunken text-ink-3'}`}>
              {hecho ? <Check size={13} aria-hidden="true" /> : n}
            </span>
            <span className={activo ? 'font-semibold text-ink' : 'text-ink-3'}>
              <span className="sr-only">Paso {n} de 2: </span>
              {p}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Firma({ onCambio, invalida, idDescripcion }: { onCambio: (dataUrl: string | null) => void; invalida: boolean; idDescripcion: string }) {
  const canvas = useRef<HTMLCanvasElement>(null)
  const dibujando = useRef(false)
  const [vacia, setVacia] = useState(true)

  useEffect(() => {
    const c = canvas.current
    if (!c) return
    const { width, height } = c.getBoundingClientRect()
    const dpr = Math.min(window.devicePixelRatio || 1, 3)
    c.width = Math.round(width * dpr)
    c.height = Math.round(height * dpr)
    const ctx = c.getContext('2d')
    if (!ctx) return
    ctx.scale(dpr, dpr)
    ctx.strokeStyle = '#0f172a'
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }, [])

  function pos(e: EventoPuntero<HTMLCanvasElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  function borrar() {
    const c = canvas.current
    const ctx = c?.getContext('2d')
    if (!c || !ctx) return
    ctx.save()
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, c.width, c.height)
    ctx.restore()
    setVacia(true)
    onCambio(null)
  }

  return (
    <div>
      <div className={`relative overflow-hidden rounded-xl border-2 bg-white ${invalida ? 'border-bad' : 'border-line-2'}`}>
        <canvas
          ref={canvas}
          className="block h-[220px] w-full cursor-crosshair"
          style={{ touchAction: 'none' }}
          aria-label="Área de firma"
          aria-describedby={idDescripcion}
          role="img"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId)
            dibujando.current = true
            const ctx = e.currentTarget.getContext('2d')
            const { x, y } = pos(e)
            ctx?.beginPath()
            ctx?.moveTo(x, y)
            ctx?.lineTo(x + 0.1, y)
            ctx?.stroke()
          }}
          onPointerMove={(e) => {
            if (!dibujando.current) return
            const ctx = e.currentTarget.getContext('2d')
            const eventos = e.nativeEvent.getCoalescedEvents?.() ?? [e.nativeEvent]
            const r = e.currentTarget.getBoundingClientRect()
            for (const ev of eventos) ctx?.lineTo(ev.clientX - r.left, ev.clientY - r.top)
            ctx?.stroke()
          }}
          onPointerUp={(e) => {
            if (!dibujando.current) return
            dibujando.current = false
            setVacia(false)
            onCambio(e.currentTarget.toDataURL('image/png'))
          }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute right-6 bottom-12 left-6 border-b border-dashed border-line-2" />
        <span aria-hidden="true" className="pointer-events-none absolute bottom-4 left-6 text-[12px] text-ink-3">
          Firma del profesional
        </span>
        {vacia && <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[38%] text-center text-[14px] text-ink-3">Firmá con el dedo o el lápiz</span>}
      </div>
      <button type="button" className="btn-ghost mt-2" onClick={borrar} disabled={vacia}>
        <Eraser size={16} aria-hidden="true" />
        Borrar firma
      </button>
    </div>
  )
}

export function Registro() {
  const { estado, visitaActiva, online, despachar, avisar } = useDemo()
  const ahora = useAhora(1000, Boolean(visitaActiva))
  const [calificacion, setCalificacion] = useState(0)
  const [marcadas, setMarcadas] = useState<string[]>([])
  const [nota, setNota] = useState('')
  const [firma, setFirma] = useState<string | null>(null)
  const [enPapel, setEnPapel] = useState(false)
  const [errores, setErrores] = useState<{ calificacion?: boolean; firma?: boolean }>({})
  const [stockAbierto, setStockAbierto] = useState(false)
  const [porVoz, setPorVoz] = useState(false)
  const idNota = useId()
  const idFirma = useId()
  const refEstrellas = useRef<HTMLDivElement>(null)
  const refFirma = useRef<HTMLDivElement>(null)

  if (!visitaActiva) return <SinVisita />

  const registro = estado.registros[visitaActiva.id]
  const muestras = registro?.muestras ?? 0
  const tiempos = Object.entries(estado.tiempos).sort((a, b) => b[1] - a[1])
  const masVista = tiempos[0] ? diapositivaPorId[tiempos[0][0]] : null

  function guardar() {
    const nuevos = { calificacion: calificacion === 0, firma: muestras > 0 && !firma && !enPapel }
    setErrores(nuevos)
    if (nuevos.calificacion) return refEstrellas.current?.querySelector('button')?.focus()
    if (nuevos.firma) return refFirma.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    const nombre = nombreCorto(visitaActiva!)
    despachar({ tipo: 'cerrar', calificacion, etiquetas: marcadas, nota: nota.trim(), firma: firma ?? (enPapel ? 'papel' : null), origen: porVoz ? 'voz' : 'manual' })
    avisar(online ? `Visita con ${nombre} cerrada y sincronizada` : `Visita con ${nombre} guardada · se sincroniza al volver la señal`, online ? 'ok' : 'warn')
    ir('/')
  }

  function aplicarVoz(ex: ExtraccionVoz) {
    setCalificacion(ex.calificacion)
    setMarcadas(ex.etiquetas.filter((e) => etiquetas.includes(e)))
    setNota(ex.resumen)
    setErrores({})
    setPorVoz(true)
    const items = ex.items.filter((i) => i.disponible > 0).map((i) => ({ sku: i.sku, cantidad: i.disponible }))
    if (items.length) despachar({ tipo: 'entregar', items })
    despachar({ tipo: 'reporteVoz', resumen: `Reporte por voz procesado · ${nombreCorto(visitaActiva!)} · ${Math.round(ex.cobertura * 100)} % de campos` })
    avisar(items.length ? 'Registro completado · revisá y pedí la firma de las muestras' : 'Registro completado · revisá antes de guardar')
    if (items.some((i) => i.sku.includes('-MM-'))) window.setTimeout(() => refFirma.current?.scrollIntoView({ block: 'center', behavior: 'smooth' }), 350)
  }

  return (
    <div className="pt-6 md:pt-8">
      <Pasos actual={2} />
      <h1 className="mt-4 text-[28px] leading-tight font-semibold text-ink md:text-[34px]">¿Cómo te fue con {nombreCorto(visitaActiva)}?</h1>

      <dl className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {[
          { Icono: Clock, t: 'Duración', v: cronometro(ahora - (registro?.checkIn ?? ahora)) },
          { Icono: Layers, t: 'Pantallas vistas', v: `${tiempos.length}${masVista ? ` · más tiempo en ${masVista.titulo}` : ''}` },
          { Icono: Package, t: 'Muestras entregadas', v: `${muestras} u.` },
        ].map(({ Icono, t, v }) => (
          <div key={t} className="card flex items-center gap-3 px-4 py-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2">
              <Icono size={17} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <dt className="text-[12px] text-ink-3">{t}</dt>
              <dd className="num truncate text-[16px] font-medium text-ink">{v}</dd>
            </div>
          </div>
        ))}
      </dl>

      <ReporteVoz visita={visitaActiva} onAplicar={aplicarVoz} />

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <section aria-labelledby="titulo-receptividad" className="card p-5">
            <h2 id="titulo-receptividad" className="text-[16px] font-semibold text-ink">
              Receptividad del médico
              {porVoz && <MarcaIA />}
            </h2>
            <div ref={refEstrellas} role="group" aria-labelledby="titulo-receptividad" aria-describedby="texto-calificacion" className="mt-4 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={calificacion === n}
                  aria-label={`${n} de 5`}
                  onClick={() => {
                    setCalificacion(n)
                    setErrores((e) => ({ ...e, calificacion: false }))
                  }}
                  className={`press flex size-14 cursor-pointer items-center justify-center rounded-2xl border-2 ${n <= calificacion ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink-3 hover:border-line-2'}`}
                >
                  <Star size={24} aria-hidden="true" className={n <= calificacion ? 'fill-white' : ''} />
                </button>
              ))}
            </div>
            <p id="texto-calificacion" aria-live="polite" className={`mt-3 min-h-5 text-[14px] ${errores.calificacion ? 'text-bad' : 'text-ink-2'}`}>
              {errores.calificacion ? 'Elegí una calificación para cerrar la visita.' : textosCalificacion[calificacion] || 'Tocá una estrella.'}
            </p>

            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Etiquetas de la visita">
              {etiquetas.map((e) => {
                const activa = marcadas.includes(e)
                return (
                  <button
                    key={e}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => setMarcadas((m) => (activa ? m.filter((x) => x !== e) : [...m, e]))}
                    className={`press inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[14px] font-medium ${activa ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink-2 hover:border-line-2'}`}
                  >
                    {activa && <Check size={14} aria-hidden="true" />}
                    {e}
                  </button>
                )
              })}
            </div>
          </section>

          <section className="card p-5">
            <label htmlFor={idNota} className="text-[16px] font-semibold text-ink">
              Nota para la próxima visita
            </label>
            {porVoz && <MarcaIA />}
            <textarea
              id={idNota}
              name="nota"
              rows={4}
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              placeholder="Ej.: consultó por pacientes diabéticos…"
              className="field mt-3 min-h-28 py-2.5 leading-relaxed"
            />
          </section>
        </div>

        <section ref={refFirma} aria-labelledby="titulo-firma" className="card p-5">
          <h2 id="titulo-firma" className="text-[16px] font-semibold text-ink">
            Recepción de muestras
          </h2>
          {muestras > 0 ? (
            <>
              <p id={idFirma} className="mt-2 mb-4 text-[14px] leading-relaxed text-ink-2">
                Declaro haber recibido <strong className="num">{muestras}</strong> unidades de muestras médicas sin valor comercial.
              </p>
              <Firma
                idDescripcion={idFirma}
                invalida={Boolean(errores.firma)}
                onCambio={(f) => {
                  setFirma(f)
                  setErrores((e) => ({ ...e, firma: false }))
                }}
              />
              <label className="mt-3 flex min-h-11 cursor-pointer items-center gap-3 text-[14px] text-ink-2">
                <input
                  type="checkbox"
                  name="firma-papel"
                  checked={enPapel}
                  onChange={(e) => {
                    setEnPapel(e.target.checked)
                    setErrores((x) => ({ ...x, firma: false }))
                  }}
                  className="size-5 accent-ink"
                />
                El médico firmó el remito en papel
              </label>
              {errores.firma && (
                <p className="mt-1 text-[13px] text-bad" role="alert">
                  Falta la firma de recepción de las muestras.
                </p>
              )}
            </>
          ) : (
            <div className="mt-3 flex flex-col items-start gap-3">
              <p className="text-[14px] leading-relaxed text-ink-2">No se entregaron muestras en esta visita, así que no hace falta firma.</p>
              <button type="button" className="btn-secondary" onClick={() => setStockAbierto(true)}>
                <Package size={16} aria-hidden="true" />
                Registrar entrega de muestras
              </button>
            </div>
          )}
        </section>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
        <a href="#/cierre" className="btn-ghost">
          Volver
        </a>
        <button type="button" className="btn-primary" onClick={guardar}>
          <Check size={17} aria-hidden="true" />
          Guardar y hacer check-out
        </button>
      </div>

      <Sheet abierto={stockAbierto} onCerrar={() => setStockAbierto(false)} titulo="Muestras para el consultorio" ancho="520px">
        <StockPanel productosEnFoco={visitaActiva.productosInteres} />
      </Sheet>
    </div>
  )
}
