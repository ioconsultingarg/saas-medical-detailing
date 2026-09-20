import { AlertTriangle, AudioLines, CheckCircle2, Clock, ShieldAlert, UserCheck } from 'lucide-react'
import { ChipProducto, EncabezadoPantalla, Kpi, NumeroAnimado } from '../../components/ui'
import { visitasDelDia } from '../../data/agenda'
import { apmPorId, medicoPorId } from '../../data/crm'
import { etiquetaEvento, eventosAdversos, type EstadoEvento, type EventoAdverso } from '../../data/portal'
import { fechaCorta, hora } from '../../lib/formato'
import { useAhora } from '../../lib/tiempo'
import { useDemo } from '../../state/demo'

const estiloEvento: Record<EstadoEvento, string> = {
  nuevo: 'bg-bad-soft text-bad',
  analisis: 'bg-warn-soft text-warn',
  notificado: 'bg-ok-soft text-ok',
}

const PLAZO = 24 * 3600 * 1000

function Reloj({ desde, estado, ahora }: { desde: number; estado: EstadoEvento; ahora: number }) {
  if (estado === 'notificado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-ok">
        <CheckCircle2 size={14} aria-hidden="true" />
        Dentro del plazo
      </span>
    )
  }
  const restante = desde + PLAZO - ahora
  const horas = Math.floor(Math.abs(restante) / 3600000)
  const minutos = Math.floor((Math.abs(restante) % 3600000) / 60000)
  const vencido = restante <= 0
  return (
    <span className={`num inline-flex items-center gap-1.5 text-[13px] font-medium ${vencido ? 'text-bad' : horas < 6 ? 'text-warn' : 'text-ink-2'}`}>
      <Clock size={14} aria-hidden="true" />
      {vencido ? `Vencido hace ${horas} h` : `Quedan ${horas} h ${String(minutos).padStart(2, '0')} min`}
    </span>
  )
}

export function Farmacovigilancia() {
  const { estado, despachar, avisar } = useDemo()
  const ahora = useAhora(30000)

  // los avisos que manda la app de campo entran a esta misma bandeja
  const desdeCampo: EventoAdverso[] = estado.outbox
    .filter((o) => o.tipo === 'farmacovigilancia')
    .map((o) => {
      const visita = visitasDelDia.find((v) => estado.registros[v.id]?.estado !== 'pendiente' && o.resumen.includes(v.medico.nombre.split(' ').slice(-1)[0]))
      const medico = visita ? medicoPorId[visita.medicoId] : null
      return {
        id: o.id,
        fecha: o.creado,
        medico: medico?.nombre ?? 'Médico de la visita en curso',
        apm: apmPorId('apm1').nombre,
        productoId: medico?.productos[0] ?? 'cardio',
        relato: o.resumen.replace('Posible evento adverso notificado · ', '').replace(/[“”]/g, ''),
        origen: 'voz' as const,
        estadoInicial: 'nuevo' as const,
      }
    })

  const eventos = [...desdeCampo, ...eventosAdversos].sort((a, b) => b.fecha - a.fecha)
  const estadoDe = (e: EventoAdverso) => estado.eventos[e.id] ?? e.estadoInicial
  const conteo = (x: EstadoEvento) => eventos.filter((e) => estadoDe(e) === x).length

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Farmacovigilancia"
        descripcion="Todo comentario del médico que pueda ser un evento adverso llega acá, con el reloj de las 24 horas corriendo. La app los detecta incluso cuando el visitador dicta su reporte."
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Sin asignar" Icono={AlertTriangle} valor={<NumeroAnimado valor={conteo('nuevo')} />} detalle="Necesitan un responsable" />
        <Kpi orden={1} etiqueta="En análisis" Icono={UserCheck} valor={<NumeroAnimado valor={conteo('analisis')} />} detalle="Con caso abierto" />
        <Kpi orden={2} etiqueta="Notificados" Icono={CheckCircle2} valor={<NumeroAnimado valor={conteo('notificado')} />} detalle="Reportados a la autoridad" />
        <Kpi orden={3} etiqueta="Detectados por voz" Icono={AudioLines} valor={<NumeroAnimado valor={eventos.filter((e) => e.origen === 'voz').length} />} detalle="Sin que nadie complete un formulario" />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section aria-label="Bandeja de eventos" className="flex flex-col gap-3">
          {eventos.length === 0 ? (
            <p className="card px-5 py-12 text-center text-[14px] text-ink-3">No hay eventos abiertos. Los que detecte la app aparecen acá.</p>
          ) : (
            eventos.map((e, i) => {
              const actual = estadoDe(e)
              return (
                <article key={e.id} className="card-elevada entra-fila p-5" style={{ ['--orden' as string]: i }}>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-[12px] font-semibold ${estiloEvento[actual]}`}>
                      <ShieldAlert size={12} aria-hidden="true" />
                      {etiquetaEvento[actual]}
                    </span>
                    <ChipProducto id={e.productoId} />
                    {e.origen === 'voz' && (
                      <span className="chip border-transparent bg-ia-soft text-ia">
                        <AudioLines size={12} aria-hidden="true" />
                        Detectado en un reporte por voz
                      </span>
                    )}
                    <span className="ml-auto">
                      <Reloj desde={e.fecha} estado={actual} ahora={ahora} />
                    </span>
                  </div>

                  <p className="mt-3 text-[15px] leading-relaxed text-ink">“{e.relato}”</p>

                  <p className="mt-2 text-[13px] text-ink-3">
                    {e.medico} · informado por {e.apm} · <span className="num">{fechaCorta(e.fecha)}</span>, <span className="num">{hora(e.fecha)}</span>
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {actual === 'nuevo' && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          despachar({ tipo: 'evento', id: e.id, estado: 'analisis' })
                          avisar('Caso asignado a Farmacovigilancia', 'info')
                        }}
                      >
                        <UserCheck size={16} aria-hidden="true" />
                        Tomar el caso
                      </button>
                    )}
                    {actual === 'analisis' && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={() => {
                          despachar({ tipo: 'evento', id: e.id, estado: 'notificado' })
                          avisar('Evento notificado a la autoridad sanitaria')
                        }}
                      >
                        <CheckCircle2 size={16} aria-hidden="true" />
                        Marcar como notificado
                      </button>
                    )}
                    {actual === 'notificado' && <span className="text-[13px] text-ink-3">Caso cerrado y archivado con su constancia.</span>}
                  </div>
                </article>
              )
            })
          )}
        </section>

        <aside className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <section className="card p-5">
            <h2 className="text-[15px] font-semibold text-ink">El procedimiento</h2>
            <ol className="mt-3 flex flex-col gap-2.5 text-[13px] leading-relaxed text-ink-2">
              {[
                'El visitador reporta lo que dijo el médico, sin interpretarlo.',
                'Farmacovigilancia toma el caso y pide la información que falte.',
                'Se notifica a la autoridad sanitaria dentro de las 24 horas.',
                'Queda el registro completo para una auditoría.',
              ].map((t, i) => (
                <li key={t} className="flex gap-2.5">
                  <span className="num flex size-5 shrink-0 items-center justify-center rounded-full bg-sunken text-[11px] font-medium text-ink-2">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
          </section>
          <section className="card p-5">
            <h2 className="text-[15px] font-semibold text-ink">Por qué importa</h2>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-3">
              Es la obligación regulatoria más sensible de un laboratorio. Que el aviso salga del reporte del visitador, sin un formulario aparte, es lo que hace que
              realmente se reporte.
            </p>
          </section>
        </aside>
      </div>
    </>
  )
}
