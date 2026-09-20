import { Fragment, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ArrowUp, CalendarPlus, Check, ChevronDown, Database, Lock, Mic, Sparkles, Square } from 'lucide-react'
import { BadgeCategoria, Variacion } from '../components/crm'
import { EncabezadoPantalla } from '../components/ui'
import { preguntasEjemplo, responder, type Columna, type Fila, type RespuestaCurator } from '../lib/curator'
import { prefiereMenosMovimiento } from '../lib/tiempo'
import { soportaDictado, useDictado } from '../lib/voz'
import { useDemo } from '../state/demo'

interface Turno {
  id: number
  pregunta: string
  respuesta: RespuestaCurator
}

const pasosPensando = ['Interpretando la pregunta', 'Generando la consulta', 'Consultando las fuentes', 'Redactando la respuesta']

/** Negritas con **texto**, sin HTML crudo */
function Enriquecido({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\*\*[^*]+\*\*)/).map((p, i) =>
        p.startsWith('**') ? (
          <strong key={i} className="font-semibold text-ink">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  )
}

function Celda({ col, fila }: { col: Columna; fila: Fila }) {
  const v = fila[col.clave]
  switch (col.tipo) {
    case 'medico':
      return (
        <a href={`#/medicos/${fila.medicoId}`} className="font-medium text-ink underline-offset-2 hover:underline">
          {v}
        </a>
      )
    case 'categoria':
      return <BadgeCategoria categoria={v as 'A' | 'B' | 'C'} />
    case 'variacion':
      return <Variacion valor={v as number} />
    case 'dias':
      return <span className={`num ${(v as number) > 45 ? 'text-bad' : 'text-ink-2'}`}>{v} d</span>
    case 'pct':
      return <span className="num text-ink">{Math.round((v as number) * 100)} %</span>
    case 'num':
      return <span className="num text-ink">{v}</span>
    default:
      return <span className="text-ink-2">{v}</span>
  }
}

function Grafico({ g }: { g: NonNullable<RespuestaCurator['grafico']> }) {
  const max = Math.max(...g.items.map((i) => Math.abs(i.valor)), 0.0001)
  const negativos = g.items.some((i) => i.valor < 0)
  return (
    <figure>
      <figcaption className="eyebrow mb-3">{g.titulo}</figcaption>
      <ul className="flex flex-col gap-2">
        {g.items.map((it, i) => (
          <li key={it.etiqueta} className="grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-[13px]">
            <span className="truncate text-ink-2">{it.etiqueta}</span>
            <span className="h-2.5 overflow-hidden rounded-full bg-sunken">
              <span
                className="barra-crece block h-full rounded-full"
                style={{
                  width: `${(Math.abs(it.valor) / max) * 100}%`,
                  background: negativos ? 'var(--color-bad)' : 'var(--color-accent)',
                  animationDelay: `${i * 60}ms`,
                }}
              />
            </span>
            <span className="num text-right text-ink">
              {g.formato === 'pct' ? `${it.valor < 0 ? '−' : ''}${Math.abs(Math.round(it.valor * 100))} %` : it.valor}
            </span>
          </li>
        ))}
      </ul>
    </figure>
  )
}

function Pensando({ onFin }: { onFin: () => void }) {
  const [paso, setPaso] = useState(0)
  const fin = useRef(onFin)
  useEffect(() => {
    const ms = prefiereMenosMovimiento() ? 60 : 420
    let n = 0
    const id = window.setInterval(() => {
      n += 1
      setPaso(n)
      if (n >= pasosPensando.length) {
        window.clearInterval(id)
        fin.current()
      }
    }, ms)
    return () => window.clearInterval(id)
  }, [])
  return (
    <ol aria-live="polite" className="flex flex-col gap-2">
      {pasosPensando.map((p, i) => (
        <li key={p} className={`flex items-center gap-2.5 text-[14px] ${i <= paso ? 'text-ink-2' : 'text-ink-3/60'}`}>
          <span className={`flex size-5 items-center justify-center rounded-full ${i < paso ? 'bg-ok text-white' : 'bg-sunken'}`}>
            {i < paso ? <Check size={11} aria-hidden="true" /> : i === paso ? <span className="spinner size-3 rounded-full border-2 border-ink-3 border-t-transparent" /> : null}
          </span>
          {p}
        </li>
      ))}
    </ol>
  )
}

/** Revela el resumen de a poco, como una respuesta que se escribe */
function useEscritura(texto: string, activo: boolean) {
  const [n, setN] = useState(activo && !prefiereMenosMovimiento() ? 0 : texto.length)
  useEffect(() => {
    if (!activo || prefiereMenosMovimiento()) return setN(texto.length)
    setN(0)
    const id = window.setInterval(() => setN((x) => (x >= texto.length ? (window.clearInterval(id), x) : x + 3)), 16)
    return () => window.clearInterval(id)
  }, [texto, activo])
  // no cortar en medio de un **: se completa el marcador abierto
  const parcial = texto.slice(0, n)
  return (parcial.match(/\*\*/g)?.length ?? 0) % 2 ? `${parcial}**` : parcial
}

function Respuesta({ turno, onPreguntar, reciente }: { turno: Turno; onPreguntar: (q: string) => void; reciente: boolean }) {
  const { despachar, avisar, online } = useDemo()
  const [listo, setListo] = useState(!reciente)
  const [sqlAbierto, setSqlAbierto] = useState(false)
  const [planCreado, setPlanCreado] = useState(false)
  const r = turno.respuesta
  const resumen = useEscritura(r.resumen, listo && reciente)
  const escrito = resumen.length >= r.resumen.length

  return (
    <article className="flex flex-col gap-3">
      <div className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-3 text-[15px] text-white">{turno.pregunta}</div>

      <div className="card p-5 md:p-6">
        <div className="mb-3 flex items-center gap-2 text-[13px] font-medium text-ink-3">
          <span className="flex size-6 items-center justify-center rounded-full bg-ia-soft text-ia">
            <Sparkles size={13} aria-hidden="true" />
          </span>
          Asistente
        </div>

        {!listo ? (
          <Pensando onFin={() => setListo(true)} />
        ) : (
          <div className="flex flex-col gap-5">
            {r.interpretacion.length > 0 && (
              <ul className="flex flex-wrap gap-1.5" aria-label="Cómo interpreté la pregunta">
                {r.interpretacion.map((c) => (
                  <li key={c} className="chip bg-sunken">
                    {c}
                  </li>
                ))}
              </ul>
            )}

            <p className="max-w-[72ch] text-[16px] leading-relaxed text-ink-2">
              <Enriquecido texto={resumen} />
            </p>

            {escrito && (
              <div className="animate-entrar flex flex-col gap-5">
                {r.destacados.length > 0 && (
                  <dl className="flex flex-wrap gap-3">
                    {r.destacados.map((d) => (
                      <div key={d.etiqueta} className="min-w-28 rounded-xl bg-sunken px-4 py-3">
                        <dd className="num text-[24px] leading-none font-medium text-ink">{d.valor}</dd>
                        <dt className="mt-1 text-[12px] text-ink-3">{d.etiqueta}</dt>
                      </div>
                    ))}
                  </dl>
                )}

                {r.filas.length > 0 && (
                  <div className={`grid gap-5 ${r.grafico ? 'xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]' : ''}`}>
                    <div className="overflow-x-auto rounded-xl border border-line">
                      <table className="w-full min-w-[460px] text-left text-[13px]">
                        <thead className="bg-sunken/60 text-[12px] text-ink-3">
                          <tr>
                            {r.columnas.map((c) => (
                              <th key={c.clave} scope="col" className="px-3 py-2 font-medium first:pl-4">
                                {c.titulo}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                          {r.filas.slice(0, 12).map((f, i) => (
                            <tr key={f.medicoId ?? i}>
                              {r.columnas.map((c) => (
                                <td key={c.clave} className="px-3 py-2.5 whitespace-nowrap first:pl-4">
                                  <Celda col={c} fila={f} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {r.filas.length > 12 && <p className="border-t border-line px-4 py-2 text-[12px] text-ink-3">y {r.filas.length - 12} más</p>}
                    </div>
                    {r.grafico && <Grafico g={r.grafico} />}
                  </div>
                )}

                {(r.accion || r.sql) && (
                  <div className="flex flex-wrap items-center gap-2">
                    {r.accion &&
                      (planCreado ? (
                        <span className="inline-flex min-h-11 items-center gap-2 px-2 text-[14px] font-semibold text-ok">
                          <Check size={16} aria-hidden="true" />
                          Plan enviado a las agendas
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={() => {
                            despachar({ tipo: 'plan', medicos: r.accion!.medicos, resumen: `Plan de visitas para ${r.accion!.medicos.length} médicos creado desde el asistente` })
                            setPlanCreado(true)
                            avisar(online ? `Plan creado · se suma a la agenda de cada APM` : 'Plan guardado · se envía al volver la señal', online ? 'ok' : 'warn')
                          }}
                        >
                          <CalendarPlus size={16} aria-hidden="true" />
                          {r.accion.texto}
                        </button>
                      ))}
                    {r.sql && (
                      <button type="button" className="btn-ghost" aria-expanded={sqlAbierto} onClick={() => setSqlAbierto((v) => !v)}>
                        <Database size={16} aria-hidden="true" />
                        Cómo lo calculé
                        <ChevronDown size={15} aria-hidden="true" className={`transition-transform duration-200 ${sqlAbierto ? 'rotate-180' : ''}`} />
                      </button>
                    )}
                  </div>
                )}

                {sqlAbierto && (
                  <div className="animate-entrar overflow-hidden rounded-xl bg-stage">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-white/10 px-4 py-2.5 text-[12px] text-white/60">
                      <span className="font-medium text-white/85">Consulta generada · solo lectura</span>
                      {r.fuentes.map((f) => (
                        <span key={f}>{f}</span>
                      ))}
                    </div>
                    <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#c9d6e3]" translate="no">
                      <code>{r.sql}</code>
                    </pre>
                  </div>
                )}

                {r.sugerencias.length > 0 && (
                  <div>
                    <div className="mb-2 text-[12px] text-ink-3">Seguir preguntando</div>
                    <div className="flex flex-wrap gap-2">
                      {r.sugerencias.map((s) => (
                        <button key={s} type="button" onClick={() => onPreguntar(s)} className="press min-h-10 cursor-pointer rounded-full border border-line bg-surface px-3.5 text-left text-[13px] text-ink-2 hover:border-line-2 hover:text-ink">
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

function Lateral({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="card p-5">
      <h2 className="text-[15px] font-semibold text-ink">{titulo}</h2>
      {children}
    </section>
  )
}

export function Asistente() {
  const { estado } = useDemo()
  const [texto, setTexto] = useState('')
  const [turnos, setTurnos] = useState<Turno[]>([])
  const dictado = useDictado()
  const finRef = useRef<HTMLDivElement>(null)
  const entradaRef = useRef<HTMLTextAreaElement>(null)
  const secuencia = useRef(0)

  useEffect(() => {
    if (dictado.escuchando) setTexto(`${dictado.texto} ${dictado.parcial}`.trim())
  }, [dictado.escuchando, dictado.texto, dictado.parcial])

  function preguntar(q: string) {
    const pregunta = q.trim()
    if (!pregunta) return
    if (dictado.escuchando) dictado.detener()
    secuencia.current += 1
    setTurnos((t) => [...t, { id: secuencia.current, pregunta, respuesta: responder(pregunta, { registros: estado.registros, entregas: estado.entregas }) }])
    setTexto('')
    window.setTimeout(() => finRef.current?.scrollIntoView({ behavior: prefiereMenosMovimiento() ? 'auto' : 'smooth', block: 'start' }), 60)
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    preguntar(texto)
  }

  const compositor = (
    <form onSubmit={enviar} className="card flex items-end gap-2 p-2 focus-within:border-accent">
      <label htmlFor="pregunta" className="sr-only">
        Pregunta para el asistente
      </label>
      <textarea
        ref={entradaRef}
        id="pregunta"
        name="pregunta"
        rows={1}
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            preguntar(texto)
          }
        }}
        placeholder="Preguntale a tus datos…"
        className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-3 py-2.5 text-[16px] leading-snug text-ink outline-none placeholder:text-ink-3"
      />
      {soportaDictado() && (
        <button
          type="button"
          className={`btn-icon ${dictado.escuchando ? 'bg-bad-soft text-bad hover:bg-bad-soft' : ''}`}
          aria-label={dictado.escuchando ? 'Detener dictado' : 'Dictar pregunta'}
          aria-pressed={dictado.escuchando}
          onClick={() => (dictado.escuchando ? dictado.detener() : void dictado.iniciar())}
        >
          {dictado.escuchando ? <Square size={15} aria-hidden="true" className="fill-current" /> : <Mic size={18} aria-hidden="true" />}
        </button>
      )}
      <button type="submit" className="btn-icon bg-ink text-white hover:bg-[#1c2536] hover:text-white" aria-label="Preguntar" disabled={!texto.trim()}>
        <ArrowUp size={18} aria-hidden="true" />
      </button>
    </form>
  )

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Gerencia · IA generativa"
        titulo="Asistente estratégico"
        descripcion="Preguntale a los datos de la fuerza de ventas en tus palabras, en lugar de armar un tablero para cada duda."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex min-w-0 flex-col gap-6">
          {turnos.length === 0 ? (
            <>
              {compositor}
              <section aria-labelledby="titulo-ejemplos">
                <h2 id="titulo-ejemplos" className="eyebrow mb-3">
                  Probá con
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {preguntasEjemplo.map((p, i) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => preguntar(p)}
                      className={`press card flex min-h-20 cursor-pointer items-start gap-3 p-4 text-left hover:border-line-2 hover:shadow-(--shadow-float) ${i === 0 ? 'sm:col-span-2 border-ink bg-ink text-white hover:border-ink' : ''}`}
                    >
                      <Sparkles size={17} aria-hidden="true" className={`mt-0.5 shrink-0 ${i === 0 ? 'text-[#a99bf0]' : 'text-ia'}`} />
                      <span className={`text-[15px] leading-snug ${i === 0 ? 'font-semibold' : 'text-ink'}`}>{p}</span>
                    </button>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              {turnos.map((t, i) => (
                <div key={t.id} ref={i === turnos.length - 1 ? finRef : undefined} className="scroll-mt-24">
                  <Respuesta turno={t} onPreguntar={preguntar} reciente={i === turnos.length - 1} />
                </div>
              ))}
              <div className="sticky bottom-[calc(84px+env(safe-area-inset-bottom))] z-10 md:bottom-4">{compositor}</div>
            </>
          )}
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <Lateral titulo="Fuentes conectadas">
            <ul className="mt-3 flex flex-col gap-2.5 text-[13px]">
              {[
                ['Visitas y feedback', 'CRM · tiempo real'],
                ['Prescripciones', 'Auditoría mensual · 36 médicos'],
                ['Muestras por lote', 'Trazabilidad + SAP'],
                ['Reportes por voz', 'Entidades extraídas'],
              ].map(([t, d]) => (
                <li key={t} className="flex items-start gap-2.5">
                  <span aria-hidden="true" className="mt-1.5 size-2 shrink-0 rounded-full bg-ok" />
                  <span>
                    <span className="block font-medium text-ink">{t}</span>
                    <span className="block text-ink-3">{d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Lateral>
          <Lateral titulo="Gobernanza">
            <ul className="mt-3 flex flex-col gap-2 text-[13px] leading-relaxed text-ink-2">
              <li className="flex gap-2">
                <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
                Solo lectura: el asistente nunca modifica datos.
              </li>
              <li className="flex gap-2">
                <Lock size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
                Respeta los permisos por zona de cada gerente.
              </li>
              <li className="flex gap-2">
                <Database size={14} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
                Cada respuesta muestra la consulta y sus fuentes.
              </li>
            </ul>
          </Lateral>
        </aside>
      </div>
    </>
  )
}
