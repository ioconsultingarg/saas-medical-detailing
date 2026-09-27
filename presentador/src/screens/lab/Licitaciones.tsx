import { useState } from 'react'
import { AlertTriangle, ArrowRight, CalendarClock, Check, CheckCircle2, Gavel, Trophy, XCircle } from 'lucide-react'
import { Sheet } from '../../components/Sheet'
import { ChipProducto, EncabezadoPantalla, Kpi, NumeroAnimado } from '../../components/ui'
import { cuentaPorId } from '../../data/cuentas'
import {
  diasHasta,
  etiquetaLicitacion,
  licitaciones,
  ordenEstados,
  proximaFecha,
  type EstadoLicitacion,
  type Licitacion,
} from '../../data/licitaciones'
import { fechaCorta, miles } from '../../lib/formato'
import { useDemo } from '../../state/demo'

const estiloEstado: Record<EstadoLicitacion, string> = {
  deteccion: 'bg-sunken text-ink-3',
  preparacion: 'bg-warn-soft text-warn',
  presentada: 'bg-accent-soft text-accent',
  adjudicada: 'bg-ok-soft text-ok',
  perdida: 'bg-bad-soft text-bad',
}

const siguiente: Partial<Record<EstadoLicitacion, { estado: EstadoLicitacion; texto: string }>> = {
  deteccion: { estado: 'preparacion', texto: 'Empezar a preparar la oferta' },
  preparacion: { estado: 'presentada', texto: 'Marcar como presentada' },
  presentada: { estado: 'adjudicada', texto: 'Registrar adjudicación' },
}

function Plazo({ fecha, texto }: { fecha: number; texto: string }) {
  const dias = diasHasta(fecha)
  const color = dias < 0 ? 'text-ink-3' : dias <= 5 ? 'text-bad' : dias <= 15 ? 'text-warn' : 'text-ink-2'
  return (
    <span className={`num inline-flex items-center gap-1.5 text-[13px] font-medium ${color}`}>
      <CalendarClock size={14} aria-hidden="true" />
      {texto}: {dias < 0 ? `hace ${Math.abs(dias)} d` : dias === 0 ? 'hoy' : `en ${dias} d`}
    </span>
  )
}

export function Licitaciones() {
  const { estado, despachar, avisar } = useDemo()
  const [abierta, setAbierta] = useState<Licitacion | null>(null)

  const estadoDe = (l: Licitacion) => estado.licitaciones[l.id] ?? l.estadoInicial
  const abiertas = licitaciones.filter((l) => ['deteccion', 'preparacion', 'presentada'].includes(estadoDe(l)))
  const montoEnJuego = abiertas.reduce((a, l) => a + l.monto, 0)
  const urgentes = abiertas.filter((l) => {
    const p = proximaFecha(l, estadoDe(l))
    const d = diasHasta(p.fecha)
    return d >= 0 && d <= 7
  })
  const ganadas = licitaciones.filter((l) => estadoDe(l) === 'adjudicada')
  const cerradas = licitaciones.filter((l) => ['adjudicada', 'perdida'].includes(estadoDe(l)))
  const tasa = cerradas.length ? Math.round((ganadas.length / cerradas.length) * 100) : 0

  const activa = abierta ? { l: abierta, estado: estadoDe(abierta) } : null
  const listos = (l: Licitacion) => l.requisitos.filter((r) => estado.requisitos[r.id] ?? r.listoInicial).length

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Licitaciones"
        descripcion="Los procesos institucionales, con sus fechas críticas a la vista. Perder una licitación por no presentar a tiempo es el error más caro y más evitable."
      />

      {urgentes.length > 0 && (
        <div role="alert" className="animate-entrar mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-bad/25 bg-bad-soft p-4">
          <AlertTriangle size={20} aria-hidden="true" className="shrink-0 text-bad" />
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ink-2">
            <strong className="font-semibold text-ink">
              {urgentes.length === 1 ? 'Una licitación tiene una fecha dentro de la semana' : `${urgentes.length} licitaciones tienen fechas dentro de la semana`}:
            </strong>{' '}
            {urgentes.map((l) => l.organismo).join(' · ')}
          </p>
        </div>
      )}

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Procesos abiertos" Icono={Gavel} valor={<NumeroAnimado valor={abiertas.length} />} detalle="Detectadas, en preparación o presentadas" />
        <Kpi orden={1} etiqueta="Monto en juego" valor={`$ ${miles(Math.round(montoEnJuego / 1000000))}`} unidad="M" detalle="Suma de los procesos abiertos" />
        <Kpi orden={2} etiqueta="Fechas esta semana" Icono={CalendarClock} valor={<NumeroAnimado valor={urgentes.length} />} detalle="Consultas, apertura o adjudicación" />
        <Kpi orden={3} etiqueta="Tasa de adjudicación" Icono={Trophy} valor={<NumeroAnimado valor={tasa} />} unidad="%" detalle={`${ganadas.length} de ${cerradas.length} procesos cerrados`} />
      </dl>

      <div className="grid gap-4 lg:grid-cols-3">
        {ordenEstados
          .filter((e) => e !== 'perdida')
          .map((columna, ci) => {
            const items = licitaciones.filter((l) => estadoDe(l) === columna || (columna === 'adjudicada' && estadoDe(l) === 'perdida'))
            return (
              <section key={columna} aria-label={etiquetaLicitacion[columna]} className="flex min-w-0 flex-col gap-3">
                <h2 className="flex items-center justify-between gap-2 text-[13px] font-semibold text-ink">
                  {columna === 'adjudicada' ? 'Cerradas' : etiquetaLicitacion[columna]}
                  <span className="num rounded-full bg-sunken px-2 text-[12px] font-medium text-ink-3">{items.length}</span>
                </h2>
                {items.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-line-2 px-4 py-8 text-center text-[13px] text-ink-3">Sin procesos</p>
                ) : (
                  items.map((l, i) => {
                    const e = estadoDe(l)
                    const p = proximaFecha(l, e)
                    const hechos = listos(l)
                    return (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setAbierta(l)}
                        className="press card-elevada entra-fila cursor-pointer p-4 text-left hover:border-line-2"
                        style={{ ['--orden' as string]: ci * 2 + i }}
                      >
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${estiloEstado[e]}`}>{etiquetaLicitacion[e]}</span>
                        <span className="mt-2 block text-[15px] leading-snug font-semibold text-ink">{l.organismo}</span>
                        <span className="mt-0.5 block text-[13px] leading-snug text-ink-3">{l.objeto}</span>
                        <span className="num mt-2 block text-[13px] text-ink-2">
                          $ {miles(Math.round(l.monto / 1000000))} M · {miles(l.unidades)} u.
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
                          {(e === 'deteccion' || e === 'preparacion' || e === 'presentada') && <Plazo fecha={p.fecha} texto={p.texto} />}
                          {e === 'preparacion' && (
                            <span className={`num text-[12px] ${hechos < l.requisitos.length ? 'text-warn' : 'text-ok'}`}>
                              {hechos}/{l.requisitos.length} requisitos
                            </span>
                          )}
                        </span>
                        <span className="mt-2 flex flex-wrap items-center gap-1.5">
                          {l.productos.map((pr) => (
                            <ChipProducto key={pr} id={pr} />
                          ))}
                        </span>
                      </button>
                    )
                  })
                )}
              </section>
            )
          })}
      </div>

      <Sheet
        abierto={Boolean(activa)}
        onCerrar={() => setAbierta(null)}
        titulo={activa?.l.organismo ?? ''}
        subtitulo={activa && <span className="eyebrow">Expediente {activa.l.expediente}</span>}
        ancho="520px"
        pie={
          activa && (
            <div className="flex flex-wrap justify-end gap-2">
              {activa.estado === 'presentada' && (
                <button
                  type="button"
                  className="btn-ghost text-bad"
                  onClick={() => {
                    despachar({ tipo: 'licitacion', id: activa.l.id, estado: 'perdida' })
                    avisar('Proceso marcado como no adjudicado', 'warn')
                    setAbierta(null)
                  }}
                >
                  <XCircle size={16} aria-hidden="true" />
                  No adjudicada
                </button>
              )}
              {siguiente[activa.estado] && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    const paso = siguiente[activa.estado]!
                    despachar({ tipo: 'licitacion', id: activa.l.id, estado: paso.estado })
                    avisar(`${activa.l.organismo} · ${etiquetaLicitacion[paso.estado].toLowerCase()}`)
                    setAbierta(null)
                  }}
                >
                  {siguiente[activa.estado]!.texto}
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              )}
            </div>
          )
        }
      >
        {activa && (
          <div className="flex flex-col gap-5">
            <p className="text-[15px] leading-relaxed text-ink">{activa.l.objeto}</p>

            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                ['Monto estimado', `$ ${miles(activa.l.monto)}`],
                ['Unidades', miles(activa.l.unidades)],
                ['Responsable', activa.l.responsable],
                ['Cuenta', activa.l.cuentaId ? cuentaPorId[activa.l.cuentaId].nombre : 'Sin cuenta asociada'],
              ].map(([t, v]) => (
                <div key={t} className="rounded-xl bg-sunken px-3 py-2.5">
                  <dt className="text-[12px] text-ink-3">{t}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            {activa.l.nota && <p className="rounded-xl bg-sunken p-4 text-[14px] leading-relaxed text-ink-2">{activa.l.nota}</p>}

            <div>
              <h3 className="eyebrow mb-2">Fechas del proceso</h3>
              <ul className="flex flex-col gap-2">
                {[
                  ['Publicación', activa.l.publicacion],
                  ['Cierre de consultas', activa.l.consultas],
                  ['Apertura de ofertas', activa.l.apertura],
                  ...(activa.l.adjudicacion ? [['Adjudicación', activa.l.adjudicacion] as [string, number]] : []),
                ].map(([texto, fecha]) => {
                  const dias = diasHasta(fecha as number)
                  return (
                    <li key={texto as string} className="flex items-center justify-between gap-3 border-b border-line pb-2 text-[14px] last:border-0">
                      <span className="text-ink-2">{texto}</span>
                      <span className={`num ${dias >= 0 && dias <= 5 ? 'font-semibold text-bad' : 'text-ink'}`}>
                        {fechaCorta(fecha as number)}
                        {dias >= 0 && <span className="text-ink-3"> · en {dias} d</span>}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div>
              <h3 className="eyebrow mb-2">Requisitos de la presentación</h3>
              <ul className="flex flex-col gap-1.5">
                {activa.l.requisitos.map((r) => {
                  const listo = estado.requisitos[r.id] ?? r.listoInicial
                  return (
                    <li key={r.id}>
                      <button
                        type="button"
                        aria-pressed={listo}
                        onClick={() => despachar({ tipo: 'requisito', id: r.id, listo: !listo })}
                        className="press flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-xl border border-line px-3 text-left text-[14px] hover:border-line-2"
                      >
                        <span className={`flex size-5 shrink-0 items-center justify-center rounded-md border ${listo ? 'border-ok bg-ok text-sobre-estado' : 'border-line-2'}`}>
                          {listo && <Check size={13} aria-hidden="true" />}
                        </span>
                        <span className={listo ? 'text-ink-3 line-through' : 'text-ink'}>{r.texto}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              <p className="mt-2 text-[12px] text-ink-3">
                <CheckCircle2 size={12} aria-hidden="true" className="mr-1 inline align-[-2px]" />
                {listos(activa.l)} de {activa.l.requisitos.length} listos. La app avisa cuando falta algo y la apertura está cerca.
              </p>
            </div>
          </div>
        )}
      </Sheet>
    </>
  )
}
