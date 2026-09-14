import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import {
  Award,
  BadgeCheck,
  CheckCircle2,
  Flame,
  Medal,
  RotateCcw,
  ShieldCheck,
  Target,
  Timer,
  XCircle,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { DIA, type Curso, type IconoInsignia, type Leccion, type Pregunta, type ResultadoQuiz } from '../data/academia'
import { fechaCorta } from '../lib/formato'
import type { ProgresoCurso } from '../state/academia'
import { Anillo, MonogramaProducto } from './ui'

const iconos: Record<IconoInsignia, LucideIcon> = { award: Award, target: Target, flame: Flame, medal: Medal, zap: Zap, timer: Timer }

export function IconoDeInsignia({ icono, size = 18 }: { icono: IconoInsignia; size?: number }) {
  const Icono = iconos[icono]
  return <Icono size={size} aria-hidden="true" />
}

export function IconoCurso({ curso, size = 44 }: { curso: Curso; size?: number }) {
  return (
    <span className="flex shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-2" style={{ width: size, height: size }}>
      {curso.productoId ? <MonogramaProducto id={curso.productoId} size={Math.round(size * 0.55)} /> : <ShieldCheck size={Math.round(size * 0.45)} aria-hidden="true" />}
    </span>
  )
}

export function BarraProgreso({ valor, etiqueta, oscuro = false, className = '' }: { valor: number; etiqueta: string; oscuro?: boolean; className?: string }) {
  const pct = Math.round(Math.max(0, Math.min(1, valor)) * 100)
  return (
    <div
      role="progressbar"
      aria-label={etiqueta}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={pct}
      className={`h-2 overflow-hidden rounded-full ${oscuro ? 'bg-white/15' : 'bg-sunken'} ${className}`}
    >
      <div className={`h-full rounded-full ${oscuro ? 'bg-white' : 'bg-ink'}`} style={{ width: `${pct}%`, transition: 'width 500ms var(--ease-fluid)' }} />
    </div>
  )
}

export function ChipVencimiento({ progreso, vencimiento }: { progreso?: ProgresoCurso; vencimiento: number }) {
  if (progreso?.certificado) {
    return (
      <span className="chip border-transparent bg-ok-soft text-ok">
        <BadgeCheck size={13} aria-hidden="true" />
        Certificado · vence {fechaCorta(progreso.certificado.fecha + 365 * DIA)}
      </span>
    )
  }
  const dias = Math.ceil((vencimiento - Date.now()) / DIA)
  return (
    <span className={`chip ${dias <= 3 ? 'border-transparent bg-warn-soft text-warn' : ''}`}>
      <Timer size={13} aria-hidden="true" />
      {dias <= 0 ? 'Vencido' : dias === 1 ? 'Vence mañana' : `Vence en ${dias} días`}
    </span>
  )
}

export type Paso = { tipo: 'leccion'; leccion: Leccion } | { tipo: 'evaluacion' } | { tipo: 'certificado' }

export function siguientePaso(curso: Curso, progreso: ProgresoCurso): Paso {
  if (progreso.certificado) return { tipo: 'certificado' }
  const pendiente = curso.lecciones.find((l) => !progreso.lecciones.includes(l.id))
  return pendiente ? { tipo: 'leccion', leccion: pendiente } : { tipo: 'evaluacion' }
}

export function Credencial({ curso, codigo, fecha, nombre }: { curso: Curso; codigo: string; fecha: number; nombre: string }) {
  return (
    <div className="animate-entrar relative overflow-hidden rounded-3xl bg-ink p-6 text-white sm:p-7">
      <div aria-hidden="true" className="absolute -top-16 -right-16 size-48 rounded-full border border-white/10" />
      <div aria-hidden="true" className="absolute -top-6 -right-6 size-28 rounded-full border border-white/10" />
      <div className="relative flex items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 text-[13px] font-semibold text-[#34d399]">
          <BadgeCheck size={18} aria-hidden="true" />
          Certificación vigente
        </span>
        <span className="flex size-10 items-center justify-center rounded-xl bg-white/10">
          {curso.productoId ? <MonogramaProducto id={curso.productoId} size={22} /> : <ShieldCheck size={20} aria-hidden="true" />}
        </span>
      </div>
      <p className="relative mt-6 text-[13px] text-white/60">Se certifica que</p>
      <p className="relative text-[22px] leading-tight font-semibold">{nombre}</p>
      <p className="relative mt-2 max-w-[40ch] text-[15px] leading-relaxed text-white/80">
        aprobó la capacitación <strong className="text-white">{curso.titulo}</strong>
      </p>
      <dl className="relative mt-6 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        {[
          { t: 'Código', v: codigo },
          { t: 'Emitida', v: fechaCorta(fecha) },
          { t: 'Vence', v: fechaCorta(fecha + 365 * DIA) },
        ].map((x) => (
          <div key={x.t} className="min-w-0">
            <dt className="text-[11px] tracking-[0.06em] text-white/50 uppercase">{x.t}</dt>
            <dd className="num mt-1 truncate text-[13px] text-white" translate="no">
              {x.v}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

const letras = ['A', 'B', 'C', 'D', 'E']

interface PropsQuiz {
  preguntas: Pregunta[]
  /** nota mínima (0–1); sin umbral el cuestionario no aprueba ni desaprueba */
  umbral?: number
  onFinalizar: (aciertos: number, total: number) => ResultadoQuiz
  pieResultado?: (r: ResultadoQuiz) => ReactNode
}

/** Cuestionario de validación: una pregunta por vez, con devolución inmediata y explicación */
export function Quiz({ preguntas, umbral, onFinalizar, pieResultado }: PropsQuiz) {
  const [indice, setIndice] = useState(0)
  const [elegida, setElegida] = useState<number | null>(null)
  const [comprobada, setComprobada] = useState(false)
  const [respuestas, setRespuestas] = useState<number[]>([])
  const [resultado, setResultado] = useState<ResultadoQuiz | null>(null)
  const idEnunciado = useId()
  const refResultado = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (resultado) refResultado.current?.focus()
  }, [resultado])

  const pregunta = preguntas[indice]

  function comprobar() {
    if (elegida === null) return
    setComprobada(true)
    setRespuestas((r) => [...r, elegida])
  }

  function avanzar() {
    if (indice < preguntas.length - 1) {
      setIndice((i) => i + 1)
      setElegida(null)
      setComprobada(false)
      return
    }
    const aciertos = respuestas.filter((r, i) => r === preguntas[i].correcta).length
    setResultado(onFinalizar(aciertos, preguntas.length))
  }

  function reintentar() {
    setIndice(0)
    setElegida(null)
    setComprobada(false)
    setRespuestas([])
    setResultado(null)
  }

  if (resultado) {
    const aciertos = respuestas.filter((r, i) => r === preguntas[i].correcta).length
    const pct = Math.round((aciertos / preguntas.length) * 100)
    const incorrectas = preguntas.map((p, i) => ({ p, r: respuestas[i] })).filter((x) => x.r !== x.p.correcta)
    const titulo = resultado.aprobado === null ? 'Desafío completado' : resultado.aprobado ? '¡Aprobaste!' : 'Te faltó poco'

    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-5">
          <div className="relative">
            <Anillo valor={aciertos} total={preguntas.length} size={96} grosor={8} color={resultado.aprobado === false ? 'var(--color-warn)' : 'var(--color-ok)'} />
            <span className="num absolute inset-0 flex items-center justify-center text-[22px] font-medium text-ink">{pct}%</span>
          </div>
          <div className="min-w-0 flex-1">
            <h3 ref={refResultado} tabIndex={-1} className="text-[24px] leading-tight font-semibold text-ink outline-none">
              {titulo}
            </h3>
            <p className="mt-1 text-[15px] text-ink-2">
              <span className="num">{aciertos}</span> de <span className="num">{preguntas.length}</span> respuestas correctas
              {umbral !== undefined && resultado.aprobado === false && <> · necesitás {Math.round(umbral * 100)}% para aprobar</>}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {resultado.xpGanado > 0 && (
                <span className="chip border-transparent bg-ink text-white">
                  <Zap size={13} aria-hidden="true" />
                  <span className="num">+{resultado.xpGanado}</span> XP
                </span>
              )}
              {resultado.nuevasInsignias.map((i) => (
                <span key={i.id} className="chip animate-entrar border-transparent bg-ok-soft text-ok">
                  <IconoDeInsignia icono={i.icono} size={13} />
                  {i.nombre}
                </span>
              ))}
            </div>
          </div>
        </div>

        {pieResultado?.(resultado)}

        {incorrectas.length > 0 && (
          <section aria-label="Repaso de respuestas incorrectas" className="flex flex-col gap-2">
            <h4 className="text-[15px] font-semibold text-ink">Para repasar</h4>
            {incorrectas.map(({ p, r }) => (
              <div key={p.id} className="rounded-xl border border-line p-4">
                <p className="text-[15px] font-medium text-ink">{p.enunciado}</p>
                <p className="mt-2 flex items-start gap-2 text-[14px] text-bad">
                  <XCircle size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  Respondiste: {p.opciones[r]}
                </p>
                <p className="mt-1 flex items-start gap-2 text-[14px] text-ok">
                  <CheckCircle2 size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
                  Correcta: {p.opciones[p.correcta]}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-ink-3">{p.explicacion}</p>
              </div>
            ))}
          </section>
        )}

        {resultado.aprobado === false && (
          <button type="button" className="btn-primary self-start" onClick={reintentar}>
            <RotateCcw size={16} aria-hidden="true" />
            Volver a intentar
          </button>
        )}
      </div>
    )
  }

  const acerto = comprobada && elegida === pregunta.correcta

  return (
    <div className="flex flex-col gap-5">
      <div>
        <div className="flex items-center justify-between gap-3 text-[13px] text-ink-3">
          <span>
            Pregunta <span className="num text-ink">{indice + 1}</span> de <span className="num">{preguntas.length}</span>
          </span>
          {umbral !== undefined && <span>Aprobás con {Math.round(umbral * 100)}%</span>}
        </div>
        <ol aria-hidden="true" className="mt-2 flex gap-1.5">
          {preguntas.map((p, i) => (
            <li
              key={p.id}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${
                i < respuestas.length ? (respuestas[i] === preguntas[i].correcta ? 'bg-ok' : 'bg-bad') : i === indice ? 'bg-ink' : 'bg-sunken'
              }`}
            />
          ))}
        </ol>
      </div>

      <h3 id={idEnunciado} className="text-[20px] leading-snug font-semibold text-ink">
        {pregunta.enunciado}
      </h3>

      <div role="radiogroup" aria-labelledby={idEnunciado} className="flex flex-col gap-2">
        {pregunta.opciones.map((opcion, i) => {
          const seleccionada = elegida === i
          const esCorrecta = i === pregunta.correcta
          let estilo = seleccionada ? 'border-ink bg-sunken' : 'border-line bg-surface hover:border-line-2'
          if (comprobada) {
            if (esCorrecta) estilo = 'border-ok bg-ok-soft'
            else if (seleccionada) estilo = 'border-bad bg-bad-soft'
            else estilo = 'border-line bg-surface opacity-60'
          }
          return (
            <button
              key={opcion}
              type="button"
              role="radio"
              aria-checked={seleccionada}
              disabled={comprobada}
              onClick={() => setElegida(i)}
              className={`press flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-[15px] text-ink disabled:cursor-default ${estilo}`}
            >
              <span
                aria-hidden="true"
                className={`num flex size-8 shrink-0 items-center justify-center rounded-lg text-[13px] font-medium ${seleccionada && !comprobada ? 'bg-ink text-white' : 'bg-sunken text-ink-2'}`}
              >
                {comprobada && esCorrecta ? <CheckCircle2 size={17} className="text-ok" /> : comprobada && seleccionada ? <XCircle size={17} className="text-bad" /> : letras[i]}
              </span>
              <span className="min-w-0 flex-1">{opcion}</span>
            </button>
          )
        })}
      </div>

      <div aria-live="polite">
        {comprobada && (
          <div className={`animate-entrar rounded-xl p-4 ${acerto ? 'bg-ok-soft' : 'bg-bad-soft'}`}>
            <p className={`text-[15px] font-semibold ${acerto ? 'text-ok' : 'text-bad'}`}>{acerto ? 'Correcto' : 'No es la respuesta correcta'}</p>
            <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{pregunta.explicacion}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end">
        <button type="button" className="btn-primary min-w-40" onClick={comprobada ? avanzar : comprobar} disabled={!comprobada && elegida === null}>
          {!comprobada ? 'Comprobar' : indice < preguntas.length - 1 ? 'Siguiente pregunta' : 'Ver resultado'}
        </button>
      </div>
    </div>
  )
}
