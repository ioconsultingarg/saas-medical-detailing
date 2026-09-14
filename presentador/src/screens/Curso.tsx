import { useState } from 'react'
import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, Box, CheckCircle2, ClipboardCheck, Lock, MessagesSquare, PlayCircle, Zap, type LucideIcon } from 'lucide-react'
import { BarraProgreso, ChipVencimiento, Credencial, IconoCurso, Quiz, siguientePaso } from '../components/academia'
import { cursoPorId, UMBRAL_APROBACION, XP, type Leccion, type TipoLeccion } from '../data/academia'
import { recursos } from '../data/recursos'
import { fechaCorta } from '../lib/formato'
import { ir } from '../lib/ruta'
import { RecursoContenido } from '../recursos/RecursoContenido'
import { progresoVacio, useAcademia } from '../state/academia'
import { useDemo } from '../state/demo'
import { useSesion } from '../state/sesion'

const tipos: Record<TipoLeccion, { etiqueta: string; Icono: LucideIcon }> = {
  video: { etiqueta: 'Video', Icono: PlayCircle },
  lectura: { etiqueta: 'Lectura', Icono: BookOpen },
  modelo3d: { etiqueta: 'Modelo 3D', Icono: Box },
  objeciones: { etiqueta: 'Práctica', Icono: MessagesSquare },
}

function TarjetaObjecion({ objecion, respuesta, referencia }: { objecion: string; respuesta: string; referencia: string }) {
  const [abierta, setAbierta] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setAbierta((v) => !v)}
      aria-expanded={abierta}
      className={`press flex min-h-44 w-full cursor-pointer flex-col items-start rounded-2xl border-2 p-5 text-left ${abierta ? 'border-ink bg-surface' : 'border-line bg-sunken hover:border-line-2'}`}
    >
      <span className="eyebrow">{abierta ? 'Respuesta con evidencia' : 'Objeción del médico'}</span>
      {abierta ? (
        <span className="animate-entrar mt-2 flex flex-col gap-3">
          <span className="text-[15px] leading-relaxed text-ink">{respuesta}</span>
          <span className="text-[12px] text-ink-3">{referencia}</span>
        </span>
      ) : (
        <>
          <span className="mt-2 text-[17px] leading-snug font-semibold text-ink">{objecion}</span>
          <span className="mt-auto pt-4 text-[13px] font-medium text-ink-3">Tocá para ver la respuesta</span>
        </>
      )}
    </button>
  )
}

function ContenidoLeccion({ leccion }: { leccion: Leccion }) {
  if ((leccion.tipo === 'video' || leccion.tipo === 'modelo3d') && leccion.recursoId && recursos[leccion.recursoId]) {
    return <RecursoContenido recurso={recursos[leccion.recursoId]} />
  }
  if (leccion.tipo === 'lectura') {
    return (
      <div className="flex flex-col gap-4">
        {leccion.intro && <p className="text-[16px] leading-relaxed text-ink-2">{leccion.intro}</p>}
        <ol className="grid gap-3 sm:grid-cols-2">
          {leccion.puntos?.map((p, i) => (
            <li key={p.titulo} className="rounded-2xl border border-line p-5">
              <span className="num text-[13px] text-ink-3">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-2 text-[18px] leading-snug font-semibold text-ink">{p.titulo}</h3>
              <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-4">
      {leccion.intro && <p className="text-[16px] leading-relaxed text-ink-2">{leccion.intro}</p>}
      <div className="grid gap-3 md:grid-cols-2">
        {leccion.tarjetas?.map((t) => (
          <TarjetaObjecion key={t.objecion} {...t} />
        ))}
      </div>
    </div>
  )
}

export function Curso({ cursoId, leccionId }: { cursoId: string; leccionId?: string }) {
  const { estado, completarLeccion, registrarEvaluacion } = useAcademia()
  const { apm } = useDemo()
  const { sesion } = useSesion()
  const [rindiendo, setRindiendo] = useState(false)
  const curso = cursoPorId[cursoId]

  if (!curso) {
    return (
      <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-12 text-center">
        <h1 className="text-[20px] font-semibold text-ink">No encontramos ese curso</h1>
        <p className="text-[14px] text-ink-3">Puede que el laboratorio lo haya dado de baja.</p>
        <a href="#/academia" className="btn-primary mt-2">
          Volver a la Academia
        </a>
      </div>
    )
  }

  const progreso = estado.progreso[cursoId] ?? progresoVacio
  const paso = siguientePaso(curso, progreso)
  const actualId = leccionId ?? (paso.tipo === 'leccion' ? paso.leccion.id : 'evaluacion')
  const leccion = curso.lecciones.find((l) => l.id === actualId) ?? null
  const todasHechas = curso.lecciones.every((l) => progreso.lecciones.includes(l.id))
  const total = curso.lecciones.length + 1
  const hechos = progreso.lecciones.length + (progreso.certificado ? 1 : 0)
  const nombre = sesion?.nombre ?? apm.nombre
  const ultimo = progreso.intentos[progreso.intentos.length - 1]

  function irA(id: string) {
    ir(`/academia/curso/${cursoId}?l=${id}`)
  }

  function completarYSeguir(l: Leccion) {
    completarLeccion(cursoId, l.id)
    const indice = curso.lecciones.findIndex((x) => x.id === l.id)
    const siguiente = curso.lecciones.slice(indice + 1).find((x) => !progreso.lecciones.includes(x.id) && x.id !== l.id)
    irA(siguiente?.id ?? 'evaluacion')
  }

  return (
    <div className="pt-6 md:pt-8">
      <a href="#/academia" className="press mb-3 inline-flex min-h-9 items-center gap-1 rounded-lg text-[14px] font-medium text-ink-3 hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" />
        Academia
      </a>

      <header className="flex flex-wrap items-start gap-4 pb-6">
        <IconoCurso curso={curso} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="eyebrow">{curso.categoria}</span>
            <ChipVencimiento progreso={progreso} vencimiento={estado.vencimientos[cursoId] ?? 0} />
          </div>
          <h1 className="mt-1.5 text-[26px] leading-[1.1] font-semibold text-ink md:text-[32px]">{curso.titulo}</h1>
          <p className="mt-1.5 text-[14px] text-ink-3">Asignado por {curso.asignadoPor}</p>
          <div className="mt-4 flex max-w-md items-center gap-3">
            <BarraProgreso valor={hechos / total} etiqueta="Progreso del curso" className="flex-1" />
            <span className="num text-[13px] text-ink-3">
              {hechos}/{total}
            </span>
          </div>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <nav aria-label="Contenido del curso" className="lg:sticky lg:top-24 lg:self-start">
          <ol className="card flex flex-col gap-1 p-2">
            {curso.lecciones.map((l, i) => {
              const hecha = progreso.lecciones.includes(l.id)
              const actual = l.id === actualId
              const { etiqueta, Icono } = tipos[l.tipo]
              return (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => irA(l.id)}
                    aria-current={actual ? 'step' : undefined}
                    className={`press flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left ${actual ? 'bg-ink text-white' : 'hover:bg-sunken'}`}
                  >
                    <span
                      className={`num flex size-8 shrink-0 items-center justify-center rounded-full text-[12px] ${
                        hecha ? (actual ? 'bg-white text-ok' : 'bg-ok-soft text-ok') : actual ? 'bg-white/15 text-white' : 'bg-sunken text-ink-3'
                      }`}
                    >
                      {hecha ? <CheckCircle2 size={16} aria-hidden="true" /> : i + 1}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block truncate text-[14px] font-semibold ${actual ? 'text-white' : 'text-ink'}`}>{l.titulo}</span>
                      <span className={`flex items-center gap-1.5 text-[12px] ${actual ? 'text-white/65' : 'text-ink-3'}`}>
                        <Icono size={12} aria-hidden="true" />
                        {etiqueta} · {l.minutos} min
                        {hecha && <span className="sr-only">, completada</span>}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
            <li className="mt-1 border-t border-line pt-1">
              <button
                type="button"
                onClick={() => irA('evaluacion')}
                aria-current={actualId === 'evaluacion' ? 'step' : undefined}
                className={`press flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left ${actualId === 'evaluacion' ? 'bg-ink text-white' : 'hover:bg-sunken'}`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full ${
                    progreso.certificado ? 'bg-ok-soft text-ok' : actualId === 'evaluacion' ? 'bg-white/15 text-white' : 'bg-sunken text-ink-3'
                  }`}
                >
                  {progreso.certificado ? <BadgeCheck size={16} aria-hidden="true" /> : todasHechas ? <ClipboardCheck size={16} aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-[14px] font-semibold ${actualId === 'evaluacion' ? 'text-white' : 'text-ink'}`}>
                    {progreso.certificado ? 'Certificado' : 'Evaluación final'}
                  </span>
                  <span className={`block text-[12px] ${actualId === 'evaluacion' ? 'text-white/65' : 'text-ink-3'}`}>
                    {curso.evaluacion.length} preguntas · aprobás con {Math.round(UMBRAL_APROBACION * 100)}%
                  </span>
                </span>
              </button>
            </li>
          </ol>
        </nav>

        <section aria-labelledby="titulo-panel" className="card min-w-0 p-5 sm:p-6">
          {leccion ? (
            <>
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="eyebrow">
                    {tipos[leccion.tipo].etiqueta} · {leccion.minutos} min
                  </div>
                  <h2 id="titulo-panel" className="mt-1 text-[22px] leading-tight font-semibold text-ink">
                    {leccion.titulo}
                  </h2>
                </div>
                {progreso.lecciones.includes(leccion.id) && (
                  <span className="chip border-transparent bg-ok-soft text-ok">
                    <CheckCircle2 size={13} aria-hidden="true" />
                    Completada
                  </span>
                )}
              </div>

              <ContenidoLeccion leccion={leccion} />

              <div className="mt-6 flex flex-wrap items-center justify-end gap-3 border-t border-line pt-5">
                {progreso.lecciones.includes(leccion.id) ? (
                  <button type="button" className="btn-primary" onClick={() => irA(curso.lecciones[curso.lecciones.indexOf(leccion) + 1]?.id ?? 'evaluacion')}>
                    Siguiente
                    <ArrowRight size={17} aria-hidden="true" />
                  </button>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-3">
                      <Zap size={14} aria-hidden="true" />+{XP.leccion} XP
                    </span>
                    <button type="button" className="btn-primary" onClick={() => completarYSeguir(leccion)}>
                      Completar lección
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  </>
                )}
              </div>
            </>
          ) : progreso.certificado && !rindiendo ? (
            <div className="flex flex-col gap-5">
              <h2 id="titulo-panel" className="sr-only">
                Certificado
              </h2>
              <Credencial curso={curso} codigo={progreso.certificado.codigo} fecha={progreso.certificado.fecha} nombre={nombre} />
              {ultimo && (
                <p className="text-[14px] text-ink-2">
                  Aprobaste con <span className="num font-medium text-ink">{Math.round(ultimo.puntaje * 100)}%</span> el {fechaCorta(progreso.certificado.fecha)}. Podés repasar
                  las lecciones cuando quieras.
                </p>
              )}
            </div>
          ) : !todasHechas ? (
            <div className="flex flex-col items-center gap-3 px-4 py-12 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-sunken text-ink-3">
                <Lock size={22} aria-hidden="true" />
              </span>
              <h2 id="titulo-panel" className="text-[20px] font-semibold text-ink">
                La evaluación se habilita al terminar las lecciones
              </h2>
              <p className="max-w-[44ch] text-[14px] text-ink-3">
                Te {curso.lecciones.length - progreso.lecciones.length === 1 ? 'falta 1 lección' : `faltan ${curso.lecciones.length - progreso.lecciones.length} lecciones`}.
              </p>
              {paso.tipo === 'leccion' && (
                <button type="button" className="btn-primary mt-2" onClick={() => irA(paso.leccion.id)}>
                  Ir a {paso.leccion.titulo}
                </button>
              )}
            </div>
          ) : !rindiendo ? (
            <div className="flex flex-col items-start gap-4">
              <span className="flex size-14 items-center justify-center rounded-full bg-sunken text-ink-2">
                <ClipboardCheck size={24} aria-hidden="true" />
              </span>
              <h2 id="titulo-panel" className="text-[24px] leading-tight font-semibold text-ink">
                Evaluación final
              </h2>
              <ul className="flex flex-col gap-1.5 text-[15px] text-ink-2">
                <li>
                  <span className="num">{curso.evaluacion.length}</span> preguntas de opción múltiple, con la explicación de cada respuesta
                </li>
                <li>Aprobás con {Math.round(UMBRAL_APROBACION * 100)}% y recibís tu certificación</li>
                <li>Si no llegás, repasás lo que falló y volvés a intentar</li>
              </ul>
              {ultimo && !ultimo.aprobado && (
                <p className="rounded-xl bg-warn-soft px-4 py-3 text-[14px] text-ink-2">
                  Último intento: <span className="num font-medium">{Math.round(ultimo.puntaje * 100)}%</span>
                </p>
              )}
              <button type="button" className="btn-primary mt-2" onClick={() => setRindiendo(true)}>
                Comenzar evaluación
                <ArrowRight size={17} aria-hidden="true" />
              </button>
            </div>
          ) : (
            <>
              <h2 id="titulo-panel" className="sr-only">
                Evaluación final
              </h2>
              <Quiz
                preguntas={curso.evaluacion}
                umbral={UMBRAL_APROBACION}
                onFinalizar={(aciertos, cantidad) => registrarEvaluacion(cursoId, aciertos, cantidad)}
                pieResultado={(r) =>
                  r.aprobado && estado.progreso[cursoId]?.certificado ? (
                    <div className="flex flex-col gap-3">
                      <Credencial curso={curso} codigo={estado.progreso[cursoId]!.certificado!.codigo} fecha={estado.progreso[cursoId]!.certificado!.fecha} nombre={nombre} />
                      <a href="#/academia" className="btn-secondary self-start">
                        Volver a la Academia
                      </a>
                    </div>
                  ) : null
                }
              />
            </>
          )}
        </section>
      </div>
    </div>
  )
}
