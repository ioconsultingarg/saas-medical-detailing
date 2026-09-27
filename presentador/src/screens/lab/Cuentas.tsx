import { useState } from 'react'
import { AlertTriangle, Building2, ChevronRight, FileSignature, Handshake, Search, TrendingUp } from 'lucide-react'
import { Sparkline, Variacion } from '../../components/crm'
import { EncabezadoPantalla, Kpi, MonogramaProducto, NumeroAnimado, Segmentado } from '../../components/ui'
import { acuerdosPorVencer, comprasTrimestre, cuentas, etiquetaEstado, etiquetaTipo, variacionCompras, type EstadoCuenta } from '../../data/cuentas'
import { miles } from '../../lib/formato'
import { useDemo } from '../../state/demo'

type Filtro = 'todas' | EstadoCuenta

const estiloEstado: Record<EstadoCuenta, string> = {
  activa: 'bg-ok-soft text-ok',
  negociacion: 'bg-accent-soft text-accent',
  inactiva: 'bg-bad-soft text-bad',
}

export function Cuentas() {
  const { estado } = useDemo()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [busqueda, setBusqueda] = useState('')

  const conAcuerdosPorVencer = cuentas.filter((c) => acuerdosPorVencer(c).length > 0)
  const enRiesgo = cuentas.filter((c) => c.estado === 'activa' && variacionCompras(c) < -0.1)
  const unidades = cuentas.reduce((a, c) => a + comprasTrimestre(c), 0)

  const visibles = cuentas.filter((c) => {
    if (filtro !== 'todas' && c.estado !== filtro) return false
    const q = busqueda.trim().toLowerCase()
    return !q || `${c.nombre} ${c.localidad} ${c.kam} ${etiquetaTipo[c.tipo]}`.toLowerCase().includes(q)
  })

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Cuentas institucionales"
        descripcion="Droguerías, cadenas, instituciones y financiadores: dónde se factura de verdad. Todo el historial queda en la cuenta, no en la cabeza del responsable."
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Cuentas" Icono={Building2} valor={<NumeroAnimado valor={cuentas.length} />} detalle={`${cuentas.filter((c) => c.estado === 'activa').length} activas`} />
        <Kpi orden={1} etiqueta="Unidades del trimestre" Icono={TrendingUp} valor={miles(unidades)} detalle="Compras de todas las cuentas" />
        <Kpi orden={2} etiqueta="Acuerdos por vencer" Icono={FileSignature} valor={<NumeroAnimado valor={conAcuerdosPorVencer.length} />} detalle="Dentro de los próximos 60 días" />
        <Kpi orden={3} etiqueta="Cuentas en caída" Icono={AlertTriangle} valor={<NumeroAnimado valor={enRiesgo.length} />} detalle="Activas que compran menos que el trimestre anterior" />
      </dl>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative block min-w-0 flex-1 basis-64">
          <span className="sr-only">Buscar cuenta</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            name="buscar-cuenta"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, localidad o responsable…"
            autoComplete="off"
            className="field pl-10"
          />
        </label>
        <Segmentado<Filtro>
          etiqueta="Filtrar cuentas"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todas', texto: 'Todas' },
            { valor: 'activa', texto: 'Activas' },
            { valor: 'negociacion', texto: 'En negociación' },
            { valor: 'inactiva', texto: 'Sin operar' },
          ]}
        />
      </div>

      <section aria-label="Cuentas" className="card overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_24px] gap-4 border-b border-line bg-sunken/60 px-5 py-2.5 text-[12px] font-medium text-ink-3 lg:grid">
          <span>Cuenta</span>
          <span>Responsable</span>
          <span>Compras · 6 meses</span>
          <span>Trimestre</span>
          <span>Último contacto</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          {visibles.map((c, i) => {
            const v = variacionCompras(c)
            const porVencer = acuerdosPorVencer(c).length
            return (
              <li key={c.id} className="entra-fila" style={{ ['--orden' as string]: i }}>
                <a
                  href={`#/lab/cuentas/${c.id}`}
                  className="press grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-sunken/60 sm:px-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)_24px]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-2">
                      <Building2 size={18} />
                    </span>
                    <span className="min-w-0">
                      <span className="flex min-w-0 flex-wrap items-center gap-2">
                        <span className="truncate text-[15px] font-semibold text-ink">{c.nombre}</span>
                        <span className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-[11px] font-semibold ${estiloEstado[c.estado]}`}>{etiquetaEstado[c.estado]}</span>
                        {porVencer > 0 && (
                          <span className="chip border-transparent bg-warn-soft text-warn">
                            <FileSignature size={11} aria-hidden="true" />
                            {porVencer === 1 ? 'Acuerdo por vencer' : `${porVencer} acuerdos por vencer`}
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
                        {c.productos.map((p) => (
                          <MonogramaProducto key={p} id={p} size={13} />
                        ))}
                        <span className="truncate">
                          {etiquetaTipo[c.tipo]} · {c.localidad}
                        </span>
                      </span>
                    </span>
                  </span>

                  <ChevronRight size={18} aria-hidden="true" className="text-ink-3 lg:order-last" />

                  <span className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-[52px] text-[13px] lg:contents">
                    <span className="text-ink-2">{c.kam}</span>
                    <span className="flex items-center gap-2">
                      {c.compras.some((x) => x > 0) ? <Sparkline valores={c.compras} /> : <span className="text-ink-3">Sin compras</span>}
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="num text-ink">{miles(comprasTrimestre(c))}</span>
                      {c.compras.some((x) => x > 0) && <Variacion valor={v} />}
                    </span>
                    <span className={c.diasSinContacto > 45 ? 'font-medium text-bad' : 'text-ink-2'}>Hace {c.diasSinContacto} días</span>
                  </span>
                </a>
              </li>
            )
          })}
        </ul>
      </section>

      <p className="mt-4 flex items-start gap-2 text-[12px] leading-relaxed text-ink-3">
        <Handshake size={14} aria-hidden="true" className="mt-0.5 shrink-0" />
        Cada cuenta guarda sus contactos, acuerdos vigentes y el historial completo de negociaciones. Si el responsable se toma licencia o deja la empresa, el que lo
        reemplaza abre la ficha y sabe exactamente en qué quedó cada conversación.
      </p>
      <p className="mt-2 text-[12px] text-ink-3">
        <span className="num">{estado.outbox.filter((o) => o.tipo === 'cuenta').length}</span> interacciones registradas en esta sesión.
      </p>
    </>
  )
}
