import { useMemo, useState } from 'react'
import { AlertTriangle, CalendarCheck, ChevronRight, Package, Search, Users } from 'lucide-react'
import { Avatar, BadgeCategoria, ChipPrioridad, Sparkline, textoDias, Variacion } from '../components/crm'
import { EncabezadoPantalla, Kpi, MonogramaProducto, NumeroAnimado, Segmentado } from '../components/ui'
import { visitasDelDia } from '../data/agenda'
import { APM_ACTUAL, diasSinVisita, medicos, muestras90, objetivo90, prioridad, umbralDias, variacion, visitas90, type Categoria } from '../data/crm'
import { miles } from '../lib/formato'
import { useDemo } from '../state/demo'

type FiltroCategoria = 'todas' | Categoria
type Orden = 'prioridad' | 'nombre' | 'tendencia'

const pesoPrioridad = { alta: 0, media: 1, normal: 2 }

export function Medicos() {
  const { estado } = useDemo()
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<FiltroCategoria>('todas')
  const [orden, setOrden] = useState<Orden>('prioridad')

  const cartera = useMemo(
    () =>
      medicos
        .filter((m) => m.apmId === APM_ACTUAL)
        .map((m) => {
          const dias = diasSinVisita(m, estado.registros)
          return {
            m,
            dias,
            prio: prioridad(m, dias),
            v: variacion(m),
            visitas: visitas90(m, estado.registros),
            muestras: muestras90(m.id, estado.entregas),
            agenda: visitasDelDia.find((x) => x.medicoId === m.id && estado.registros[x.id]?.estado !== 'completada'),
            serie: Object.values(m.recetas).reduce<number[]>((acc, s) => s!.map((x, i) => x + (acc[i] ?? 0)), []),
          }
        }),
    [estado.registros, estado.entregas],
  )

  const kpis = {
    total: cartera.length,
    cobertura: cartera.filter((c) => c.dias <= 30).length / cartera.length,
    atrasadasA: cartera.filter((c) => c.m.categoria === 'A' && c.dias > umbralDias.A).length,
    muestras: cartera.reduce((a, c) => a + c.muestras, 0),
  }

  const visibles = cartera
    .filter((c) => {
      if (categoria !== 'todas' && c.m.categoria !== categoria) return false
      const q = busqueda.trim().toLowerCase()
      return !q || `${c.m.nombre} ${c.m.especialidad} ${c.m.barrio} ${c.m.institucion}`.toLowerCase().includes(q)
    })
    .sort((a, b) => {
      if (orden === 'nombre') return a.m.nombre.replace(/^Dra?\.\s*/, '').localeCompare(b.m.nombre.replace(/^Dra?\.\s*/, ''))
      if (orden === 'tendencia') return a.v - b.v
      return pesoPrioridad[a.prio.nivel] - pesoPrioridad[b.prio.nivel] || a.v - b.v
    })

  return (
    <>
      <EncabezadoPantalla
        eyebrow="CRM · Zona Norte"
        titulo="Fichero médico"
        descripcion="Tu cartera con historial de visitas, tendencia de prescripción y trazabilidad de muestras. Ordenada según a quién conviene ver primero."
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi
          orden={0}
          etiqueta="Médicos en cartera"
          Icono={Users}
          valor={<NumeroAnimado valor={kpis.total} />}
          detalle={`${cartera.filter((c) => c.m.categoria === 'A').length} de categoría A`}
        />
        <Kpi
          orden={1}
          etiqueta="Cobertura 30 días"
          Icono={CalendarCheck}
          valor={<NumeroAnimado valor={Math.round(kpis.cobertura * 100)} />}
          unidad="%"
          detalle="Médicos visitados al menos una vez"
        />
        <Kpi
          orden={2}
          etiqueta="Categoría A atrasados"
          Icono={AlertTriangle}
          valor={<NumeroAnimado valor={kpis.atrasadasA} />}
          detalle="Más de 30 días sin visita"
        />
        <Kpi orden={3} etiqueta="Muestras en 90 días" Icono={Package} valor={miles(kpis.muestras)} unidad="u." detalle="Unidades con firma de recepción" />
      </dl>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="relative block min-w-0 flex-1 basis-64">
          <span className="sr-only">Buscar médico</span>
          <Search size={17} aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            name="buscar-medico"
            autoComplete="off"
            spellCheck={false}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Nombre, especialidad o institución…"
            className="field pl-10"
          />
        </label>
        <Segmentado<FiltroCategoria>
          etiqueta="Filtrar por categoría"
          valor={categoria}
          onCambio={setCategoria}
          opciones={[
            { valor: 'todas', texto: 'Todas' },
            { valor: 'A', texto: 'Cat. A' },
            { valor: 'B', texto: 'Cat. B' },
            { valor: 'C', texto: 'Cat. C' },
          ]}
        />
        <Segmentado<Orden>
          etiqueta="Ordenar"
          valor={orden}
          onCambio={setOrden}
          opciones={[
            { valor: 'prioridad', texto: 'Prioridad' },
            { valor: 'tendencia', texto: 'Tendencia' },
            { valor: 'nombre', texto: 'A–Z' },
          ]}
        />
      </div>

      <section aria-label="Médicos" className="card overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_24px] gap-4 border-b border-line bg-sunken/60 px-5 py-2.5 text-[12px] font-medium text-ink-3 lg:grid">
          <span>Médico</span>
          <span>Última visita</span>
          <span>Visitas 90 d</span>
          <span>Recetas · 6 meses</span>
          <span className="text-right">Muestras</span>
          <span />
        </div>
        {visibles.length === 0 ? (
          <p className="px-5 py-12 text-center text-[14px] text-ink-3">No hay médicos que coincidan con la búsqueda.</p>
        ) : (
          <ul className="divide-y divide-line">
            {visibles.map(({ m, dias, prio, v, visitas, muestras, agenda, serie }, i) => (
              <li key={m.id} className="entra-fila" style={{ ['--orden' as string]: Math.min(i, 10) }}>
                <a
                  href={`#/medicos/${m.id}`}
                  className="press grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 hover:bg-sunken/60 sm:px-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)_minmax(0,0.9fr)_minmax(0,1.2fr)_minmax(0,0.7fr)_24px]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <Avatar nombre={m.nombre} />
                    <span className="min-w-0">
                      <span className="flex min-w-0 items-center gap-2">
                        <span className="truncate text-[15px] font-semibold text-ink">{m.nombre}</span>
                        <BadgeCategoria categoria={m.categoria} />
                      </span>
                      <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
                        {m.productos.map((p) => (
                          <MonogramaProducto key={p} id={p} size={13} />
                        ))}
                        <span className="truncate">
                          {m.especialidad} · {m.barrio}
                        </span>
                      </span>
                      {prio.nivel !== 'normal' && (
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[12px] text-ink-2">
                          <ChipPrioridad prioridad={prio} />
                          {prio.motivo}
                        </span>
                      )}
                    </span>
                  </span>

                  <ChevronRight size={18} aria-hidden="true" className="text-ink-3 lg:order-last" />

                  <span className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-[52px] text-[13px] lg:contents">
                    <span className={dias > umbralDias[m.categoria] ? 'font-medium text-bad' : 'text-ink-2'}>
                      {agenda ? (
                        <span className="font-medium text-accent">Agenda hoy · {agenda.hora}</span>
                      ) : (
                        textoDias(dias)
                      )}
                    </span>
                    <span className="num text-ink-2">
                      {visitas}/{objetivo90[m.categoria]}
                      <span className="text-ink-3 lg:hidden"> visitas</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <Sparkline valores={serie} />
                      <Variacion valor={v} />
                    </span>
                    <span className="num text-ink-2 lg:text-right">
                      {muestras}
                      <span className="text-ink-3"> u.</span>
                    </span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
      <p className="mt-3 text-[12px] text-ink-3">Recetas: auditoría mensual de prescripciones, último trimestre contra el anterior. Datos ficticios.</p>
    </>
  )
}
