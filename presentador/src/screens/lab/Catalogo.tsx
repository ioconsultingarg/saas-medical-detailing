import { Minus, Package, Plus, RefreshCw, Boxes } from 'lucide-react'
import { ChipProducto, EncabezadoPantalla, Kpi, NumeroAnimado } from '../../components/ui'
import { listaProductos, productos } from '../../data/productos'
import { nivelDe, stockInicial } from '../../data/stock'
import { miles } from '../../lib/formato'
import { useDemo } from '../../state/demo'
import type { ProductoId } from '../../types'

export function Catalogo() {
  const { estado, despachar, avisar } = useDemo()
  const unidades = estado.stock.reduce((a, s) => a + s.unidades, 0)
  const enFalta = estado.stock.filter((s) => nivelDe(s) !== 'alto').length

  function cambiarCupo(id: ProductoId, delta: number) {
    const valor = Math.max(0, Math.min(60, (estado.cupos[id] ?? 0) + delta))
    despachar({ tipo: 'cupo', productoId: id, valor })
  }

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Catálogo y muestras"
        descripcion="Los productos, sus presentaciones y los lotes que están en la calle. Acá se define cuántas muestras puede entregar cada visitador por médico y por mes."
        acciones={
          <button type="button" className="btn-secondary" onClick={() => avisar('Sincronización con SAP simulada en la demo', 'info')}>
            <RefreshCw size={16} aria-hidden="true" />
            Sincronizar con SAP
          </button>
        }
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Productos" Icono={Boxes} valor={<NumeroAnimado valor={listaProductos.length} />} detalle="Líneas terapéuticas activas" />
        <Kpi orden={1} etiqueta="SKU en el catálogo" valor={<NumeroAnimado valor={stockInicial.length} />} detalle="Comerciales, muestras y material" />
        <Kpi orden={2} etiqueta="Unidades en la calle" Icono={Package} valor={miles(unidades)} detalle="Sumando el stock de los visitadores" />
        <Kpi orden={3} etiqueta="SKU en falta" valor={<NumeroAnimado valor={enFalta} />} detalle="Bajo el umbral o sin stock" />
      </dl>

      <div className="grid gap-4 xl:grid-cols-2">
        {listaProductos.map((p) => {
          const items = estado.stock.filter((s) => s.productoId === p.id)
          const cupo = estado.cupos[p.id] ?? 0
          return (
            <section key={p.id} aria-label={p.marca} className="card-elevada overflow-hidden">
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-line p-5" style={{ background: p.tinte }}>
                <div>
                  <h2 className="text-[20px] leading-tight font-semibold text-ink">{p.marca}</h2>
                  <p className="text-[13px] text-ink-2">
                    {p.detalle} · línea {p.linea}
                  </p>
                </div>
                <ChipProducto id={p.id} />
              </header>

              <div className="p-5">
                <h3 className="eyebrow mb-3">Presentaciones y lotes</h3>
                <ul className="flex flex-col divide-y divide-line">
                  {items.map((s) => (
                    <li key={s.sku} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-medium text-ink">{s.nombre}</span>
                        <span className="num block text-[12px] text-ink-3">
                          {s.sku}
                          {s.lote && ` · lote ${s.lote} · vence ${s.vencimiento}`}
                        </span>
                      </span>
                      <span className={`num text-[15px] font-medium ${s.unidades === 0 ? 'text-bad' : 'text-ink'}`}>{miles(s.unidades)} u.</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-5 rounded-xl bg-sunken p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-[14px] font-semibold text-ink">Cupo de muestras por médico</h3>
                      <p className="text-[12px] text-ink-3">Máximo mensual que puede entregar cada visitador</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button type="button" className="btn-icon bg-surface" aria-label={`Bajar el cupo de ${p.marca}`} onClick={() => cambiarCupo(p.id, -2)} disabled={cupo === 0}>
                        <Minus size={16} aria-hidden="true" />
                      </button>
                      <span className="num w-12 text-center text-[22px] font-medium text-ink" aria-live="polite">
                        {cupo}
                      </span>
                      <button type="button" className="btn-icon bg-surface" aria-label={`Subir el cupo de ${p.marca}`} onClick={() => cambiarCupo(p.id, 2)} disabled={cupo >= 60}>
                        <Plus size={16} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        Cada entrega de muestras descuenta el stock del visitador y genera el movimiento de material en el ERP. La conciliación con SAP corre todas las noches y
        queda registrada en {productos.cardio.marca} y {productos.respira.marca} por lote.
      </p>
    </>
  )
}
