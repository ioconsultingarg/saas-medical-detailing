import { useState } from 'react'
import { CloudOff, FileSignature, RefreshCw } from 'lucide-react'
import { StockPanel } from '../components/StockPanel'
import { EncabezadoPantalla, Segmentado } from '../components/ui'
import { APM_ACTUAL, entregasHistoricas, haceDias, medicoPorId } from '../data/crm'
import { nivelDe } from '../data/stock'
import { fechaCorta, hace, miles } from '../lib/formato'
import { useAhora } from '../lib/tiempo'
import { useDemo } from '../state/demo'

function Trazabilidad() {
  const { estado } = useDemo()
  const limite = haceDias(90, 0)
  const entregas = [...estado.entregas, ...entregasHistoricas.filter((e) => medicoPorId[e.medicoId]?.apmId === APM_ACTUAL)].filter((e) => e.fecha >= limite)
  const muestras = estado.stock.filter((s) => s.tipo === 'muestra')
  const pendientes = entregas.filter((e) => e.firma === 'pendiente').length

  return (
    <div className="flex flex-col gap-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {muestras.map((s) => {
          const entregado = entregas.filter((e) => e.sku === s.sku).reduce((a, e) => a + e.cantidad, 0)
          return (
            <div key={s.sku} className="card p-4">
              <div className="text-[14px] font-semibold text-ink">{s.nombre}</div>
              <div className="num mt-0.5 text-[12px] text-ink-3">
                {s.sku} · lote vigente {s.lote} · vence {s.vencimiento}
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-2">
                <div>
                  <dt className="text-[12px] text-ink-3">Entregado 90 d</dt>
                  <dd className="num text-[22px] font-medium text-ink">{miles(entregado)}</dd>
                </div>
                <div>
                  <dt className="text-[12px] text-ink-3">En tu stock</dt>
                  <dd className={`num text-[22px] font-medium ${s.unidades === 0 ? 'text-bad' : 'text-ink'}`}>{miles(s.unidades)}</dd>
                </div>
              </dl>
            </div>
          )
        })}
        <div className="card p-4">
          <div className="text-[14px] font-semibold text-ink">Conciliación</div>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-3">Cada unidad entregada queda vinculada a un médico, un lote y una firma. Se concilia con SAP todas las noches.</p>
          <p className={`mt-2 text-[13px] font-medium ${pendientes ? 'text-warn' : 'text-ok'}`}>
            {pendientes ? `${pendientes} entregas con firma pendiente` : 'Todas las entregas tienen firma'}
          </p>
        </div>
      </div>

      <section aria-labelledby="titulo-libro" className="card overflow-hidden">
        <h2 id="titulo-libro" className="border-b border-line px-5 py-4 text-[16px] font-semibold text-ink">
          Libro de entregas · últimos 90 días
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-[13px]">
            <thead className="bg-sunken/60 text-[12px] text-ink-3">
              <tr>
                <th scope="col" className="px-5 py-2 font-medium">Fecha</th>
                <th scope="col" className="px-2 py-2 font-medium">Médico</th>
                <th scope="col" className="px-2 py-2 font-medium">SKU · lote</th>
                <th scope="col" className="px-2 py-2 text-right font-medium">Cant.</th>
                <th scope="col" className="px-5 py-2 font-medium">Recepción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {entregas.slice(0, 25).map((e) => (
                <tr key={e.id}>
                  <td className="num px-5 py-2.5 whitespace-nowrap text-ink-2">{fechaCorta(e.fecha)}</td>
                  <td className="px-2 py-2.5">
                    <a href={`#/medicos/${e.medicoId}`} className="font-medium text-ink underline-offset-2 hover:underline">
                      {medicoPorId[e.medicoId]?.nombre}
                    </a>
                  </td>
                  <td className="num px-2 py-2.5 whitespace-nowrap text-ink-2">
                    {e.sku} · {e.lote}
                  </td>
                  <td className="num px-2 py-2.5 text-right text-ink">{e.cantidad}</td>
                  <td className="px-5 py-2.5">
                    <span className={`inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap ${e.firma === 'pendiente' ? 'text-warn' : 'text-ok'}`}>
                      <FileSignature size={13} aria-hidden="true" />
                      {e.firma === 'digital' ? 'Firma digital' : e.firma === 'papel' ? 'Remito en papel' : 'Firma pendiente'}
                      {!e.sincronizado && <span className="font-normal text-ink-3"> · en cola</span>}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

export function Stock() {
  const { estado, online } = useDemo()
  const [vista, setVista] = useState<'inventario' | 'trazabilidad'>('inventario')
  const ahora = useAhora(15000)
  const conteo = { alto: 0, bajo: 0, sin: 0 }
  for (const s of estado.stock) conteo[nivelDe(s)] += 1

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Inventario"
        titulo="Stock en tiempo real"
        descripcion="Consultá disponibilidad durante la visita y pedí muestras o material para el consultorio sin salir de la presentación."
        acciones={
          <span className={`chip min-h-9 px-3 text-[13px] ${online ? '' : 'border-warn/30 bg-warn-soft text-warn'}`}>
            {online ? <RefreshCw size={14} aria-hidden="true" /> : <CloudOff size={14} aria-hidden="true" />}
            {online ? `Actualizado ${hace(estado.stockActualizado, ahora)}` : 'Última actualización guardada'}
          </span>
        }
      />

      <div className="mb-4">
        <Segmentado
          etiqueta="Vista de stock"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: 'inventario', texto: 'Inventario' },
            { valor: 'trazabilidad', texto: 'Trazabilidad de muestras' },
          ]}
        />
      </div>

      {vista === 'trazabilidad' ? (
        <Trazabilidad />
      ) : (
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <StockPanel />

        <aside aria-label="Resumen del semáforo" className="flex flex-col gap-2 lg:sticky lg:top-24 lg:self-start">
          {[
            { clave: 'alto' as const, titulo: 'Stock alto', texto: 'Entrega inmediata', clase: 'bg-ok' },
            { clave: 'bajo' as const, titulo: 'Stock bajo', texto: 'Cuota restringida por representante', clase: 'bg-warn' },
            { clave: 'sin' as const, titulo: 'Sin stock', texto: 'Pendiente de reposición', clase: 'bg-bad' },
          ].map((n) => (
            <div key={n.clave} className="card flex items-center gap-3 px-4 py-3">
              <span aria-hidden="true" className={`size-3 rounded-full ${n.clase}`} />
              <div className="min-w-0 flex-1">
                <div className="text-[14px] font-semibold text-ink">{n.titulo}</div>
                <div className="text-[12px] text-ink-3">{n.texto}</div>
              </div>
              <span className="num text-[22px] font-medium text-ink">{conteo[n.clave]}</span>
            </div>
          ))}
        </aside>
      </div>
      )}
    </>
  )
}
