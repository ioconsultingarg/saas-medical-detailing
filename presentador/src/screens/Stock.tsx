import { CloudOff, RefreshCw } from 'lucide-react'
import { StockPanel } from '../components/StockPanel'
import { EncabezadoPantalla } from '../components/ui'
import { nivelDe } from '../data/stock'
import { hace } from '../lib/formato'
import { useAhora } from '../lib/tiempo'
import { useDemo } from '../state/demo'

export function Stock() {
  const { estado, online } = useDemo()
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
    </>
  )
}
