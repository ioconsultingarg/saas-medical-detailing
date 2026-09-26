import { useState } from 'react'
import { ArrowLeft, Building2, CalendarClock, Check, FileSignature, Gavel, Handshake, Mail, MessageSquarePlus, Package, Phone, TrendingUp } from 'lucide-react'
import { Variacion } from '../../components/crm'
import { ChipProducto, EncabezadoPantalla, Kpi, NumeroAnimado } from '../../components/ui'
import { comprasTrimestre, cuentaPorId, etiquetaEstado, etiquetaMovimiento, etiquetaTipo, variacionCompras, type Movimiento } from '../../data/cuentas'
import { mesesAuditoria } from '../../data/crm'
import { diasHasta, licitaciones } from '../../data/licitaciones'
import { fechaCorta, miles } from '../../lib/formato'
import { useDemo } from '../../state/demo'

const tipos: Movimiento['tipo'][] = ['reunion', 'pedido', 'acuerdo', 'reclamo', 'nota']

function GraficoCompras({ compras }: { compras: number[] }) {
  const max = Math.max(...compras, 1)
  return (
    <figure>
      <div className="flex h-36 items-end gap-2 sm:gap-3" aria-hidden="true">
        {mesesAuditoria.map((mes, i) => (
          <div key={mes + i} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-1.5">
            <span className="num text-[11px] text-ink-3">{compras[i] ? miles(compras[i]) : '—'}</span>
            <span className={`w-full max-w-12 rounded-t-md ${i >= 3 ? 'bg-ink' : 'bg-line-2'}`} style={{ height: `${(compras[i] / max) * 80}%`, minHeight: compras[i] ? 3 : 0 }} />
            <span className={`text-[12px] capitalize ${i >= 3 ? 'font-medium text-ink' : 'text-ink-3'}`}>{mes}</span>
          </div>
        ))}
      </div>
      <figcaption className="mt-3 text-[12px] text-ink-3">Unidades compradas por mes. Tono claro: trimestre anterior.</figcaption>
    </figure>
  )
}

export function Cuenta({ cuentaId }: { cuentaId: string }) {
  const { estado, despachar, avisar } = useDemo()
  const [tipo, setTipo] = useState<Movimiento['tipo']>('reunion')
  const [titulo, setTitulo] = useState('')
  const [detalle, setDetalle] = useState('')

  const c = cuentaPorId[cuentaId]
  if (!c) {
    return (
      <div className="card mx-auto mt-10 flex max-w-lg flex-col items-center gap-3 px-6 py-12 text-center">
        <h1 className="text-[20px] font-semibold text-ink">No encontramos esa cuenta</h1>
        <a href="#/lab/cuentas" className="btn-primary mt-2">
          Volver a cuentas
        </a>
      </div>
    )
  }

  const propias = estado.interacciones[c.id] ?? []
  const historial = [...propias, ...c.historial]
  const relacionadas = licitaciones.filter((l) => l.cuentaId === c.id)

  function registrar() {
    const t = titulo.trim()
    if (!t) return
    despachar({
      tipo: 'interaccion',
      cuentaId: c.id,
      movimiento: { fecha: Date.now(), tipo, titulo: t, detalle: detalle.trim(), autor: 'Martín Sosa' },
    })
    setTitulo('')
    setDetalle('')
    avisar('Interacción registrada en la cuenta')
  }

  return (
    <div className="pt-5 md:pt-7">
      <a href="#/lab/cuentas" className="btn-ghost -ml-3">
        <ArrowLeft size={17} aria-hidden="true" />
        Cuentas
      </a>

      <EncabezadoPantalla
        eyebrow={`${etiquetaTipo[c.tipo]} · ${c.localidad}`}
        titulo={c.nombre}
        descripcion={`CUIT ${c.cuit} · Responsable: ${c.kam} · ${etiquetaEstado[c.estado]}`}
        acciones={<span className="flex flex-wrap gap-1.5">{c.productos.map((p) => <ChipProducto key={p} id={p} />)}</span>}
      />

      <dl className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Unidades del trimestre" Icono={Package} valor={miles(comprasTrimestre(c))} detalle={<Variacion valor={variacionCompras(c)} />} />
        <Kpi orden={1} etiqueta="Descuento vigente" valor={<NumeroAnimado valor={c.condiciones.descuento} />} unidad="%" detalle={`Pago a ${c.condiciones.plazoPago} días`} />
        <Kpi orden={2} etiqueta="Acuerdos activos" Icono={FileSignature} valor={<NumeroAnimado valor={c.acuerdos.length} />} detalle={c.condiciones.exhibicion} />
        <Kpi orden={3} etiqueta="Último contacto" Icono={CalendarClock} valor={<NumeroAnimado valor={propias.length ? 0 : c.diasSinContacto} />} unidad="días" detalle="Registrado en la ficha" />
      </dl>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-w-0 flex-col gap-5">
          <section aria-labelledby="titulo-compras" className="card-elevada p-5">
            <h2 id="titulo-compras" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <TrendingUp size={17} aria-hidden="true" className="text-ink-3" />
              Compras
            </h2>
            <div className="mt-4">
              <GraficoCompras compras={c.compras} />
            </div>
          </section>

          <section aria-labelledby="titulo-registrar" className="card p-5">
            <h2 id="titulo-registrar" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <MessageSquarePlus size={17} aria-hidden="true" className="text-ink-3" />
              Registrar una interacción
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5" role="group" aria-label="Tipo de interacción">
              {tipos.map((t) => (
                <button
                  key={t}
                  type="button"
                  aria-pressed={t === tipo}
                  onClick={() => setTipo(t)}
                  className={`press min-h-9 cursor-pointer rounded-full border px-3 text-[13px] font-medium ${
                    t === tipo ? 'border-transparent bg-ink text-white' : 'border-line bg-surface text-ink-2 hover:border-line-2'
                  }`}
                >
                  {etiquetaMovimiento[t]}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="titulo-interaccion">
              Título
            </label>
            <input
              id="titulo-interaccion"
              name="titulo-interaccion"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ej.: reunión por la renovación del acuerdo"
              className="field mt-3"
            />
            <label className="sr-only" htmlFor="detalle-interaccion">
              Detalle
            </label>
            <textarea
              id="detalle-interaccion"
              name="detalle-interaccion"
              rows={3}
              value={detalle}
              onChange={(e) => setDetalle(e.target.value)}
              placeholder="Qué se habló, qué quedó pendiente y con quién."
              className="field mt-2 min-h-20 py-2.5 leading-relaxed"
            />
            <button type="button" className="btn-primary mt-3" onClick={registrar} disabled={!titulo.trim()}>
              <Check size={16} aria-hidden="true" />
              Guardar en la cuenta
            </button>
          </section>

          <section aria-labelledby="titulo-historial" className="card overflow-hidden">
            <h2 id="titulo-historial" className="border-b border-line px-5 py-4 text-[16px] font-semibold text-ink">
              Historial de la cuenta
            </h2>
            <ol className="px-5 py-4">
              {historial.map((m, i) => (
                <li key={`${m.fecha}-${i}`} className="relative flex gap-4 pb-5 last:pb-0">
                  {i < historial.length - 1 && <span aria-hidden="true" className="absolute top-7 bottom-0 left-[11px] w-px bg-line" />}
                  <span className="relative mt-1 flex size-6 shrink-0 items-center justify-center rounded-full bg-sunken text-[10px] font-semibold text-ink-2">
                    {etiquetaMovimiento[m.tipo][0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14px] font-semibold text-ink">{m.titulo}</span>
                      <span className="chip">{etiquetaMovimiento[m.tipo]}</span>
                    </div>
                    {m.detalle && <p className="mt-1 text-[14px] leading-relaxed text-ink-2">{m.detalle}</p>}
                    <p className="num mt-1 text-[12px] text-ink-3">
                      {fechaCorta(m.fecha)} · {m.autor}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Handshake size={16} aria-hidden="true" className="text-ink-3" />
              Acuerdos
            </h2>
            {c.acuerdos.length === 0 ? (
              <p className="mt-2 text-[13px] text-ink-3">Todavía no hay acuerdos firmados con esta cuenta.</p>
            ) : (
              <ul className="mt-3 flex flex-col gap-3">
                {c.acuerdos.map((a) => {
                  const dias = diasHasta(a.vence)
                  return (
                    <li key={a.id} className="rounded-xl bg-sunken p-3">
                      <div className="text-[14px] font-semibold text-ink">{a.titulo}</div>
                      <p className="mt-0.5 text-[13px] leading-snug text-ink-2">{a.detalle}</p>
                      <p className={`num mt-1.5 text-[12px] font-medium ${dias < 60 ? 'text-warn' : 'text-ink-3'}`}>
                        {dias < 0 ? `Vencido hace ${Math.abs(dias)} días` : `Vence en ${dias} días · ${fechaCorta(a.vence)}`}
                      </p>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          <section className="card p-5">
            <h2 className="text-[15px] font-semibold text-ink">Contactos</h2>
            <ul className="mt-3 flex flex-col gap-3">
              {c.contactos.map((p) => (
                <li key={p.email}>
                  <div className="text-[14px] font-medium text-ink">{p.nombre}</div>
                  <div className="text-[13px] text-ink-3">{p.cargo}</div>
                  <div className="mt-1.5 flex gap-2">
                    <a href={`tel:${p.telefono}`} className="btn-secondary min-h-9 px-2.5 text-[13px]" aria-label={`Llamar a ${p.nombre}`}>
                      <Phone size={14} aria-hidden="true" />
                      Llamar
                    </a>
                    <a href={`mailto:${p.email}`} className="btn-secondary min-h-9 px-2.5 text-[13px]" aria-label={`Escribir a ${p.nombre}`}>
                      <Mail size={14} aria-hidden="true" />
                      Correo
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {relacionadas.length > 0 && (
            <section className="card p-5">
              <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
                <Gavel size={16} aria-hidden="true" className="text-ink-3" />
                Licitaciones de esta cuenta
              </h2>
              <ul className="mt-3 flex flex-col gap-2">
                {relacionadas.map((l) => (
                  <li key={l.id}>
                    <a href="#/lab/licitaciones" className="press block rounded-xl border border-line px-3 py-2.5 hover:bg-sunken">
                      <span className="block text-[14px] font-medium text-ink">{l.objeto}</span>
                      <span className="num block text-[12px] text-ink-3">{l.expediente}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="card p-5">
            <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
              <Building2 size={16} aria-hidden="true" className="text-ink-3" />
              Condiciones comerciales
            </h2>
            <dl className="mt-3 flex flex-col gap-2 text-[13px]">
              {[
                ['Descuento', `${c.condiciones.descuento} %`],
                ['Plazo de pago', `${c.condiciones.plazoPago} días`],
                ['Exhibición', c.condiciones.exhibicion],
                ['Zona', c.zona],
              ].map(([t, v]) => (
                <div key={t} className="flex justify-between gap-3">
                  <dt className="text-ink-3">{t}</dt>
                  <dd className="text-right font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </aside>
      </div>
    </div>
  )
}
