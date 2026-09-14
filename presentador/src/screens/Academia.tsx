import { useState } from 'react'
import { ArrowRight, CheckCircle2, Flame, Lock, ShieldCheck, Target, Trophy, Zap } from 'lucide-react'
import { BarraProgreso, ChipVencimiento, IconoCurso, IconoDeInsignia, Quiz, siguientePaso } from '../components/academia'
import { iniciales } from '../components/MenuCuenta'
import { VideoPortada } from '../components/Medio'
import { Sheet } from '../components/Sheet'
import { EncabezadoPantalla } from '../components/ui'
import { cursos, desafioSemanal, equipo, insignias, XP } from '../data/academia'
import { progresoVacio, semanaActual, useAcademia } from '../state/academia'
import { useDemo } from '../state/demo'
import { useSesion } from '../state/sesion'

export function Academia() {
  const { estado, nivel, responderDesafio, setNombreEnRanking } = useAcademia()
  const { apm } = useDemo()
  const { sesion } = useSesion()
  const [desafioAbierto, setDesafioAbierto] = useState(false)
  const nombre = sesion?.nombre ?? apm.nombre

  const ordenados = [...cursos].sort((a, b) => {
    const ca = Boolean(estado.progreso[a.id]?.certificado)
    const cb = Boolean(estado.progreso[b.id]?.certificado)
    if (ca !== cb) return ca ? 1 : -1
    return (estado.vencimientos[a.id] ?? 0) - (estado.vencimientos[b.id] ?? 0)
  })
  const enCurso = ordenados.find((c) => !estado.progreso[c.id]?.certificado) ?? null
  const desafioHecho = estado.desafio?.semana === semanaActual()
  const ranking = [...equipo.map((p) => ({ ...p, vos: false })), { nombre: estado.nombreEnRanking ? nombre : 'Vos', xp: estado.xp, vos: true }].sort((a, b) => b.xp - a.xp)
  const miPosicion = ranking.findIndex((r) => r.vos) + 1

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Capacitación a distancia"
        titulo="Academia"
        descripcion="Cursos que asigna el laboratorio antes de salir a visitar. Completá las lecciones y aprobá la evaluación para certificarte en cada producto."
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-6">
          {enCurso ? (
            (() => {
              const p = estado.progreso[enCurso.id] ?? progresoVacio
              const paso = siguientePaso(enCurso, p)
              const hechas = p.lecciones.length
              const total = enCurso.lecciones.length + 1
              const destino = paso.tipo === 'leccion' ? paso.leccion.id : 'evaluacion'
              return (
                <section aria-label="Continuar capacitación" className="animate-entrar relative overflow-hidden rounded-2xl bg-ink text-white">
                  <VideoPortada
                    nombre={enCurso.medio}
                    modo="unaVez"
                    className="absolute inset-y-0 right-0 hidden w-[46%] md:block [mask-image:linear-gradient(to_right,transparent,black_45%)]"
                  />
                  <div className="relative p-5 md:p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <span className="eyebrow text-white/60">{hechas > 0 ? 'Seguí donde dejaste' : 'Empezá tu próxima capacitación'}</span>
                      <ChipVencimiento progreso={p} vencimiento={estado.vencimientos[enCurso.id] ?? 0} />
                    </div>
                    <h2 className="mt-3 text-[24px] leading-tight font-semibold">{enCurso.titulo}</h2>
                    <p className="mt-1 text-[15px] text-white/70">
                      {paso.tipo === 'leccion' ? `Próxima lección: ${paso.leccion.titulo} · ${paso.leccion.minutos} min` : 'Te falta la evaluación final'}
                    </p>
                    <div className="mt-5 flex items-center gap-3">
                      <BarraProgreso oscuro valor={hechas / total} etiqueta={`Progreso de ${enCurso.titulo}`} className="flex-1" />
                      <span className="num text-[13px] text-white/70">
                        {hechas}/{total}
                      </span>
                    </div>
                  </div>
                  <div className="relative flex flex-wrap gap-2 px-5 pb-5 md:px-6 md:pb-6">
                    <a href={`#/academia/curso/${enCurso.id}?l=${destino}`} className="btn bg-white text-ink hover:bg-white/90">
                      {paso.tipo === 'leccion' ? (hechas > 0 ? 'Continuar lección' : 'Empezar') : 'Rendir evaluación'}
                      <ArrowRight size={17} aria-hidden="true" />
                    </a>
                    <span className="inline-flex items-center gap-1.5 px-2 text-[13px] text-white/60">
                      <Zap size={14} aria-hidden="true" />
                      +{paso.tipo === 'leccion' ? XP.leccion : XP.aprobado} XP
                    </span>
                  </div>
                </section>
              )
            })()
          ) : (
            <section className="card flex items-center gap-4 p-5">
              <CheckCircle2 size={28} aria-hidden="true" className="text-ok" />
              <div>
                <h2 className="text-[18px] font-semibold text-ink">Estás al día con tus capacitaciones</h2>
                <p className="text-[14px] text-ink-3">Cuando el laboratorio asigne un curso nuevo, aparece acá.</p>
              </div>
            </section>
          )}

          <section aria-labelledby="titulo-cursos">
            <h2 id="titulo-cursos" className="mb-3 text-[18px] font-semibold text-ink">
              Cursos asignados
            </h2>
            <ul className="flex flex-col gap-3">
              {ordenados.map((c) => {
                const p = estado.progreso[c.id] ?? progresoVacio
                const paso = siguientePaso(c, p)
                const hechas = p.lecciones.length
                const total = c.lecciones.length + 1
                const ultimo = p.intentos[p.intentos.length - 1]
                return (
                  <li key={c.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:p-5">
                    <div className="flex min-w-0 flex-1 gap-4">
                      <IconoCurso curso={c} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="eyebrow">{c.categoria}</span>
                          {c.obligatorio && <span className="chip">Obligatorio</span>}
                        </div>
                        <h3 className="mt-1 text-[17px] leading-snug font-semibold text-ink">{c.titulo}</h3>
                        <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-3">{c.descripcion}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <ChipVencimiento progreso={p} vencimiento={estado.vencimientos[c.id] ?? 0} />
                          {ultimo && (
                            <span className="chip">
                              Última nota <span className="num">{Math.round(ultimo.puntaje * 100)}%</span>
                            </span>
                          )}
                        </div>
                        {!p.certificado && (
                          <div className="mt-3 flex items-center gap-3">
                            <BarraProgreso valor={hechas / total} etiqueta={`Progreso de ${c.titulo}`} className="flex-1" />
                            <span className="num text-[12px] text-ink-3">
                              {hechas}/{total}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <a
                      href={`#/academia/curso/${c.id}${paso.tipo === 'leccion' ? `?l=${paso.leccion.id}` : `?l=evaluacion`}`}
                      className={p.certificado ? 'btn-secondary sm:self-center' : 'btn-primary sm:self-center'}
                    >
                      {p.certificado ? 'Ver certificado' : hechas > 0 ? 'Continuar' : 'Empezar'}
                    </a>
                  </li>
                )
              })}
            </ul>
          </section>

          <section aria-labelledby="titulo-desafio" className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2">
              <Target size={22} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id="titulo-desafio" className="text-[17px] font-semibold text-ink">
                Desafío de la semana
              </h2>
              <p className="text-[14px] text-ink-3">
                {desafioHecho
                  ? `Respondiste ${estado.desafio?.aciertos ?? 0} de ${desafioSemanal.length} bien. El lunes hay uno nuevo.`
                  : `${desafioSemanal.length} preguntas rápidas de repaso · hasta +${desafioSemanal.length * XP.desafioAcierto} XP`}
              </p>
            </div>
            <button type="button" className={desafioHecho ? 'btn-secondary' : 'btn-primary'} onClick={() => setDesafioAbierto(true)} disabled={desafioHecho}>
              {desafioHecho ? 'Completado' : 'Responder'}
            </button>
          </section>
        </div>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section aria-labelledby="titulo-nivel" className="card p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="eyebrow">Tu nivel</div>
                <h2 id="titulo-nivel" className="mt-1 text-[24px] leading-tight font-semibold text-ink">
                  {nivel.actual.nombre}
                </h2>
              </div>
              <span className="chip min-h-8 border-transparent bg-ink px-2.5 text-[13px] text-white">
                <Zap size={14} aria-hidden="true" />
                <span className="num">{estado.xp}</span> XP
              </span>
            </div>
            <BarraProgreso valor={nivel.progreso} etiqueta="Progreso al siguiente nivel" className="mt-4" />
            <p className="mt-2 text-[13px] text-ink-3">
              {nivel.siguiente ? (
                <>
                  Te faltan <span className="num text-ink">{nivel.faltan}</span> XP para {nivel.siguiente.nombre}
                </>
              ) : (
                'Llegaste al nivel más alto'
              )}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-sunken p-3">
                <Flame size={18} aria-hidden="true" className="text-warn" />
                <div className="num mt-1.5 text-[20px] font-medium text-ink">{estado.racha.semanas}</div>
                <div className="text-[12px] text-ink-3">semanas seguidas</div>
              </div>
              <div className="rounded-xl bg-sunken p-3">
                <Trophy size={18} aria-hidden="true" className="text-ink-2" />
                <div className="num mt-1.5 text-[20px] font-medium text-ink">
                  {miPosicion}
                  <span className="text-ink-3">/{ranking.length}</span>
                </div>
                <div className="text-[12px] text-ink-3">en tu equipo</div>
              </div>
            </div>
          </section>

          <section aria-labelledby="titulo-insignias" className="card p-5">
            <div className="flex items-baseline justify-between gap-3">
              <h2 id="titulo-insignias" className="text-[16px] font-semibold text-ink">
                Insignias
              </h2>
              <span className="num text-[13px] text-ink-3">
                {estado.insignias.length}/{insignias.length}
              </span>
            </div>
            <ul className="mt-3 grid grid-cols-3 gap-2">
              {insignias.map((i) => {
                const ganada = estado.insignias.includes(i.id)
                return (
                  <li key={i.id} className="flex flex-col items-center gap-1.5 rounded-xl p-2 text-center" title={i.descripcion}>
                    <span className={`relative flex size-12 items-center justify-center rounded-full ${ganada ? 'bg-ink text-white' : 'bg-sunken text-ink-3'}`}>
                      <IconoDeInsignia icono={i.icono} size={20} />
                      {!ganada && (
                        <span className="absolute -right-0.5 -bottom-0.5 flex size-5 items-center justify-center rounded-full border-2 border-surface bg-line-2 text-ink-2">
                          <Lock size={10} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className={`text-[12px] leading-tight font-medium ${ganada ? 'text-ink' : 'text-ink-3'}`}>{i.nombre}</span>
                    <span className="sr-only">
                      {ganada ? 'Obtenida' : 'Bloqueada'}: {i.descripcion}
                    </span>
                  </li>
                )
              })}
            </ul>
          </section>

          <section aria-labelledby="titulo-ranking" className="card p-5">
            <h2 id="titulo-ranking" className="text-[16px] font-semibold text-ink">
              Ranking de formación · {apm.zona}
            </h2>
            <ol className="mt-3 flex flex-col gap-1">
              {ranking.map((r, i) => (
                <li key={r.nombre + i} className={`flex items-center gap-3 rounded-xl px-2.5 py-2 ${r.vos ? 'bg-sunken' : ''}`}>
                  <span className="num w-5 text-center text-[13px] text-ink-3">{i + 1}</span>
                  <span aria-hidden="true" className={`flex size-8 items-center justify-center rounded-full text-[12px] font-semibold ${r.vos ? 'bg-ink text-white' : 'bg-sunken text-ink-2'}`}>
                    {r.vos && !estado.nombreEnRanking ? 'V' : iniciales(r.nombre)}
                  </span>
                  <span className={`min-w-0 flex-1 truncate text-[14px] ${r.vos ? 'font-semibold text-ink' : 'text-ink-2'}`}>
                    {r.nombre}
                    {r.vos && estado.nombreEnRanking && ' (vos)'}
                  </span>
                  <span className="num text-[13px] text-ink-2">{r.xp}</span>
                </li>
              ))}
            </ol>
            <label className="mt-4 flex min-h-11 cursor-pointer items-center justify-between gap-4 border-t border-line pt-3">
              <span className="text-[13px] text-ink-2">Mostrar mi nombre al equipo</span>
              <input type="checkbox" role="switch" name="nombre-ranking" checked={estado.nombreEnRanking} onChange={(e) => setNombreEnRanking(e.target.checked)} className="peer sr-only" />
              <span
                aria-hidden="true"
                className="relative h-7 w-12 shrink-0 rounded-full bg-line-2 transition-colors duration-200 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-5"
              />
            </label>
          </section>

          <p className="flex items-start gap-2 px-1 text-[12px] leading-relaxed text-ink-3">
            <ShieldCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
            Los puntos premian la formación. No se vinculan con ventas, prescripciones ni incentivos económicos.
          </p>
        </aside>
      </div>

      <Sheet abierto={desafioAbierto} onCerrar={() => setDesafioAbierto(false)} titulo="Desafío de la semana" subtitulo={<span className="eyebrow">Repaso rápido</span>} ancho="520px">
        <Quiz preguntas={desafioSemanal} onFinalizar={(aciertos) => responderDesafio(aciertos)} />
      </Sheet>
    </>
  )
}
