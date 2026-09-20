import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Clock, MapPin, Navigation, Package, Play, Star } from 'lucide-react'
import { MapaRuta } from '../components/MapaRuta'
import { productos } from '../data/productos'
import { Anillo, ChipProducto, Kpi, NumeroAnimado, Segmentado } from '../components/ui'
import { visitasDelDia } from '../data/agenda'
import { cronometro, distanciaMetros, fechaLarga, hora, minutos } from '../lib/formato'
import { useAhora } from '../lib/tiempo'
import { nombreCorto, useDemo } from '../state/demo'
import type { Visita } from '../types'

/** Ubicación simulada del APM junto al consultorio (la demo no usa el GPS real) */
function posicionSimulada(v: Visita) {
  return { lat: v.lat + 0.00021, lng: v.lng - 0.00017 }
}

export function presentacionSugerida(v: Visita) {
  if (v.productosInteres.length > 1) return v.productosInteres[0] === 'cardio' ? 'p-cardio-breve' : 'p-respira-breve'
  return v.productosInteres[0] === 'cardio' ? 'p-cardio' : 'p-respira'
}

function comoLlegar(v: Visita) {
  return `https://www.google.com/maps/dir/?api=1&destination=${v.lat},${v.lng}`
}

type Filtro = 'todas' | 'pendientes' | 'completadas'

export function Hoy() {
  const { estado, visitaActiva, online, despachar, avisar, apm } = useDemo()
  const [seleccionId, setSeleccionId] = useState<string | null>(null)
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const ahora = useAhora(1000, Boolean(visitaActiva))

  const completadas = visitasDelDia.filter((v) => estado.registros[v.id]?.estado === 'completada')
  const proxima = visitasDelDia.find((v) => !estado.registros[v.id] || estado.registros[v.id].estado === 'pendiente') ?? null
  const destacada = visitaActiva ?? proxima

  const kpis = useMemo(() => {
    const regs = completadas.map((v) => estado.registros[v.id])
    const duraciones = regs.filter((r) => r.checkIn && r.checkOut).map((r) => r.checkOut! - r.checkIn!)
    const calificaciones = regs.map((r) => r.calificacion).filter((c): c is number => typeof c === 'number')
    return {
      medio: duraciones.length ? minutos(duraciones.reduce((a, b) => a + b, 0) / duraciones.length) : 0,
      muestras: Object.values(estado.registros).reduce((a, r) => a + (r.muestras ?? 0), 0),
      receptividad: calificaciones.length ? calificaciones.reduce((a, b) => a + b, 0) / calificaciones.length : 0,
    }
  }, [completadas, estado.registros])

  const visibles = visitasDelDia.filter((v) => {
    const e = estado.registros[v.id]?.estado ?? 'pendiente'
    if (filtro === 'pendientes') return e !== 'completada'
    if (filtro === 'completadas') return e === 'completada'
    return true
  })

  function checkIn(v: Visita) {
    const distancia = distanciaMetros(posicionSimulada(v), v)
    despachar({ tipo: 'checkin', visitaId: v.id, distancia })
    setSeleccionId(v.id)
    avisar(
      online ? `Check-in registrado a ${distancia} m del consultorio` : `Check-in guardado sin conexión · se sincroniza después`,
      online ? 'ok' : 'warn',
    )
  }

  const primerNombre = apm.nombre.split(' ')[0]

  return (
    <div className="pt-6 md:pt-8">
      <header className="flex flex-wrap items-end justify-between gap-x-8 gap-y-6 pb-7">
        <div className="min-w-0">
          <div className="eyebrow mb-2.5 first-letter:uppercase">{fechaLarga()}</div>
          <h1 className="display text-ink">Buen día, {primerNombre}</h1>
          <p className="mt-2.5 text-[16px] text-ink-3">
            {visitasDelDia.length} visitas en {apm.zona}. {completadas.length === visitasDelDia.length ? 'Día completo.' : `Te quedan ${visitasDelDia.length - completadas.length}.`}
          </p>
        </div>

        {/* KPIs del día */}
        <dl className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto lg:min-w-[520px]">
          <div className="card-elevada entra-fila flex items-center gap-3 p-4" style={{ ['--orden' as string]: 0 }}>
            <div className="relative shrink-0">
              <Anillo valor={completadas.length} total={visitasDelDia.length} size={52} grosor={5} />
              <CheckCircle2 size={17} aria-hidden="true" className="absolute inset-0 m-auto text-ink" />
            </div>
            <div className="min-w-0">
              <dt className="kpi-label">Visitas</dt>
              <dd className="kpi-num mt-1.5">
                {completadas.length}
                <span className="text-ink-3">/{visitasDelDia.length}</span>
              </dd>
            </div>
          </div>
          <Kpi
            orden={1}
            etiqueta="Tiempo medio"
            Icono={Clock}
            valor={kpis.medio ? <NumeroAnimado valor={kpis.medio} /> : '—'}
            unidad={kpis.medio ? 'min' : undefined}
          />
          <Kpi orden={2} etiqueta="Muestras" Icono={Package} valor={<NumeroAnimado valor={kpis.muestras} />} unidad="u." />
          <Kpi
            orden={3}
            etiqueta="Receptividad"
            Icono={Star}
            valor={kpis.receptividad ? <NumeroAnimado valor={kpis.receptividad} decimales={1} /> : '—'}
            unidad={kpis.receptividad ? '/ 5' : undefined}
          />
        </dl>
      </header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          {/* Visita destacada: en curso o próxima */}
          {destacada && (
            <section
              aria-label={visitaActiva ? 'Visita en curso' : 'Próxima visita'}
              className={`animate-entrar relative overflow-hidden rounded-2xl ${visitaActiva ? 'bg-ink text-white shadow-(--shadow-float)' : 'card-elevada'}`}
            >
              {!visitaActiva && (
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-0 h-28 opacity-70"
                  style={{ background: `linear-gradient(180deg, ${productos[destacada.productosInteres[0]].tinte}, transparent)` }}
                />
              )}
              <div className="relative p-5 md:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className={`eyebrow ${visitaActiva ? 'text-white/60' : ''}`}>
                    {visitaActiva ? 'En el consultorio' : `Próxima visita · ${destacada.hora}`}
                  </span>
                  {visitaActiva && (
                    <span className="num text-[26px] leading-none font-medium tracking-tight" aria-label="Tiempo transcurrido">
                      {cronometro(ahora - (estado.registros[destacada.id]?.checkIn ?? ahora))}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-[26px] leading-[1.15] font-semibold tracking-[-0.02em] md:text-[30px]">{destacada.medico.nombre}</h2>
                <p className={`mt-1 text-[15px] ${visitaActiva ? 'text-white/70' : 'text-ink-3'}`}>
                  {destacada.medico.especialidad} · {destacada.consultorio} ·{' '}
                  <a href={`#/medicos/${destacada.medicoId}`} className={`font-medium underline underline-offset-2 ${visitaActiva ? 'text-white' : 'text-ink'}`}>
                    Ver ficha
                  </a>
                </p>
                <p className={`mt-3 border-l-2 pl-3 text-[14px] leading-relaxed ${visitaActiva ? 'border-white/25 text-white/85' : 'border-line-2 text-ink-2'}`}>
                  {destacada.nota}
                </p>
              </div>
              <div className="relative flex flex-wrap gap-2 px-5 pb-5 md:px-6 md:pb-6">
                {visitaActiva ? (
                  <>
                    <a href={`#/presentar/${presentacionSugerida(destacada)}`} className="btn bg-white text-ink hover:bg-white/90">
                      <Play size={17} aria-hidden="true" />
                      Presentar
                    </a>
                    <a href="#/stock" className="btn border border-white/20 text-white hover:bg-white/10">
                      <Package size={17} aria-hidden="true" />
                      Muestras
                    </a>
                    <a href="#/cierre" className="btn border border-white/20 text-white hover:bg-white/10">
                      Cerrar visita
                      <ArrowRight size={17} aria-hidden="true" />
                    </a>
                  </>
                ) : (
                  <>
                    <button type="button" className="btn-primary" onClick={() => checkIn(destacada)}>
                      <MapPin size={17} aria-hidden="true" />
                      Hacer check-in
                    </button>
                    <a className="btn-secondary" href={comoLlegar(destacada)} target="_blank" rel="noreferrer">
                      <Navigation size={17} aria-hidden="true" />
                      Cómo llegar
                    </a>
                  </>
                )}
              </div>
            </section>
          )}

          <section aria-labelledby="titulo-agenda">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 id="titulo-agenda" className="text-[18px] font-semibold text-ink">
                Agenda
              </h2>
              <Segmentado<Filtro>
                etiqueta="Filtrar agenda"
                valor={filtro}
                onCambio={setFiltro}
                opciones={[
                  { valor: 'todas', texto: 'Todas' },
                  { valor: 'pendientes', texto: 'Pendientes' },
                  { valor: 'completadas', texto: 'Hechas' },
                ]}
              />
            </div>

            <ol className="flex flex-col gap-2">
              {visibles.map((v, i) => {
                const registro = estado.registros[v.id]
                const e = registro?.estado ?? 'pendiente'
                const seleccionada = seleccionId === v.id
                const n = visitasDelDia.indexOf(v) + 1
                return (
                  <li
                    key={v.id}
                    style={{ ['--orden' as string]: i }}
                    className={`card entra-fila flex gap-4 p-4 transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-px hover:shadow-(--shadow-raised) ${seleccionada ? 'border-ink shadow-(--shadow-float)' : ''}`}
                  >
                    <div className="flex w-12 shrink-0 flex-col items-center gap-1.5">
                      <span className="num text-[15px] font-medium text-ink">{v.hora}</span>
                      <span
                        aria-hidden="true"
                        className={`num flex size-7 items-center justify-center rounded-full border-2 text-[12px] font-medium ${
                          e === 'completada' ? 'border-ok text-ok' : e === 'en_curso' ? 'border-ink bg-ink text-white' : 'border-line-2 text-ink-3'
                        }`}
                      >
                        {e === 'completada' ? '✓' : n}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => setSeleccionId(v.id)}
                        className="-mx-1 -my-0.5 block max-w-full cursor-pointer rounded-md px-1 py-0.5 text-left"
                        aria-label={`Ver ${v.medico.nombre} en el mapa`}
                      >
                        <span className="block truncate text-[16px] font-semibold text-ink">{v.medico.nombre}</span>
                        <span className="block truncate text-[14px] text-ink-3">
                          {v.medico.especialidad} · {v.consultorio}
                        </span>
                      </button>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {v.productosInteres.map((p) => (
                          <ChipProducto key={p} id={p} />
                        ))}
                        {e === 'completada' && registro?.checkIn && registro.checkOut && (
                          <span className="chip border-transparent bg-ok-soft text-ok">
                            {minutos(registro.checkOut - registro.checkIn)} min · {hora(registro.checkOut)}
                          </span>
                        )}
                        {e === 'completada' && registro?.calificacion && (
                          <span className="chip" aria-label={`Receptividad ${registro.calificacion} de 5`}>
                            <Star size={12} aria-hidden="true" className="fill-ink text-ink" />
                            <span className="num">{registro.calificacion}</span>
                          </span>
                        )}
                        {e === 'en_curso' && <span className="chip border-transparent bg-ink text-white">En curso</span>}
                      </div>
                    </div>

                    {e === 'pendiente' && (
                      <button
                        type="button"
                        className="btn-secondary self-center"
                        onClick={() => checkIn(v)}
                        disabled={Boolean(visitaActiva)}
                        title={visitaActiva ? `Cerrá la visita con ${nombreCorto(visitaActiva)} primero` : undefined}
                      >
                        <MapPin size={16} aria-hidden="true" />
                        <span className="hidden sm:inline">Check-in</span>
                        <span className="sr-only sm:hidden">Check-in con {v.medico.nombre}</span>
                      </button>
                    )}
                  </li>
                )
              })}
            </ol>
          </section>
        </div>

        <section aria-label="Mapa de la ruta del día" className="order-first h-[300px] min-w-0 sm:h-[360px] lg:sticky lg:top-24 lg:order-none lg:h-[calc(100dvh-128px)]">
          <MapaRuta
            visitas={visitasDelDia}
            registros={estado.registros}
            seleccionId={seleccionId ?? destacada?.id ?? null}
            posicionApm={destacada ? posicionSimulada(destacada) : null}
            online={online}
            onSeleccionar={setSeleccionId}
          />
          <p className="mt-2 text-[12px] text-ink-3">Ubicación simulada para la demo · la geocerca valida 250 m.</p>
        </section>
      </div>
    </div>
  )
}
