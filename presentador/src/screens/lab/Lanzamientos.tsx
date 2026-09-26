import { useState } from 'react'
import { CalendarCheck, CalendarPlus, Check, GraduationCap, Package, Rocket, Target, Users } from 'lucide-react'
import { Avatar, BadgeCategoria, textoDias } from '../../components/crm'
import { ChipProducto, EncabezadoPantalla, NumeroAnimado, Segmentado } from '../../components/ui'
import { categoriaDe, diasSinVisita, medicoPorId, muestras90, recetasTrimestre, umbralDias } from '../../data/crm'
import { etiquetaFase, lanzamientos, type Lanzamiento } from '../../data/lanzamientos'
import { cursos } from '../../data/academia'
import { piezaPorId } from '../../data/portal'
import { equipo } from '../../data/crm'
import { fechaCorta, miles } from '../../lib/formato'
import { diasHasta } from '../../data/licitaciones'
import { useDemo } from '../../state/demo'
import { useAcademia } from '../../state/academia'

export function Lanzamientos() {
  const { estado, despachar, avisar } = useDemo()
  const { estado: academia } = useAcademia()
  const [elegido, setElegido] = useState(lanzamientos[0].id)
  const [planCreado, setPlanCreado] = useState(false)

  const l: Lanzamiento = lanzamientos.find((x) => x.id === elegido) ?? lanzamientos[0]
  const objetivo = l.objetivo.map((id) => medicoPorId[id]).filter(Boolean)
  const alcanzados = objetivo.filter((m) => diasSinVisita(m, estado.registros) <= umbralDias[categoriaDe(m, estado.categorias)])
  const conMuestras = objetivo.filter((m) => muestras90(m.id, estado.entregas) > 0)
  const recetas = objetivo.reduce((a, m) => a + recetasTrimestre(m, l.productoId).actual, 0)
  const curso = cursos.find((c) => c.id === l.cursoId)
  const certificado = curso ? Boolean(academia.progreso[curso.id]?.certificado) : false
  // en la demo solo el visitador de la sesión tiene progreso real de capacitación
  const equipoListo = certificado ? equipo.length : equipo.length - 1
  const pendientes = objetivo.filter((m) => !alcanzados.includes(m))
  const hitos = l.hitos.map((h) => ({ ...h, listo: estado.hitos[h.id] ?? h.listoInicial }))
  const hitosListos = hitos.filter((h) => h.listo).length

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Lanzamientos"
        descripcion="Sacar un producto nuevo se juega en los primeros 90 días. Acá está el listado de médicos objetivo, el cronograma y cómo viene la adopción."
        acciones={
          lanzamientos.length > 1 && (
            <Segmentado
              etiqueta="Elegir lanzamiento"
              valor={elegido}
              onCambio={(v) => {
                setElegido(v)
                setPlanCreado(false)
              }}
              opciones={lanzamientos.map((x) => ({ valor: x.id, texto: x.nombre.split(' · ')[0] }))}
            />
          )
        }
      />

      <section className="card-elevada mb-6 overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line p-5 md:p-6">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="chip border-transparent bg-ink text-white">
                <Rocket size={12} aria-hidden="true" />
                {etiquetaFase[l.fase]}
              </span>
              <ChipProducto id={l.productoId} />
              <span className="num text-[12px] text-ink-3">
                {l.fase === 'preparacion' ? `Arranca en ${diasHasta(l.inicio)} días` : `Día ${Math.abs(diasHasta(l.inicio))} del lanzamiento`}
              </span>
            </div>
            <h2 className="mt-2 text-[22px] leading-tight font-semibold text-ink">{l.nombre}</h2>
            <p className="mt-1 max-w-[70ch] text-[14px] leading-relaxed text-ink-3">{l.detalle}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {[
            { etiqueta: 'Médicos objetivo', valor: objetivo.length, detalle: 'Definidos por el laboratorio', Icono: Target },
            { etiqueta: 'Alcanzados', valor: alcanzados.length, detalle: `${Math.round((alcanzados.length / objetivo.length) * 100)} % del listado`, Icono: Users },
            { etiqueta: 'Con muestras', valor: conMuestras.length, detalle: 'Recibieron material en 90 días', Icono: Package },
            { etiqueta: 'Equipo certificado', valor: equipoListo, detalle: `de ${equipo.length} visitadores`, Icono: GraduationCap },
          ].map(({ etiqueta, valor, detalle, Icono }, i) => (
            <div key={etiqueta} className="entra-fila p-5" style={{ ['--orden' as string]: i }}>
              <dt className="flex items-center gap-2">
                <Icono size={15} aria-hidden="true" className="text-ink-3" />
                <span className="kpi-label">{etiqueta}</span>
              </dt>
              <dd className="kpi-num mt-2">
                <NumeroAnimado valor={valor} />
              </dd>
              <dd className="mt-1.5 text-[12px] text-ink-3">{detalle}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
        <section aria-labelledby="titulo-cronograma" className="card p-5">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="titulo-cronograma" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <CalendarCheck size={17} aria-hidden="true" className="text-ink-3" />
              Cronograma
            </h2>
            <span className="num text-[12px] text-ink-3">
              {hitosListos}/{hitos.length} hitos
            </span>
          </div>

          <ol className="mt-4 flex flex-col gap-1">
            {hitos.map((h) => {
              const dias = diasHasta(h.fecha)
              const atrasado = !h.listo && dias < 0
              return (
                <li key={h.id}>
                  <button
                    type="button"
                    aria-pressed={h.listo}
                    onClick={() => despachar({ tipo: 'hito', id: h.id, listo: !h.listo })}
                    className="press flex w-full cursor-pointer items-start gap-3 rounded-xl px-2 py-2.5 text-left hover:bg-sunken"
                  >
                    <span className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border ${h.listo ? 'border-ok bg-ok text-white' : atrasado ? 'border-bad' : 'border-line-2'}`}>
                      {h.listo && <Check size={13} aria-hidden="true" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-[14px] leading-snug ${h.listo ? 'text-ink-3 line-through' : 'font-medium text-ink'}`}>{h.titulo}</span>
                      <span className={`num block text-[12px] ${atrasado ? 'font-medium text-bad' : 'text-ink-3'}`}>
                        {fechaCorta(h.fecha)} · {h.responsable}
                        {atrasado && ` · atrasado ${Math.abs(dias)} días`}
                      </span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ol>

          <div className="mt-5 border-t border-line pt-4">
            <h3 className="eyebrow mb-2">Kit del lanzamiento</h3>
            <ul className="flex flex-col gap-1.5">
              {l.piezas.map((id) => {
                const pieza = piezaPorId[id]
                if (!pieza) return null
                const publicada = (estado.piezas[id] ?? pieza.estadoInicial) === 'publicada'
                return (
                  <li key={id} className="flex items-center gap-2 text-[13px]">
                    <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${publicada ? 'bg-ok' : 'bg-warn'}`} />
                    <span className="min-w-0 flex-1 truncate text-ink-2">{pieza.titulo}</span>
                    <a href="#/lab" className="shrink-0 text-[12px] font-medium text-accent underline-offset-2 hover:underline">
                      {publicada ? 'Publicada' : 'Sin publicar'}
                    </a>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>

        <section aria-labelledby="titulo-objetivo" className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="titulo-objetivo" className="text-[16px] font-semibold text-ink">
              Médicos objetivo
            </h2>
            {pendientes.length > 0 &&
              (planCreado ? (
                <span className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-ok">
                  <Check size={15} aria-hidden="true" />
                  Plan enviado
                </span>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    despachar({ tipo: 'plan', medicos: pendientes.map((m) => m.id), resumen: `Plan de visitas del lanzamiento ${l.nombre} · ${pendientes.length} médicos` })
                    setPlanCreado(true)
                    avisar(`Plan creado para ${pendientes.length} médicos del lanzamiento`)
                  }}
                >
                  <CalendarPlus size={16} aria-hidden="true" />
                  Plan para los {pendientes.length} pendientes
                </button>
              ))}
          </div>

          <ul className="max-h-[520px] divide-y divide-line overflow-y-auto">
            {objetivo.map((m, i) => {
              const dias = diasSinVisita(m, estado.registros)
              const alcanzado = alcanzados.includes(m)
              const muestras = muestras90(m.id, estado.entregas)
              return (
                <li key={m.id} className="entra-fila flex items-center gap-3 px-5 py-3" style={{ ['--orden' as string]: Math.min(i, 10) }}>
                  <Avatar nombre={m.nombre} size={34} />
                  <span className="min-w-0 flex-1">
                    <a href={`#/medicos/${m.id}`} className="flex min-w-0 items-center gap-2 text-[14px] font-semibold text-ink underline-offset-2 hover:underline">
                      <span className="truncate">{m.nombre}</span>
                      <BadgeCategoria categoria={categoriaDe(m, estado.categorias)} />
                    </a>
                    <span className="block truncate text-[12px] text-ink-3">
                      {m.especialidad} · {textoDias(dias)}
                      {muestras > 0 && ` · ${muestras} muestras`}
                    </span>
                  </span>
                  <span className={`chip shrink-0 border-transparent ${alcanzado ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>{alcanzado ? 'Alcanzado' : 'Pendiente'}</span>
                </li>
              )
            })}
          </ul>
        </section>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        Recetas del producto en el trimestre entre los médicos objetivo: <span className="num font-medium text-ink-2">{miles(recetas)}</span>
        {l.baseRecetas > 0 && ` · línea de base previa al lanzamiento: ${miles(l.baseRecetas)}`}. La adopción se mide sobre el listado objetivo, no sobre el desempeño
        individual de cada promotor.
      </p>
    </>
  )
}
