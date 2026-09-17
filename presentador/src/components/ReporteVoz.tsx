import { useEffect, useRef, useState, type RefObject } from 'react'
import { AlertTriangle, AudioLines, Check, CheckCircle2, ChevronDown, Mic, Package, RotateCcw, ShieldAlert, Sparkles, Square, Star } from 'lucide-react'
import { apellido } from '../data/crm'
import { extraer, guionEjemplo, type Entidad, type ExtraccionVoz, type TipoEntidad } from '../lib/extraccionVoz'
import { cronometro } from '../lib/formato'
import { prefiereMenosMovimiento } from '../lib/tiempo'
import { soportaDictado, useDictado } from '../lib/voz'
import { useDemo } from '../state/demo'
import type { Visita } from '../types'
import { ChipProducto } from './ui'

type Fase = 'inicio' | 'grabando' | 'procesando' | 'resultado' | 'aplicado'

const pasos = ['Transcribiendo el audio', 'Identificando médico y productos', 'Detectando muestras, feedback y compromisos', 'Validando contra el fichero médico y el stock']

const estiloEntidad: Record<TipoEntidad, { clase: string; texto: string }> = {
  medico: { clase: 'bg-accent-soft text-accent', texto: 'Médico' },
  producto: { clase: 'bg-cardio-tint text-cardio', texto: 'Producto' },
  muestra: { clase: 'bg-warn-soft text-warn', texto: 'Muestras' },
  feedback: { clase: 'bg-[#efe9fb] text-[#5b3fa6]', texto: 'Feedback' },
  evento: { clase: 'bg-bad-soft text-bad', texto: 'Evento adverso' },
  accion: { clase: '', texto: '' },
}

/** Onda de audio: se dibuja fuera de React para no re-renderizar a 60 fps */
function Onda({ nivel, simulada }: { nivel: RefObject<number>; simulada: boolean }) {
  const barras = useRef<(HTMLSpanElement | null)[]>([])
  useEffect(() => {
    let raf = 0
    const inicio = performance.now()
    const cuadro = (t: number) => {
      const s = (t - inicio) / 1000
      const base = simulada ? 0.3 + 0.35 * Math.abs(Math.sin(s * 2.1)) * (0.6 + 0.4 * Math.sin(s * 5.3)) : nivel.current ?? 0
      barras.current.forEach((b, i) => {
        if (!b) return
        const forma = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.55 + s * (simulada ? 7 : 4)))
        b.style.transform = `scaleY(${Math.max(0.08, Math.min(1, base * forma * 1.6))})`
      })
      raf = requestAnimationFrame(cuadro)
    }
    raf = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(raf)
  }, [nivel, simulada])

  return (
    <div aria-hidden="true" className="flex h-12 items-center gap-[3px]">
      {Array.from({ length: 36 }, (_, i) => (
        <span key={i} ref={(el) => void (barras.current[i] = el)} className="h-full w-[3px] origin-center rounded-full bg-[#7cc4ee]" style={{ transform: 'scaleY(0.08)' }} />
      ))}
    </div>
  )
}

function Transcripcion({ texto, entidades }: { texto: string; entidades: Entidad[] }) {
  const partes: { t: string; e?: Entidad }[] = []
  let cursor = 0
  for (const e of entidades) {
    if (e.inicio > cursor) partes.push({ t: texto.slice(cursor, e.inicio) })
    partes.push({ t: texto.slice(e.inicio, e.fin), e })
    cursor = e.fin
  }
  if (cursor < texto.length) partes.push({ t: texto.slice(cursor) })
  return (
    <p className="text-[15px] leading-[1.9] text-ink-2">
      {partes.map((p, i) =>
        p.e ? (
          <mark key={i} className={`rounded px-1 py-0.5 font-medium ${estiloEntidad[p.e.tipo].clase}`}>
            {p.t}
            <span className="sr-only"> ({estiloEntidad[p.e.tipo].texto})</span>
          </mark>
        ) : (
          <span key={i}>{p.t}</span>
        ),
      )}
    </p>
  )
}

function Campo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-line py-3 last:border-0 sm:flex-row sm:items-start sm:gap-4">
      <dt className="w-32 shrink-0 pt-0.5 text-[13px] text-ink-3">{titulo}</dt>
      <dd className="min-w-0 flex-1 text-[14px] text-ink">{children}</dd>
    </div>
  )
}

interface Props {
  visita: Visita
  onAplicar: (extraccion: ExtraccionVoz) => void
}

export function ReporteVoz({ visita, onAplicar }: Props) {
  const { estado, online, despachar, avisar } = useDemo()
  const dictado = useDictado()
  const [fase, setFase] = useState<Fase>('inicio')
  const [simulada, setSimulada] = useState(false)
  const [textoSimulado, setTextoSimulado] = useState('')
  const [inicioGrabacion, setInicioGrabacion] = useState(0)
  const [ahora, setAhora] = useState(0)
  const [paso, setPaso] = useState(0)
  const [resultado, setResultado] = useState<ExtraccionVoz | null>(null)
  const [notificado, setNotificado] = useState(false)
  const [detalleAbierto, setDetalleAbierto] = useState(false)
  const nivelSimulado = useRef(0)
  const intervalos = useRef<number[]>([])
  const puedeDictar = soportaDictado() && online

  useEffect(() => () => intervalos.current.forEach((id) => window.clearInterval(id)), [])

  useEffect(() => {
    if (fase !== 'grabando') return
    const id = window.setInterval(() => setAhora(Date.now()), 250)
    return () => window.clearInterval(id)
  }, [fase])

  function limpiarIntervalos() {
    intervalos.current.forEach((id) => window.clearInterval(id))
    intervalos.current = []
  }

  function procesar(texto: string) {
    limpiarIntervalos()
    if (!texto.trim()) {
      setFase('inicio')
      avisar('No se escuchó el reporte. Probá de nuevo más cerca del micrófono', 'warn')
      return
    }
    const ex = extraer(texto, { visita, stock: estado.stock })
    setResultado(ex)
    setPaso(0)
    setFase('procesando')
    const duracion = prefiereMenosMovimiento() ? 120 : 560
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setPaso(n)
      if (n >= pasos.length) {
        window.clearInterval(id)
        setFase('resultado')
      }
    }, duracion)
    intervalos.current.push(id)
  }

  async function grabar() {
    setSimulada(false)
    setNotificado(false)
    const ok = await dictado.iniciar()
    if (!ok) {
      avisar('No hay acceso al micrófono. Usá el reporte de ejemplo', 'warn')
      return
    }
    setInicioGrabacion(Date.now())
    setAhora(Date.now())
    setFase('grabando')
  }

  function ejemplo() {
    const guion = guionEjemplo(visita)
    const palabras = guion.split(' ')
    setSimulada(true)
    setNotificado(false)
    setTextoSimulado('')
    setInicioGrabacion(Date.now())
    setAhora(Date.now())
    setFase('grabando')
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTextoSimulado(palabras.slice(0, i).join(' '))
      if (i >= palabras.length) {
        window.clearInterval(id)
        const fin = window.setInterval(() => {
          window.clearInterval(fin)
          procesar(guion)
        }, 700)
        intervalos.current.push(fin)
      }
    }, prefiereMenosMovimiento() ? 15 : 120)
    intervalos.current.push(id)
  }

  function terminar() {
    if (simulada) return procesar(guionEjemplo(visita))
    procesar(dictado.detener())
  }

  function aplicar() {
    if (!resultado) return
    onAplicar(resultado)
    setFase('aplicado')
    setDetalleAbierto(false)
  }

  const textoVivo = simulada ? textoSimulado : `${dictado.texto} ${dictado.parcial}`.trim()
  const r = resultado

  return (
    <section aria-labelledby="titulo-voz" className="card mt-6 overflow-hidden">
      <div className="relative overflow-hidden bg-ink p-5 text-white md:p-6">
        <div aria-hidden="true" className="pointer-events-none absolute -top-24 -right-16 size-72 rounded-full bg-[#7cc4ee]/15 blur-3xl" />
        <div className="relative flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="min-w-0 flex-1 basis-72">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 font-mono text-[11px] tracking-[0.08em] text-white/80 uppercase">
                <Sparkles size={12} aria-hidden="true" />
                Zero-click reporting
              </span>
              <span className="text-[12px] text-white/55">{online ? 'Transcripción cifrada en la nube' : 'Sin conexión · se procesa en el dispositivo'}</span>
            </div>
            <h2 id="titulo-voz" className="mt-2 text-[20px] leading-tight font-semibold">
              {fase === 'aplicado' ? 'Registro completado a partir de tu audio' : fase === 'grabando' ? 'Te escucho…' : 'Contá cómo fue la visita y la IA completa el registro'}
            </h2>
            {fase === 'inicio' && (
              <p className="mt-1 max-w-[60ch] text-[14px] leading-relaxed text-white/65">
                Nombrá los productos, las muestras que dejaste, qué dijo {visita.medico.nombre.startsWith('Dra.') ? 'la doctora' : 'el doctor'} {apellido(visita.medico.nombre)} y el próximo paso. Vos solo revisás y firmás.
              </p>
            )}
          </div>

          {fase === 'inicio' && (
            <div className="flex flex-wrap items-center gap-2">
              {puedeDictar && (
                <button type="button" onClick={grabar} className="btn bg-white text-ink hover:bg-white/90">
                  <Mic size={17} aria-hidden="true" />
                  Grabar reporte
                </button>
              )}
              <button type="button" onClick={ejemplo} className={puedeDictar ? 'btn text-white hover:bg-white/10' : 'btn bg-white text-ink hover:bg-white/90'}>
                <AudioLines size={17} aria-hidden="true" />
                {puedeDictar ? 'Probar con un audio de ejemplo' : 'Usar audio de ejemplo'}
              </button>
            </div>
          )}

          {fase === 'grabando' && (
            <div className="flex items-center gap-4">
              <Onda nivel={simulada ? nivelSimulado : dictado.nivel} simulada={simulada} />
              <span className="num text-[15px] text-white/80" aria-label="Duración de la grabación">
                {cronometro(ahora - inicioGrabacion)}
              </span>
              <button type="button" onClick={terminar} className="btn bg-white text-ink hover:bg-white/90">
                <Square size={14} aria-hidden="true" className="fill-ink" />
                Terminar
              </button>
            </div>
          )}

          {fase === 'aplicado' && r && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn text-white hover:bg-white/10" aria-expanded={detalleAbierto} onClick={() => setDetalleAbierto((v) => !v)}>
                Ver lo que se extrajo
                <ChevronDown size={16} aria-hidden="true" className={`transition-transform duration-200 ${detalleAbierto ? 'rotate-180' : ''}`} />
              </button>
              <button type="button" className="btn text-white hover:bg-white/10" onClick={() => setFase('inicio')}>
                <RotateCcw size={16} aria-hidden="true" />
                Grabar otro
              </button>
            </div>
          )}
        </div>

        {fase === 'grabando' && (
          <p aria-live="polite" className="relative mt-4 min-h-12 max-w-[80ch] text-[16px] leading-relaxed text-white/90">
            {textoVivo || <span className="text-white/50">Empezá a hablar…</span>}
            <span aria-hidden="true" className="ml-0.5 inline-block h-4 w-0.5 translate-y-0.5 animate-pulse bg-white/70" />
          </p>
        )}
        {!simulada && dictado.error === 'red' && fase === 'grabando' && (
          <p className="relative mt-2 text-[13px] text-[#f5c46b]">El reconocimiento de voz perdió la conexión. Terminá y probá con el ejemplo.</p>
        )}
      </div>

      {fase === 'procesando' && (
        <ol aria-live="polite" className="flex flex-col gap-2.5 p-5 md:p-6">
          {pasos.map((p, i) => {
            const hecho = i < paso
            const actual = i === paso
            return (
              <li key={p} className={`flex items-center gap-3 text-[14px] ${hecho ? 'text-ink' : actual ? 'text-ink' : 'text-ink-3'}`}>
                <span className={`flex size-6 items-center justify-center rounded-full ${hecho ? 'bg-ok text-white' : 'bg-sunken'}`}>
                  {hecho ? <Check size={13} aria-hidden="true" /> : actual ? <span className="spinner size-3.5 rounded-full border-2 border-ink-3 border-t-transparent" /> : null}
                </span>
                {p}
              </li>
            )
          })}
        </ol>
      )}

      {r && (fase === 'resultado' || (fase === 'aplicado' && detalleAbierto)) && (
        <div className="animate-entrar grid gap-6 p-5 md:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div>
            <h3 className="eyebrow">Transcripción</h3>
            <div className="mt-3">
              <Transcripcion texto={r.transcripcion} entidades={r.entidades} />
            </div>
            <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Referencias">
              {(['medico', 'producto', 'muestra', 'feedback', 'evento'] as TipoEntidad[])
                .filter((t) => r.entidades.some((e) => e.tipo === t))
                .map((t) => (
                  <li key={t} className={`rounded-md px-2 py-0.5 text-[12px] font-medium ${estiloEntidad[t].clase}`}>
                    {estiloEntidad[t].texto}
                  </li>
                ))}
            </ul>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3">
              <h3 className="eyebrow">Campos del CRM</h3>
              <span className="chip border-transparent bg-ok-soft text-ok">
                <CheckCircle2 size={12} aria-hidden="true" />
                <span className="num">{Math.round(r.cobertura * 100)} %</span> completado
              </span>
            </div>
            <dl className="mt-2">
              <Campo titulo="Médico">
                {r.medico ? (
                  <span className="flex flex-wrap items-center gap-2">
                    {r.medico.nombre}
                    {r.medico.coincide ? (
                      <span className="chip border-transparent bg-ok-soft text-ok">Coincide con la visita</span>
                    ) : (
                      <span className="chip border-transparent bg-warn-soft text-warn">No es la visita en curso</span>
                    )}
                  </span>
                ) : (
                  <span className="text-ink-3">No se mencionó · se usa {visita.medico.nombre}</span>
                )}
              </Campo>
              <Campo titulo="Productos">
                <span className="flex flex-wrap gap-1.5">
                  {r.productos.map((p) => (
                    <ChipProducto key={p} id={p} />
                  ))}
                </span>
              </Campo>
              <Campo titulo="Receptividad">
                <span className="flex items-center gap-2">
                  <span className="flex" aria-label={`${r.calificacion} de 5`}>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <Star key={n} size={16} aria-hidden="true" className={n <= r.calificacion ? 'fill-ink text-ink' : 'text-line-2'} />
                    ))}
                  </span>
                  <span className="text-ink-3">Tono {r.sentimiento}</span>
                </span>
              </Campo>
              <Campo titulo="Muestras y material">
                {r.items.length === 0 ? (
                  <span className="text-ink-3">No se mencionaron entregas</span>
                ) : (
                  <ul className="flex flex-col gap-1.5">
                    {r.items.map((it) => (
                      <li key={it.sku} className="flex flex-wrap items-center gap-2">
                        <Package size={14} aria-hidden="true" className="text-ink-3" />
                        <span className="num">{it.cantidad} ×</span> {it.nombre}
                        {it.disponible < it.cantidad && (
                          <span className="chip border-transparent bg-bad-soft text-bad">
                            {it.disponible === 0 ? 'Sin stock · no se registra' : `Stock para ${it.disponible}`}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Campo>
              <Campo titulo="Feedback">
                {r.etiquetas.length ? (
                  <span className="flex flex-wrap gap-1.5">
                    {r.etiquetas.map((e) => (
                      <span key={e} className="chip">
                        {e}
                      </span>
                    ))}
                  </span>
                ) : (
                  <span className="text-ink-3">Sin comentarios clasificables</span>
                )}
              </Campo>
              <Campo titulo="Próximo paso">{r.proximoPaso ?? <span className="text-ink-3">No se definió</span>}</Campo>
            </dl>

            {r.eventoAdverso && (
              <div role="alert" className="mt-3 rounded-xl border border-bad/25 bg-bad-soft p-4">
                <div className="flex items-start gap-3">
                  <ShieldAlert size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-bad" />
                  <div className="min-w-0">
                    <p className="text-[14px] font-semibold text-ink">Posible evento adverso detectado</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-ink-2">“{r.eventoAdverso}”. La normativa de farmacovigilancia exige notificarlo dentro de las 24 horas.</p>
                    {notificado ? (
                      <p className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-semibold text-ok">
                        <CheckCircle2 size={15} aria-hidden="true" />
                        Notificado a Farmacovigilancia
                      </p>
                    ) : (
                      <button
                        type="button"
                        className="btn mt-3 bg-bad text-white hover:bg-bad/90"
                        onClick={() => {
                          despachar({ tipo: 'farmacovigilancia', fragmento: r.eventoAdverso! })
                          setNotificado(true)
                          avisar(online ? 'Evento adverso notificado a Farmacovigilancia' : 'Notificación guardada · se envía con prioridad al volver la señal', online ? 'ok' : 'warn')
                        }}
                      >
                        <AlertTriangle size={16} aria-hidden="true" />
                        Notificar a Farmacovigilancia
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {fase === 'resultado' && (
              <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" className="btn-ghost" onClick={() => setFase('inicio')}>
                  <RotateCcw size={16} aria-hidden="true" />
                  Descartar
                </button>
                <button type="button" className="btn-primary" onClick={aplicar}>
                  <Check size={17} aria-hidden="true" />
                  Aplicar al registro
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
