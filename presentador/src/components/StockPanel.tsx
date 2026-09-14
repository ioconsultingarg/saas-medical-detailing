import { useMemo, useState } from 'react'
import { Minus, PackageCheck, Plus, Search, ShoppingBag, Truck } from 'lucide-react'
import { productos } from '../data/productos'
import { esSolicitable, nivelDe } from '../data/stock'
import { miles } from '../lib/formato'
import { CUPO_MUESTRAS, nombreCorto, useDemo } from '../state/demo'
import type { ProductoId, TipoItemStock } from '../types'
import { ChipProducto, MonogramaProducto, Segmentado, Semaforo } from './ui'

type Filtro = 'todos' | ProductoId | 'material'

const etiquetaTipo: Record<TipoItemStock, string> = {
  comercial: 'Presentación comercial',
  muestra: 'Muestra médica',
  material: 'Material promocional',
}

interface Props {
  /** limita a los productos de la presentación en curso */
  productosEnFoco?: ProductoId[]
}

export function StockPanel({ productosEnFoco }: Props) {
  const { estado, visitaActiva, online, despachar, avisar } = useDemo()
  const [filtro, setFiltro] = useState<Filtro>(productosEnFoco?.length === 1 ? productosEnFoco[0] : 'todos')
  const [busqueda, setBusqueda] = useState('')

  const items = useMemo(() => {
    const q = busqueda.trim().toLowerCase()
    return estado.stock.filter((s) => {
      if (filtro === 'material' && s.tipo !== 'material') return false
      if ((filtro === 'cardio' || filtro === 'respira') && s.productoId !== filtro) return false
      if (q && !`${s.nombre} ${s.sku}`.toLowerCase().includes(q)) return false
      return true
    })
  }, [estado.stock, filtro, busqueda])

  const cantidadDe = (sku: string) => estado.carrito.find((c) => c.sku === sku)?.cantidad ?? 0
  const muestrasEnCarrito = estado.carrito.reduce((a, c) => {
    const item = estado.stock.find((s) => s.sku === c.sku)
    return item?.tipo === 'muestra' ? a + c.cantidad : a
  }, 0)
  const unidadesCarrito = estado.carrito.reduce((a, c) => a + c.cantidad, 0)
  const cupoAgotado = muestrasEnCarrito >= CUPO_MUESTRAS

  function solicitar() {
    despachar({ tipo: 'pedido' })
    avisar(
      online
        ? `Pedido de ${unidadesCarrito} u. enviado${visitaActiva ? ` para ${nombreCorto(visitaActiva)}` : ''}`
        : `Pedido guardado sin conexión · se envía al recuperar señal`,
      online ? 'ok' : 'warn',
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <label className="relative block">
          <span className="sr-only">Buscar en el stock</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            name="buscar-stock"
            autoComplete="off"
            spellCheck={false}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar producto o SKU…"
            className="field pl-10"
          />
        </label>
        <Segmentado<Filtro>
          etiqueta="Filtrar stock"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todos', texto: 'Todo' },
            { valor: 'cardio', texto: <><MonogramaProducto id="cardio" size={14} />{productos.cardio.marca}</> },
            { valor: 'respira', texto: <><MonogramaProducto id="respira" size={14} />{productos.respira.marca}</> },
            { valor: 'material', texto: 'Material' },
          ]}
        />
      </div>

      <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
        {items.length === 0 && <li className="px-4 py-8 text-center text-[14px] text-ink-3">No hay ítems que coincidan con “{busqueda}”.</li>}
        {items.map((s) => {
          const nivel = nivelDe(s)
          const cantidad = cantidadDe(s.sku)
          const solicitable = esSolicitable(s)
          const bloqueadoPorCupo = s.tipo === 'muestra' && cupoAgotado
          return (
            <li key={s.sku} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
              <div className="min-w-0 flex-1 basis-56">
                <div className="flex flex-wrap items-center gap-2">
                  <Semaforo nivel={nivel} />
                  <span className="text-[12px] text-ink-3">{etiquetaTipo[s.tipo]}</span>
                </div>
                <div className="mt-1 truncate text-[15px] font-semibold text-ink" translate="no">
                  {s.nombre}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px] text-ink-3">
                  <span className="num">{s.sku}</span>
                  {s.productoId && <ChipProducto id={s.productoId} />}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="num text-[17px] font-medium text-ink">{miles(s.unidades)}</div>
                  <div className="text-[11px] text-ink-3">unidades</div>
                </div>

                {solicitable && s.unidades > 0 ? (
                  <div className="flex items-center rounded-xl border border-line-2 bg-surface">
                    <button
                      type="button"
                      className="btn-icon rounded-r-none"
                      onClick={() => despachar({ tipo: 'carrito', sku: s.sku, delta: -1 })}
                      disabled={cantidad === 0}
                      aria-label={`Quitar una unidad de ${s.nombre}`}
                    >
                      <Minus size={17} aria-hidden="true" />
                    </button>
                    <span className="num w-8 text-center text-[15px] font-medium text-ink" aria-live="polite">
                      {cantidad}
                    </span>
                    <button
                      type="button"
                      className="btn-icon rounded-l-none"
                      onClick={() => despachar({ tipo: 'carrito', sku: s.sku, delta: 1 })}
                      disabled={cantidad >= s.unidades || bloqueadoPorCupo}
                      aria-label={`Agregar una unidad de ${s.nombre}`}
                    >
                      <Plus size={17} aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <span className="w-[132px] text-right text-[12px] leading-snug text-ink-3">
                    {s.tipo === 'comercial' ? 'Se pide por droguería' : 'Sin unidades para entregar'}
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ul>

      <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-3">
        <PackageCheck size={15} aria-hidden="true" className="mt-0.5 shrink-0" />
        Cupo por médico: {CUPO_MUESTRAS} u. de muestras por mes. La entrega requiere firma de recepción al cerrar la visita.
      </p>

      {estado.carrito.length > 0 && (
        <div className="sticky bottom-0 -mx-1 rounded-2xl bg-ink p-4 text-white shadow-(--shadow-float)">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-white/10">
                <ShoppingBag size={19} aria-hidden="true" />
              </span>
              <div>
                <div className="text-[15px] font-semibold">
                  {unidadesCarrito} u. · {estado.carrito.length} {estado.carrito.length === 1 ? 'ítem' : 'ítems'}
                </div>
                <div className="text-[12px] text-white/65">
                  Muestras <span className="num">{muestrasEnCarrito}/{CUPO_MUESTRAS}</span>
                  {visitaActiva ? ` · a ${visitaActiva.consultorio}` : ' · sin visita en curso'}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn text-white/80 hover:bg-white/10" onClick={() => despachar({ tipo: 'vaciarCarrito' })}>
                Vaciar
              </button>
              <button type="button" className="btn bg-white text-ink hover:bg-white/90" onClick={solicitar}>
                <Truck size={17} aria-hidden="true" />
                {visitaActiva ? 'Enviar al consultorio' : 'Solicitar envío'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
