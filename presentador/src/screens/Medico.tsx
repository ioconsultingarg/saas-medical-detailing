import { ArrowLeft, AudioLines, Building2, CalendarClock, CheckCircle2, CloudOff, FileSignature, Mail, MessageCircle, Package, Phone, Sparkles, Star } from 'lucide-react'
import { Avatar, BadgeCategoria, ChipPrioridad, Variacion, textoDias } from '../components/crm'
import { ChipProducto } from '../components/ui'
import { visitasDelDia } from '../data/agenda'
import {
  apmPorId,
  diasSinVisita,
  entregasDe,
  medicoPorId,
  mesesAuditoria,
  muestras90,
  objetivo90,
  participacion,
  prioridad,
  recetasTrimestre,
  variacion,
  visitas90,
  visitasDe,
} from '../data/crm'
import { productos } from '../data/productos'
import { stockInicial } from '../data/stock'
import { fechaCorta } from '../lib/formato'
import { useDemo } from '../state/demo'
import type { ProductoId } from '../types'

function GraficoRecetas({ recetas }: { recetas: Partial<Record<ProductoId, number[]>> }) {
  const series = Object.entries(recetas) as [ProductoId, number[]][]
  const max = Math.max(...series.flatMap(([, s]) => s))
  return (
    <figure>
      <div className="flex h-44 items-end gap-2 sm:gap-3" aria-hidden="true">
        {mesesAuditoria.map((mes, i) => (
          <div key={mes + i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <div className="flex h-full w-full items-end justify-center gap-1">
              {series.map(([p, s]) => (
                <div key={p} className="flex h-full w-full max-w-7 flex-col items-center justify-end">
                  <span className="num mb-1 text-[11px] text-ink-3">{s[i]}</span>
                  <span
                    className={`w-full rounded-t-md ${i >= 3 ? '' : 'opacity-45'}`}
                    style={{ height: `${(s[i] / max) * 78}%`, background: productos[p].color }}
                  />
                </div>
              ))}
            </div>
            <span className={`text-[12px] capitalize ${i >= 3 ? 'font-medium text-ink' : 'text-ink-3'}`}>{mes}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-ink-3">
        {series.map(([p]) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className="size-2.5 rounded-sm" style={{ background: productos[p].color }} />
            {productos[p].marca}
          </span>
        ))}
        <span>Tono claro: trimestre anterior</span>
      </figcaption>
      <table className="sr-only">
        <caption>Recetas mensuales</caption>
        <thead>
          <tr>
            <th>Mes</th>
            {series.map(([p]) => (
              <th key={p}>{productos[p].marca}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {mesesAuditoria.map((mes, i) => (
            <tr key={mes + i}>
              <td>{mes}</td>
              {series.map(([p, s]) => (
                <td key={p}>{s[i]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  )
}

const nombreSku = Object.fromEntries(stockInicial.map((s) => [s.sku, s.nombre]))

export function Medico({ medicoId }: { medicoId: string }) {
  const { estado } = useDemo()
  const m = medicoPorId[medicoId]

  if (!m) {
    return (
      <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-12 text-center">
        <h1 className="text-[20px] font-semibold text-ink">No encontramos esa ficha</h1>
        <a href="#/medicos" className="btn-primary mt-2">
          Volver al fichero
        </a>
      </div>
    )
  }

  const dias = diasSinVisita(m, estado.registros)
  const prio = prioridad(m, dias)
  const trimestre = recetasTrimestre(m)
  const visitas = visitasDe(m.id, estado.registros)
  const entregas = entregasDe(m.id, estado.entregas)
  const agenda = visitasDelDia.find((v) => v.medicoId === m.id)
  const apm = apmPorId(m.apmId)
  const v = variacion(m)

  return (
    <div className="pt-5 md:pt-7">
      <a href="#/medicos" className="btn-ghost -ml-3">
        <ArrowLeft size={17} aria-hidden="true" />
        Fichero médico
      </a>

      <header className="card mt-3 flex flex-wrap items-center gap-5 p-5 md:p-6">
        <Avatar nombre={m.nombre} size={64} />
        <div className="min-w-0 flex-1 basis-64">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[26px] leading-tight font-semibold text-ink md:text-[30px]">{m.nombre}</h1>
            <BadgeCategoria categoria={m.categoria} />
            <ChipPrioridad prioridad={prio} />
          </div>
          <p className="mt-1 text-[14px] text-ink-3">
            {m.especialidad} · <span className="num">{m.matricula}</span> · Zona {m.zona} · APM {apm.nombre}
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-[14px] text-ink-2">
            <Building2 size={15} aria-hidden="true" className="text-ink-3" />
            {m.institucion}, {m.barrio}
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {m.productos.map((p) => (
              <ChipProducto key={p} id={p} />
            ))}
          </div>
        </div>
        <div className="flex w-full flex-wrap gap-2 md:w-auto md:flex-col md:items-stretch">
          {agenda && (
            <a href="#/" className="btn-primary">
              <CalendarClock size={16} aria-hidden="true" />
              {estado.registros[agenda.id]?.estado === 'completada' ? 'Visitado hoy' : `En tu agenda · ${agenda.hora}`}
            </a>
          )}
          <div className="flex gap-2">
            <a href={`tel:${m.telefono}`} className="btn-secondary flex-1" aria-label={`Llamar a ${m.nombre}`}>
              <Phone size={16} aria-hidden="true" />
            </a>
            <a
              href={m.consentimiento.whatsapp ? `https://wa.me/${m.telefono.replace('+', '')}` : undefined}
              aria-disabled={!m.consentimiento.whatsapp}
              className={`btn-secondary flex-1 ${m.consentimiento.whatsapp ? '' : 'pointer-events-none opacity-45'}`}
              aria-label={m.consentimiento.whatsapp ? `WhatsApp a ${m.nombre}` : 'Sin consentimiento para WhatsApp'}
              title={m.consentimiento.whatsapp ? undefined : 'Sin consentimiento para WhatsApp'}
            >
              <MessageCircle size={16} aria-hidden="true" />
            </a>
            <a
              href={m.consentimiento.email ? `mailto:${m.email}` : undefined}
              aria-disabled={!m.consentimiento.email}
              className={`btn-secondary flex-1 ${m.consentimiento.email ? '' : 'pointer-events-none opacity-45'}`}
              aria-label={m.consentimiento.email ? `Correo a ${m.nombre}` : 'Sin consentimiento para correo'}
            >
              <Mail size={16} aria-hidden="true" />
            </a>
          </div>
        </div>
      </header>

      {prio.nivel !== 'normal' && (
        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-accent/20 bg-accent-soft p-4">
          <Sparkles size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-accent" />
          <p className="text-[14px] leading-relaxed text-ink-2">
            <strong className="font-semibold text-ink">{prio.motivo}.</strong>{' '}
            {v < -0.05
              ? `Conviene priorizar la visita y retomar ${visitas.find((x) => x.etiquetas.some((e) => e.startsWith('Objeción')))?.etiquetas.find((e) => e.startsWith('Objeción'))?.toLowerCase() ?? 'la evidencia a largo plazo'} con material de respaldo.`
              : 'Conviene sumarlo a la ruta de la próxima semana.'}
          </p>
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="card p-4">
          <dt className="text-[13px] text-ink-3">Recetas último trimestre</dt>
          <dd className="mt-1.5 flex items-baseline gap-2">
            <span className="num text-[28px] leading-none font-medium text-ink">{trimestre.actual}</span>
            <Variacion valor={v} className="text-[13px]" />
          </dd>
        </div>
        <div className="card p-4">
          <dt className="text-[13px] text-ink-3">Participación en su clase</dt>
          <dd className="num mt-1.5 text-[28px] leading-none font-medium text-ink">{Math.round(participacion(m) * 100)} %</dd>
        </div>
        <div className="card p-4">
          <dt className="text-[13px] text-ink-3">Visitas en 90 días</dt>
          <dd className="mt-1.5 flex items-baseline gap-2">
            <span className="num text-[28px] leading-none font-medium text-ink">{visitas90(m, estado.registros)}</span>
            <span className="text-[13px] text-ink-3">de {objetivo90[m.categoria]} objetivo</span>
          </dd>
        </div>
        <div className="card p-4">
          <dt className="text-[13px] text-ink-3">Última visita</dt>
          <dd className="mt-1.5 text-[22px] leading-tight font-medium text-ink">{textoDias(dias)}</dd>
        </div>
      </dl>

      <section aria-labelledby="titulo-recetas" className="card mt-4 p-5 md:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-recetas" className="text-[16px] font-semibold text-ink">
            Prescripción mensual
          </h2>
          <span className="text-[12px] text-ink-3">Auditoría de prescripciones · 6 meses cerrados</span>
        </div>
        <div className="mt-5">
          <GraficoRecetas recetas={m.recetas} />
        </div>
      </section>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-historial" className="card overflow-hidden">
          <h2 id="titulo-historial" className="border-b border-line px-5 py-4 text-[16px] font-semibold text-ink">
            Historial de visitas
          </h2>
          <ol className="relative px-5 py-4">
            {visitas.slice(0, 7).map((x, i) => (
              <li key={x.id} className="relative flex gap-4 pb-5 last:pb-0">
                {i < Math.min(visitas.length, 7) - 1 && <span aria-hidden="true" className="absolute top-7 bottom-0 left-[11px] w-px bg-line" />}
                <span className={`relative mt-1 flex size-6 shrink-0 items-center justify-center rounded-full ${x.hoy ? 'bg-ink text-white' : 'bg-sunken text-ink-3'}`}>
                  {x.origen === 'voz' ? <AudioLines size={12} aria-hidden="true" /> : <CheckCircle2 size={12} aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="text-[14px] font-semibold text-ink">{x.hoy ? 'Hoy' : fechaCorta(x.fecha)}</span>
                    {x.calificacion > 0 && (
                      <span className="flex" aria-label={`Receptividad ${x.calificacion} de 5`}>
                        {[1, 2, 3, 4, 5].map((n) => (
                          <Star key={n} size={12} aria-hidden="true" className={n <= x.calificacion ? 'fill-ink text-ink' : 'text-line-2'} />
                        ))}
                      </span>
                    )}
                    {x.origen === 'voz' && <span className="chip border-transparent bg-accent-soft text-accent">Reporte por voz</span>}
                  </div>
                  <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{x.nota}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {x.productos.map((p) => (
                      <ChipProducto key={p} id={p} />
                    ))}
                    {x.etiquetas.map((e) => (
                      <span key={e} className="chip">
                        {e}
                      </span>
                    ))}
                    {x.muestras > 0 && (
                      <span className="chip">
                        <Package size={12} aria-hidden="true" />
                        <span className="num">{x.muestras}</span> muestras
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="titulo-trazabilidad" className="card overflow-hidden">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-5 py-4">
            <h2 id="titulo-trazabilidad" className="text-[16px] font-semibold text-ink">
              Trazabilidad de muestras
            </h2>
            <span className="text-[12px] text-ink-3">
              <span className="num">{muestras90(m.id, estado.entregas)}</span> u. en 90 días
            </span>
          </div>
          {entregas.length === 0 ? (
            <p className="px-5 py-10 text-center text-[14px] text-ink-3">Sin entregas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[480px] text-left text-[13px]">
                <thead className="bg-sunken/60 text-[12px] text-ink-3">
                  <tr>
                    <th scope="col" className="px-5 py-2 font-medium">Fecha</th>
                    <th scope="col" className="px-2 py-2 font-medium">Ítem y lote</th>
                    <th scope="col" className="px-2 py-2 text-right font-medium">Cant.</th>
                    <th scope="col" className="px-5 py-2 font-medium">Recepción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {entregas.slice(0, 10).map((e) => (
                    <tr key={e.id}>
                      <td className="num px-5 py-2.5 whitespace-nowrap text-ink-2">{fechaCorta(e.fecha)}</td>
                      <td className="px-2 py-2.5">
                        <div className="text-ink">{nombreSku[e.sku] ?? e.sku}</div>
                        <div className="num text-[12px] text-ink-3">
                          Lote {e.lote} · vence {e.vencimiento}
                        </div>
                      </td>
                      <td className="num px-2 py-2.5 text-right text-ink">{e.cantidad}</td>
                      <td className="px-5 py-2.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap ${
                            e.firma === 'pendiente' ? 'text-warn' : 'text-ok'
                          }`}
                        >
                          <FileSignature size={13} aria-hidden="true" />
                          {e.firma === 'digital' ? 'Firma digital' : e.firma === 'papel' ? 'Remito en papel' : 'Firma pendiente'}
                        </span>
                        {!e.sincronizado && (
                          <span className="flex items-center gap-1 text-[11px] text-ink-3">
                            <CloudOff size={11} aria-hidden="true" />
                            En cola
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
