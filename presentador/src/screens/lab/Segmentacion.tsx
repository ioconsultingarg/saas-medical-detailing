import { useMemo, useState } from 'react'
import { ArrowRight, Check, Info, Target, TrendingUp, Users, X } from 'lucide-react'
import { Avatar, BadgeCategoria, Variacion, textoDias } from '../../components/crm'
import { EncabezadoPantalla, Kpi, MonogramaProducto, NumeroAnimado, Segmentado } from '../../components/ui'
import { apmPorId } from '../../data/crm'
import { analizar, descripcionSegmento, etiquetaSegmento, propuestas, type Analisis, type Segmento } from '../../lib/rfm'
import { useDemo } from '../../state/demo'

type Vista = 'propuestas' | 'todos'

const estiloSegmento: Record<Segmento, string> = {
  campeon: 'bg-ok-soft text-ok',
  riesgo: 'bg-bad-soft text-bad',
  crecimiento: 'bg-accent-soft text-accent',
  dormido: 'bg-sunken text-ink-3',
  mantener: 'bg-sunken text-ink-2',
}

/** Las tres letras del análisis, en puntos de 1 a 5 */
function Puntajes({ a }: { a: Analisis }) {
  return (
    <span className="flex items-center gap-2.5" title={`Recencia ${a.r}, frecuencia ${a.f}, valor ${a.m}`}>
      {([['R', a.r], ['F', a.f], ['M', a.m]] as [string, number][]).map(([letra, valor]) => (
        <span key={letra} className="flex items-center gap-1">
          <span className="font-mono text-[10px] text-ink-3">{letra}</span>
          <span aria-hidden="true" className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <span key={n} className={`h-3 w-1 rounded-full ${n <= valor ? 'bg-ink' : 'bg-line-2'}`} />
            ))}
          </span>
          <span className="sr-only">{`${letra}: ${valor} de 5`}</span>
        </span>
      ))}
    </span>
  )
}

export function Segmentacion() {
  const { estado, despachar, avisar } = useDemo()
  const [vista, setVista] = useState<Vista>('propuestas')
  const [descartadas, setDescartadas] = useState<string[]>([])

  const analisis = useMemo(
    () => analizar({ registros: estado.registros, entregas: estado.entregas, categorias: estado.categorias }),
    [estado.registros, estado.entregas, estado.categorias],
  )

  const cambios = propuestas(analisis).filter((a) => !descartadas.includes(a.medico.id))
  const filas = vista === 'propuestas' ? cambios : [...analisis].sort((a, b) => b.recetas - a.recetas)
  const conteo = (s: Segmento) => analisis.filter((a) => a.segmento === s).length

  function aprobar(a: Analisis) {
    despachar({ tipo: 'categoria', medicoId: a.medico.id, categoria: a.sugerida, nombre: a.medico.nombre })
    avisar(`${a.medico.nombre} pasa a categoría ${a.sugerida}`)
  }

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Segmentos y potencial"
        descripcion="Cada médico analizado por recencia de visita, frecuencia y volumen de prescripción. El sistema propone la categoría; la decisión la toma una persona, porque define la carga de trabajo del equipo."
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Campeones" Icono={TrendingUp} valor={<NumeroAnimado valor={conteo('campeon')} />} detalle="Volumen alto y visita al día" />
        <Kpi orden={1} etiqueta="En riesgo" valor={<NumeroAnimado valor={conteo('riesgo')} />} detalle="Prescriben y hace mucho no se los visita" />
        <Kpi orden={2} etiqueta="En crecimiento" valor={<NumeroAnimado valor={conteo('crecimiento')} />} detalle="Vienen subiendo su prescripción" />
        <Kpi orden={3} etiqueta="Cambios propuestos" Icono={Target} valor={<NumeroAnimado valor={cambios.length} />} detalle="Esperando aprobación de la gerencia" />
      </dl>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmentado<Vista>
          etiqueta="Qué mostrar"
          valor={vista}
          onCambio={setVista}
          opciones={[
            { valor: 'propuestas', texto: `Cambios propuestos (${cambios.length})` },
            { valor: 'todos', texto: `Toda la cartera (${analisis.length})` },
          ]}
        />
        {Object.keys(estado.categorias).length > 0 && (
          <span className="chip border-transparent bg-ok-soft text-ok">
            <Check size={12} aria-hidden="true" />
            <span className="num">{Object.keys(estado.categorias).length}</span> recategorizaciones aplicadas
          </span>
        )}
      </div>

      {vista === 'propuestas' && cambios.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Target size={26} aria-hidden="true" className="text-ink-3" />
          <p className="text-[16px] font-semibold text-ink">No hay cambios de categoría para proponer</p>
          <p className="max-w-[48ch] text-[14px] text-ink-3">La cartera está alineada con el potencial que muestra cada médico.</p>
        </div>
      ) : (
        <section aria-label="Análisis de la cartera" className="card overflow-hidden">
          <div className="hidden grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.6fr)] gap-4 border-b border-line bg-sunken/60 px-5 py-2.5 text-[12px] font-medium text-ink-3 lg:grid">
            <span>Médico</span>
            <span>Análisis</span>
            <span>Segmento</span>
            <span>Recetas</span>
            <span>{vista === 'propuestas' ? 'Cambio propuesto' : 'Categoría'}</span>
          </div>
          <ul className="divide-y divide-line">
            {filas.map((a, i) => (
              <li
                key={a.medico.id}
                className="entra-fila grid grid-cols-1 gap-x-4 gap-y-3 px-4 py-4 sm:px-5 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1.3fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_minmax(0,1.6fr)] lg:items-center"
                style={{ ['--orden' as string]: Math.min(i, 10) }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Avatar nombre={a.medico.nombre} />
                  <span className="min-w-0">
                    <a href={`#/medicos/${a.medico.id}`} className="block truncate text-[15px] font-semibold text-ink underline-offset-2 hover:underline">
                      {a.medico.nombre}
                    </a>
                    <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
                      {a.medico.productos.map((p) => (
                        <MonogramaProducto key={p} id={p} size={13} />
                      ))}
                      <span className="truncate">
                        {a.medico.especialidad} · {apmPorId(a.medico.apmId).nombre}
                      </span>
                    </span>
                  </span>
                </span>

                <span className="pl-[52px] lg:pl-0">
                  <Puntajes a={a} />
                  <span className="mt-1 block text-[12px] text-ink-3">
                    {textoDias(a.dias)} · {a.visitas} visitas en 90 d
                  </span>
                </span>

                <span className="pl-[52px] lg:pl-0">
                  <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold ${estiloSegmento[a.segmento]}`}>
                    {etiquetaSegmento[a.segmento]}
                  </span>
                </span>

                <span className="flex items-center gap-2 pl-[52px] lg:pl-0">
                  <span className="num text-[14px] text-ink">{a.recetas}</span>
                  <Variacion valor={a.variacion} />
                </span>

                <span className="flex flex-wrap items-center gap-2 pl-[52px] lg:pl-0">
                  {a.sugerida === a.actual ? (
                    <>
                      <BadgeCategoria categoria={a.actual} />
                      <span className="text-[13px] text-ink-3">Sin cambios</span>
                    </>
                  ) : (
                    <>
                      <span className="flex items-center gap-1.5">
                        <BadgeCategoria categoria={a.actual} />
                        <ArrowRight size={14} aria-hidden="true" className="text-ink-3" />
                        <BadgeCategoria categoria={a.sugerida} />
                      </span>
                      <span className="flex gap-1.5">
                        <button type="button" className="btn-primary min-h-9 px-3 text-[13px]" onClick={() => aprobar(a)}>
                          <Check size={14} aria-hidden="true" />
                          Aprobar
                        </button>
                        <button
                          type="button"
                          className="btn-secondary min-h-9 px-3 text-[13px]"
                          onClick={() => setDescartadas((d) => [...d, a.medico.id])}
                          aria-label={`Descartar la propuesta para ${a.medico.nombre}`}
                        >
                          <X size={14} aria-hidden="true" />
                        </button>
                      </span>
                    </>
                  )}
                </span>

                <span className="col-span-full text-[13px] leading-relaxed text-ink-2 lg:pl-0">{a.motivo}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Info size={16} aria-hidden="true" className="text-ink-3" />
            Cómo se calcula
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-[13px] leading-relaxed">
            {[
              ['R · Recencia', 'Hace cuánto no se lo visita, medido contra la frecuencia que le corresponde.'],
              ['F · Frecuencia', 'Visitas de los últimos 90 días sobre el objetivo de su categoría.'],
              ['M · Valor', 'Recetas del último trimestre, comparadas con el resto de la cartera.'],
            ].map(([t, d]) => (
              <div key={t}>
                <dt className="font-semibold text-ink">{t}</dt>
                <dd className="text-ink-2">{d}</dd>
              </div>
            ))}
          </dl>
        </section>
        <section className="card p-5">
          <h2 className="flex items-center gap-2 text-[15px] font-semibold text-ink">
            <Users size={16} aria-hidden="true" className="text-ink-3" />
            Los segmentos
          </h2>
          <dl className="mt-3 flex flex-col gap-2 text-[13px] leading-relaxed">
            {(Object.keys(etiquetaSegmento) as Segmento[]).map((s) => (
              <div key={s} className="flex gap-2">
                <dt className={`h-fit shrink-0 rounded-md px-1.5 py-0.5 text-[12px] font-semibold ${estiloSegmento[s]}`}>{etiquetaSegmento[s]}</dt>
                <dd className="text-ink-2">{descripcionSegmento[s]}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        El análisis trabaja sobre médicos y prescripción, nunca sobre el desempeño individual de los promotores. Ningún cambio de categoría se aplica sin aprobación.
      </p>
    </>
  )
}
