import {
  apmPorId,
  diasSinVisita,
  equipo,
  historialVisitas,
  medicos,
  muestras90,
  participacion,
  recetasTrimestre,
  umbralDias,
  variacion,
  visitas90,
  visitasDeHoy,
  objetivo90,
  haceDias,
  type Categoria,
  type MedicoCRM,
} from '../data/crm'
import { productos } from '../data/productos'
import type { EntregaMuestra, ProductoId, RegistroVisita } from '../types'
import { normalizar } from './extraccionVoz'

/*
 * Asistente estratégico: pregunta en lenguaje natural → intención + filtros → consulta → respuesta.
 * En producción un LLM traduce la pregunta a SQL sobre una capa semántica con permisos por zona;
 * en la demo, un intérprete local con las mismas salidas (datos, consulta, fuentes y acción).
 */

export type TipoColumna = 'texto' | 'medico' | 'categoria' | 'variacion' | 'dias' | 'num' | 'pct' | 'apm'

export interface Columna {
  clave: string
  titulo: string
  tipo: TipoColumna
}

export type Fila = Record<string, string | number> & { medicoId?: string }

export interface RespuestaCurator {
  entendida: boolean
  interpretacion: string[]
  resumen: string
  destacados: { valor: string; etiqueta: string }[]
  columnas: Columna[]
  filas: Fila[]
  grafico?: { titulo: string; items: { etiqueta: string; valor: number }[]; formato: 'pct' | 'num' }
  sql: string
  fuentes: string[]
  accion?: { texto: string; medicos: string[] }
  sugerencias: string[]
}

interface Contexto {
  registros: Record<string, RegistroVisita>
  entregas: EntregaMuestra[]
}

export const preguntasEjemplo = [
  '¿Qué médicos bajaron su prescripción y no fueron visitados?',
  '¿Cuáles son los mayores prescriptores de Demo-molécula?',
  '¿Qué médicos recibieron muestras pero no aumentaron sus recetas?',
  '¿Cómo viene la cobertura de visitas de cada APM?',
  '¿Cuáles son las objeciones más frecuentes de Respira-mol?',
  '¿Qué cardiólogos categoría A no se visitan hace más de 30 días?',
]

const pct = (v: number) => `${v > 0 ? '+' : v < 0 ? '−' : ''}${Math.abs(Math.round(v * 100))} %`

interface Filtros {
  producto?: ProductoId
  especialidad?: string
  zona?: string
  apmId?: string
  categoria?: Categoria
  dias?: number
}

function leerFiltros(n: string): Filtros {
  const f: Filtros = {}
  if (/demo.?molecula|cardio(?!log)|estatina|colesterol/.test(n)) f.producto = 'cardio'
  else if (/respira|inhalador|epoc|asma/.test(n)) f.producto = 'respira'

  const especialidades: [RegExp, string][] = [
    [/cardiolog/, 'Cardiología'],
    [/neumo/, 'Neumonología'],
    [/clinic(o|a|os|as) medic|clinicos/, 'Clínica médica'],
    [/internist|medicina interna/, 'Medicina interna'],
    [/alergi/, 'Alergia e inmunología'],
  ]
  f.especialidad = especialidades.find(([re]) => re.test(n))?.[1]

  const zona = n.match(/zona (norte|centro|oeste|sur)/)
  if (zona) f.zona = zona[1][0].toUpperCase() + zona[1].slice(1)
  const apm = equipo.find((a) => {
    const [nombre, ap] = normalizar(a.nombre).split(' ')
    return new RegExp(`\\b(${nombre}|${ap})\\b`).test(n)
  })
  if (apm) f.apmId = apm.id

  const cat = n.match(/categoria ([abc])\b|\bclase ([abc])\b|\bcat\.? ([abc])\b/)
  if (cat) f.categoria = (cat[1] ?? cat[2] ?? cat[3]).toUpperCase() as Categoria

  const palabras: Record<string, number> = { un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, seis: 6 }
  const periodo = n.match(/(\d+|un|una|dos|tres|cuatro|seis)\s*(dias?|semanas?|mes(es)?)/)
  if (periodo) {
    const cantidad = /\d/.test(periodo[1]) ? Number(periodo[1]) : palabras[periodo[1]]
    f.dias = periodo[2].startsWith('dia') ? cantidad : periodo[2].startsWith('semana') ? cantidad * 7 : cantidad * 30
  }
  return f
}

function chipsFiltros(f: Filtros) {
  return [
    f.producto && `Producto: ${productos[f.producto].marca}`,
    f.especialidad && `Especialidad: ${f.especialidad}`,
    f.zona && `Zona ${f.zona}`,
    f.apmId && `APM: ${apmPorId(f.apmId).nombre}`,
    f.categoria && `Categoría ${f.categoria}`,
  ].filter((x): x is string => Boolean(x))
}

function aplicarFiltros(f: Filtros) {
  return medicos.filter(
    (m) =>
      (!f.producto || m.productos.includes(f.producto)) &&
      (!f.especialidad || m.especialidad === f.especialidad) &&
      (!f.zona || m.zona === f.zona) &&
      (!f.apmId || m.apmId === f.apmId) &&
      (!f.categoria || m.categoria === f.categoria),
  )
}

function whereSql(f: Filtros) {
  return [
    f.producto && `rx.product_id = '${f.producto}'`,
    f.especialidad && `h.specialty = '${f.especialidad}'`,
    f.zona && `h.territory = '${f.zona}'`,
    f.apmId && `h.rep_id = '${f.apmId}'`,
    f.categoria && `h.segment = '${f.categoria}'`,
  ].filter((x): x is string => Boolean(x))
}

const cteRecetas = (f: Filtros) => `WITH rx AS (
  SELECT hcp_id,
         SUM(units) FILTER (WHERE month >  date_trunc('month', now()) - interval '4 months') AS last_q,
         SUM(units) FILTER (WHERE month <= date_trunc('month', now()) - interval '4 months') AS prev_q
  FROM rx_audit
  WHERE month > date_trunc('month', now()) - interval '7 months'${f.producto ? `\n    AND product_id = '${f.producto}'` : ''}
  GROUP BY hcp_id
),
last_visit AS (
  SELECT hcp_id, now()::date - MAX(visited_at)::date AS days_since_visit
  FROM visits WHERE status = 'completed'
  GROUP BY hcp_id
)`

function filaMedico(m: MedicoCRM, ctx: Contexto, producto?: ProductoId): Fila {
  return {
    medicoId: m.id,
    medico: m.nombre,
    especialidad: m.especialidad,
    categoria: m.categoria,
    apm: apmPorId(m.apmId).nombre,
    variacion: variacion(m, producto),
    dias: diasSinVisita(m, ctx.registros),
    recetas: recetasTrimestre(m, producto).actual,
    muestras: muestras90(m.id, ctx.entregas),
    share: participacion(m, producto),
  }
}

function lista(nombres: string[]) {
  if (nombres.length <= 1) return nombres.join('')
  return `${nombres.slice(0, -1).join(', ')} y ${nombres[nombres.length - 1]}`
}

export function responder(pregunta: string, ctx: Contexto): RespuestaCurator {
  const n = normalizar(pregunta)
  const f = leerFiltros(n)
  const base = aplicarFiltros(f)
  const chips = chipsFiltros(f)
  const donde = whereSql(f)
  const fuentesRx = ['Auditoría de prescripciones · mensual', 'Visitas del CRM · tiempo real']

  const caida = /(baj|cay|caid|disminu|perdi|descend|redujer|menos recet|empeor)/.test(n)
  const sinVisita = /(no (fueron|han sido|son|se) (visitad|vis)|sin visita|no (los |las )?visit|no (se )?(los |las )?ve|desatendid|abandonad|no recib\w+ visita|hace mas de|no se visitan)/.test(n)
  const muestras = /muestra/.test(n)
  const sinRetorno = /(no (aumentaron|subieron|crecieron|recetan|prescrib)|sin (aumento|retorno|recetas|prescrip)|retorno|roi|rindi|conviert|pero no)/.test(n)
  const top = /(mayor(es)? prescript|top|mejores prescript|principales prescript|quien(es)? (mas|receta)|mas recet|ranking de medicos)/.test(n)
  const crecimiento = /(crec|subi|aument|mejoraron|creci)/.test(n)
  const equipoQ = /(\bapm\b|apms|visitador|representante|equipo|cobertura de visita|frecuencia|cumplimiento|desempe)/.test(n)
  const objeciones = /(objeci|feedback|barrera|motivo|que (dicen|opinan)|comentari)/.test(n)
  const share = /(participacion|share|mercado)/.test(n)

  // 1 · Caída de prescripción sin visita reciente
  if ((caida && sinVisita) || (caida && /visit/.test(n))) {
    const umbral = f.dias ?? 30
    const filas = base
      .map((m) => filaMedico(m, ctx, f.producto))
      .filter((r) => (r.variacion as number) < -0.05 && (r.dias as number) > umbral)
      .sort((a, b) => (a.variacion as number) - (b.variacion as number))
    const perdidas = filas.reduce((a, r) => {
      const m = medicos.find((x) => x.id === r.medicoId)!
      const t = recetasTrimestre(m, f.producto)
      return a + (t.anterior - t.actual)
    }, 0)
    const catA = filas.filter((r) => r.categoria === 'A').length
    const peor = filas[0]
    return {
      entendida: true,
      interpretacion: [...chips, 'Recetas: último trimestre vs. anterior', `Sin visita hace más de ${umbral} días`],
      resumen: filas.length
        ? `**${filas.length} médicos** bajaron su prescripción y no reciben visita hace más de ${umbral} días. Juntos dejaron de emitir **${perdidas} recetas** en el trimestre${catA ? `, y **${catA}** son categoría A` : ''}. El caso más urgente es **${peor.medico}** (${peor.apm}): ${pct(peor.variacion as number)} y ${peor.dias} días sin visita.`
        : `No hay médicos que hayan bajado su prescripción y lleven más de ${umbral} días sin visita. La cartera está cubierta.`,
      destacados: filas.length
        ? [
            { valor: String(filas.length), etiqueta: 'médicos en riesgo' },
            { valor: `−${perdidas}`, etiqueta: 'recetas en el trimestre' },
            { valor: String(new Set(filas.map((r) => r.apm)).size), etiqueta: 'APM involucrados' },
          ]
        : [],
      columnas: [
        { clave: 'medico', titulo: 'Médico', tipo: 'medico' },
        { clave: 'categoria', titulo: 'Cat.', tipo: 'categoria' },
        { clave: 'apm', titulo: 'APM', tipo: 'apm' },
        { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
        { clave: 'dias', titulo: 'Sin visita', tipo: 'dias' },
      ],
      filas,
      grafico: filas.length ? { titulo: 'Variación de recetas', items: filas.slice(0, 8).map((r) => ({ etiqueta: String(r.medico), valor: r.variacion as number })), formato: 'pct' } : undefined,
      sql: `${cteRecetas(f)}
SELECT h.name, h.segment, r.name AS rep,
       rx.last_q::numeric / NULLIF(rx.prev_q, 0) - 1 AS rx_change,
       lv.days_since_visit
FROM hcp h
JOIN rx ON rx.hcp_id = h.id
JOIN reps r ON r.id = h.rep_id
LEFT JOIN last_visit lv ON lv.hcp_id = h.id
WHERE rx.last_q::numeric / NULLIF(rx.prev_q, 0) - 1 < -0.05
  AND COALESCE(lv.days_since_visit, 999) > ${umbral}${donde.map((d) => `\n  AND ${d.replace('rx.product_id', 'h.product_id')}`).join('')}
ORDER BY rx_change;`,
      fuentes: fuentesRx,
      accion: filas.length ? { texto: `Crear plan de visitas para ${filas.length} médicos`, medicos: filas.map((r) => r.medicoId!) } : undefined,
      sugerencias: ['¿Qué objeciones registraron estos médicos?', '¿Cómo viene la cobertura de visitas de cada APM?', '¿Qué médicos recibieron muestras pero no aumentaron sus recetas?'],
    }
  }

  // 2 · Muestras sin retorno
  if (muestras && sinRetorno) {
    const filas = base
      .map((m) => filaMedico(m, ctx, f.producto))
      .filter((r) => (r.muestras as number) >= 8 && (r.variacion as number) <= 0)
      .sort((a, b) => (b.muestras as number) - (a.muestras as number))
    const total = filas.reduce((a, r) => a + (r.muestras as number), 0)
    return {
      entendida: true,
      interpretacion: [...chips, 'Muestras entregadas en 90 días ≥ 8 u.', 'Recetas sin crecimiento'],
      resumen: filas.length
        ? `**${filas.length} médicos** recibieron **${total} muestras** en 90 días y sus recetas no crecieron. Conviene revisar el mensaje antes de seguir entregando: en ${filas.filter((r) => (r.variacion as number) < -0.1).length} de ellos la prescripción cayó más de 10 %.`
        : 'Todos los médicos que recibieron muestras en los últimos 90 días mantuvieron o aumentaron sus recetas.',
      destacados: filas.length
        ? [
            { valor: String(filas.length), etiqueta: 'médicos' },
            { valor: String(total), etiqueta: 'muestras sin retorno' },
          ]
        : [],
      columnas: [
        { clave: 'medico', titulo: 'Médico', tipo: 'medico' },
        { clave: 'apm', titulo: 'APM', tipo: 'apm' },
        { clave: 'muestras', titulo: 'Muestras 90 d', tipo: 'num' },
        { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
      ],
      filas,
      grafico: filas.length ? { titulo: 'Muestras entregadas en 90 días', items: filas.slice(0, 8).map((r) => ({ etiqueta: String(r.medico), valor: r.muestras as number })), formato: 'num' } : undefined,
      sql: `${cteRecetas(f)},
samples AS (
  SELECT hcp_id, SUM(quantity) AS units_90d
  FROM sample_deliveries
  WHERE delivered_at > now() - interval '90 days'
  GROUP BY hcp_id
)
SELECT h.name, r.name AS rep, s.units_90d,
       rx.last_q::numeric / NULLIF(rx.prev_q, 0) - 1 AS rx_change
FROM hcp h
JOIN samples s ON s.hcp_id = h.id
JOIN rx ON rx.hcp_id = h.id
JOIN reps r ON r.id = h.rep_id
WHERE s.units_90d >= 8
  AND rx.last_q <= rx.prev_q
ORDER BY s.units_90d DESC;`,
      fuentes: ['Trazabilidad de muestras · por lote', ...fuentesRx],
      sugerencias: ['¿Qué objeciones registraron estos médicos?', '¿Cuáles son los mayores prescriptores de Demo-molécula?'],
    }
  }

  // 3 · Médicos sin visita
  if (sinVisita) {
    const umbral = f.dias
    const filas = base
      .map((m) => filaMedico(m, ctx, f.producto))
      .filter((r) => (r.dias as number) > (umbral ?? umbralDias[r.categoria as Categoria]))
      .sort((a, b) => String(a.categoria).localeCompare(String(b.categoria)) || (b.dias as number) - (a.dias as number))
    return {
      entendida: true,
      interpretacion: [...chips, umbral ? `Sin visita hace más de ${umbral} días` : 'Frecuencia objetivo por categoría (A 30 · B 45 · C 60 días)'],
      resumen: filas.length
        ? `**${filas.length} médicos** están fuera de su frecuencia de visita. ${filas.filter((r) => r.categoria === 'A').length ? `**${filas.filter((r) => r.categoria === 'A').length}** son categoría A. ` : ''}El más atrasado es **${[...filas].sort((a, b) => (b.dias as number) - (a.dias as number))[0].medico}**, con ${Math.max(...filas.map((r) => r.dias as number))} días sin visita.`
        : 'Todos los médicos del filtro están dentro de su frecuencia de visita.',
      destacados: filas.length ? [{ valor: String(filas.length), etiqueta: 'médicos atrasados' }] : [],
      columnas: [
        { clave: 'medico', titulo: 'Médico', tipo: 'medico' },
        { clave: 'categoria', titulo: 'Cat.', tipo: 'categoria' },
        { clave: 'apm', titulo: 'APM', tipo: 'apm' },
        { clave: 'dias', titulo: 'Sin visita', tipo: 'dias' },
        { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
      ],
      filas,
      sql: `${cteRecetas(f)}
SELECT h.name, h.segment, r.name AS rep, lv.days_since_visit
FROM hcp h
JOIN reps r ON r.id = h.rep_id
LEFT JOIN last_visit lv ON lv.hcp_id = h.id
JOIN visit_frequency vf ON vf.segment = h.segment
WHERE COALESCE(lv.days_since_visit, 999) > ${umbral ?? 'vf.max_days'}${donde.filter((d) => !d.startsWith('rx')).map((d) => `\n  AND ${d}`).join('')}
ORDER BY h.segment, lv.days_since_visit DESC;`,
      fuentes: ['Visitas del CRM · tiempo real', 'Segmentación de médicos'],
      accion: filas.length ? { texto: `Crear plan de visitas para ${filas.length} médicos`, medicos: filas.map((r) => r.medicoId!) } : undefined,
      sugerencias: ['¿Qué médicos bajaron su prescripción y no fueron visitados?', '¿Cómo viene la cobertura de visitas de cada APM?'],
    }
  }

  // 4 · Desempeño del equipo
  if (equipoQ && !objeciones) {
    const hoy = visitasDeHoy(ctx.registros)
    const limite = haceDias(90, 0)
    const filas: Fila[] = equipo
      .filter((a) => !f.zona || a.zona === f.zona)
      .map((a) => {
        const cartera = medicos.filter((m) => m.apmId === a.id && (!f.producto || m.productos.includes(f.producto)))
        const cubiertos = cartera.filter((m) => diasSinVisita(m, ctx.registros) <= umbralDias[m.categoria]).length
        const hechas = cartera.reduce((acc, m) => acc + visitas90(m, ctx.registros), 0)
        const plan = cartera.reduce((acc, m) => acc + objetivo90[m.categoria], 0)
        const actual = cartera.reduce((acc, m) => acc + recetasTrimestre(m, f.producto).actual, 0)
        const anterior = cartera.reduce((acc, m) => acc + recetasTrimestre(m, f.producto).anterior, 0)
        const voz = [...historialVisitas.filter((v) => v.apmId === a.id && v.fecha >= limite), ...hoy.filter((v) => v.apmId === a.id)].filter((v) => v.origen === 'voz').length
        return { apm: a.nombre, zona: a.zona, medicos: cartera.length, cobertura: cubiertos / cartera.length, cumplimiento: hechas / plan, variacion: anterior ? actual / anterior - 1 : 0, voz }
      })
      .sort((a, b) => b.cobertura - a.cobertura)
    const mejor = filas[0]
    const peor = filas[filas.length - 1]
    return {
      entendida: true,
      interpretacion: [...chips, 'Cobertura: médicos dentro de su frecuencia', 'Cumplimiento: visitas 90 d vs. plan'],
      resumen: `**${mejor.apm}** lidera la cobertura con **${Math.round((mejor.cobertura as number) * 100)} %** de su cartera al día. En el otro extremo, **${peor.apm}** tiene ${Math.round((peor.cobertura as number) * 100)} % y su territorio ${(peor.variacion as number) < 0 ? `pierde ${Math.abs(Math.round((peor.variacion as number) * 100))} % de recetas` : `igual crece ${Math.round((peor.variacion as number) * 100)} %`}.`,
      destacados: filas.map((r) => ({ valor: `${Math.round((r.cobertura as number) * 100)} %`, etiqueta: String(r.apm).split(' ')[0] })),
      columnas: [
        { clave: 'apm', titulo: 'APM', tipo: 'apm' },
        { clave: 'zona', titulo: 'Zona', tipo: 'texto' },
        { clave: 'medicos', titulo: 'Médicos', tipo: 'num' },
        { clave: 'cobertura', titulo: 'Cobertura', tipo: 'pct' },
        { clave: 'cumplimiento', titulo: 'Cumplimiento', tipo: 'pct' },
        { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
      ],
      filas,
      grafico: { titulo: 'Cobertura de cartera', items: filas.map((r) => ({ etiqueta: String(r.apm), valor: r.cobertura as number })), formato: 'pct' },
      sql: `${cteRecetas(f)}
SELECT r.name AS rep, r.territory,
       COUNT(h.id) AS hcps,
       AVG((COALESCE(lv.days_since_visit, 999) <= vf.max_days)::int) AS coverage,
       SUM(v90.visits)::numeric / SUM(vf.visits_90d) AS plan_attainment,
       SUM(rx.last_q)::numeric / NULLIF(SUM(rx.prev_q), 0) - 1 AS rx_change
FROM reps r
JOIN hcp h ON h.rep_id = r.id
JOIN visit_frequency vf ON vf.segment = h.segment
LEFT JOIN last_visit lv ON lv.hcp_id = h.id
LEFT JOIN visits_90d v90 ON v90.hcp_id = h.id
LEFT JOIN rx ON rx.hcp_id = h.id
GROUP BY r.name, r.territory
ORDER BY coverage DESC;`,
      fuentes: ['Visitas del CRM · tiempo real', 'Plan de ciclo por categoría', 'Auditoría de prescripciones · mensual'],
      sugerencias: [`¿Qué médicos de ${String(peor.apm).split(' ')[0]} no se visitan hace más de 30 días?`, '¿Qué médicos bajaron su prescripción y no fueron visitados?'],
    }
  }

  // 5 · Objeciones
  if (objeciones) {
    const limite = haceDias(90, 0)
    const ids = new Set(base.map((m) => m.id))
    const visitas = [...historialVisitas.filter((v) => v.fecha >= limite), ...visitasDeHoy(ctx.registros)].filter(
      (v) => ids.has(v.medicoId) && (!f.producto || v.productos.includes(f.producto)),
    )
    const conteo = new Map<string, number>()
    for (const v of visitas) for (const e of v.etiquetas) conteo.set(e, (conteo.get(e) ?? 0) + 1)
    const filas: Fila[] = [...conteo]
      .map(([etiqueta, veces]) => ({ etiqueta, veces, share: veces / visitas.length }))
      .sort((a, b) => b.veces - a.veces)
    const obj = filas.filter((r) => String(r.etiqueta).startsWith('Objeción'))
    return {
      entendida: true,
      interpretacion: [...chips, 'Últimos 90 días', `${visitas.length} visitas con feedback`],
      resumen: obj.length
        ? `La objeción más frecuente es **${String(obj[0].etiqueta).replace('Objeción de ', '').toLowerCase()}**: aparece en **${Math.round((obj[0].share as number) * 100)} %** de las visitas${f.producto ? ` de ${productos[f.producto].marca}` : ''}. ${filas[0].etiqueta !== obj[0].etiqueta ? `Aun así, lo más registrado es “${filas[0].etiqueta}”.` : ''} Una parte llega de reportes por voz, sin carga manual.`
        : 'No se registraron objeciones en el período.',
      destacados: filas.slice(0, 3).map((r) => ({ valor: `${Math.round((r.share as number) * 100)} %`, etiqueta: String(r.etiqueta) })),
      columnas: [
        { clave: 'etiqueta', titulo: 'Feedback', tipo: 'texto' },
        { clave: 'veces', titulo: 'Visitas', tipo: 'num' },
        { clave: 'share', titulo: '% de visitas', tipo: 'pct' },
      ],
      filas,
      grafico: { titulo: 'Feedback registrado', items: filas.map((r) => ({ etiqueta: String(r.etiqueta), valor: r.share as number })), formato: 'pct' },
      sql: `SELECT t.tag, COUNT(*) AS visits,
       COUNT(*)::numeric / SUM(COUNT(*)) OVER () AS share
FROM visits v
CROSS JOIN LATERAL unnest(v.tags) AS t(tag)
JOIN hcp h ON h.id = v.hcp_id
WHERE v.visited_at > now() - interval '90 days'${f.producto ? `\n  AND '${f.producto}' = ANY(v.products)` : ''}${donde.filter((d) => !d.startsWith('rx')).map((d) => `\n  AND ${d}`).join('')}
GROUP BY t.tag
ORDER BY visits DESC;`,
      fuentes: ['Visitas del CRM · etiquetas', 'Reportes por voz · entidades extraídas'],
      sugerencias: ['¿Qué médicos bajaron su prescripción y no fueron visitados?', '¿Cuáles son los mayores prescriptores de Respira-mol?'],
    }
  }

  // 6 · Mayores prescriptores / crecimiento / caída / participación
  if (top || crecimiento || caida || share || muestras) {
    const modo = caida ? 'caida' : crecimiento ? 'crecimiento' : share ? 'share' : muestras ? 'muestras' : 'top'
    let filas = base.map((m) => filaMedico(m, ctx, f.producto))
    if (modo === 'caida') filas = filas.filter((r) => (r.variacion as number) < -0.05).sort((a, b) => (a.variacion as number) - (b.variacion as number))
    if (modo === 'crecimiento') filas = filas.filter((r) => (r.variacion as number) > 0.05).sort((a, b) => (b.variacion as number) - (a.variacion as number))
    if (modo === 'top') filas = filas.sort((a, b) => (b.recetas as number) - (a.recetas as number)).slice(0, 10)
    if (modo === 'share') filas = filas.sort((a, b) => (b.share as number) - (a.share as number)).slice(0, 10)
    if (modo === 'muestras') filas = filas.filter((r) => (r.muestras as number) > 0).sort((a, b) => (b.muestras as number) - (a.muestras as number)).slice(0, 10)
    const total = filas.reduce((a, r) => a + (r.recetas as number), 0)
    const marca = f.producto ? productos[f.producto].marca : 'la cartera'
    const titulos = {
      top: `Los **${filas.length} mayores prescriptores** de ${marca} emitieron **${total} recetas** en el último trimestre. Encabeza **${filas[0]?.medico}** con ${filas[0]?.recetas}.`,
      crecimiento: `**${filas.length} médicos** aumentaron su prescripción de ${marca} más de 5 %. El mayor crecimiento es de **${filas[0]?.medico}** (${pct((filas[0]?.variacion as number) ?? 0)}).`,
      caida: `**${filas.length} médicos** bajaron su prescripción de ${marca} más de 5 %. La mayor caída es de **${filas[0]?.medico}** (${pct((filas[0]?.variacion as number) ?? 0)}), sin visita hace ${filas[0]?.dias} días.`,
      share: `**${filas[0]?.medico}** tiene la mayor participación de ${marca} en su clase: **${Math.round(((filas[0]?.share as number) ?? 0) * 100)} %** de sus recetas.`,
      muestras: `Estos son los **${filas.length} médicos** que más muestras recibieron en 90 días. Encabeza **${filas[0]?.medico}** con ${filas[0]?.muestras} unidades.`,
    }
    const metrica: Record<typeof modo, Columna> = {
      top: { clave: 'recetas', titulo: 'Recetas trim.', tipo: 'num' },
      crecimiento: { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
      caida: { clave: 'variacion', titulo: 'Recetas', tipo: 'variacion' },
      share: { clave: 'share', titulo: 'Participación', tipo: 'pct' },
      muestras: { clave: 'muestras', titulo: 'Muestras 90 d', tipo: 'num' },
    }
    const clave = metrica[modo].clave
    return {
      entendida: true,
      interpretacion: [...chips, modo === 'muestras' ? 'Últimos 90 días' : 'Último trimestre cerrado'],
      resumen: filas.length ? titulos[modo] : 'No hay médicos que cumplan esa condición con los filtros actuales.',
      destacados: [],
      columnas: [
        { clave: 'medico', titulo: 'Médico', tipo: 'medico' },
        { clave: 'categoria', titulo: 'Cat.', tipo: 'categoria' },
        { clave: 'apm', titulo: 'APM', tipo: 'apm' },
        metrica[modo],
        ...(modo === 'top' ? [{ clave: 'variacion', titulo: 'Variación', tipo: 'variacion' as const }] : modo === 'caida' ? [{ clave: 'dias', titulo: 'Sin visita', tipo: 'dias' as const }] : []),
      ],
      filas,
      grafico: filas.length
        ? { titulo: metrica[modo].titulo, items: filas.slice(0, 8).map((r) => ({ etiqueta: String(r.medico), valor: r[clave] as number })), formato: metrica[modo].tipo === 'num' ? 'num' : 'pct' }
        : undefined,
      sql:
        modo === 'muestras'
          ? `SELECT h.name, r.name AS rep, SUM(sd.quantity) AS units_90d
FROM sample_deliveries sd
JOIN hcp h ON h.id = sd.hcp_id
JOIN reps r ON r.id = h.rep_id
WHERE sd.delivered_at > now() - interval '90 days'
GROUP BY h.name, r.name
ORDER BY units_90d DESC
LIMIT 10;`
          : `${cteRecetas(f)}
SELECT h.name, h.segment, r.name AS rep, rx.last_q,
       rx.last_q::numeric / NULLIF(rx.prev_q, 0) - 1 AS rx_change
FROM hcp h
JOIN rx ON rx.hcp_id = h.id
JOIN reps r ON r.id = h.rep_id${donde.filter((d) => !d.startsWith('rx')).length ? `\nWHERE ${donde.filter((d) => !d.startsWith('rx')).join('\n  AND ')}` : ''}
ORDER BY ${modo === 'top' ? 'rx.last_q DESC\nLIMIT 10' : modo === 'crecimiento' ? 'rx_change DESC' : modo === 'share' ? 'share DESC\nLIMIT 10' : 'rx_change'};`,
      fuentes: modo === 'muestras' ? ['Trazabilidad de muestras · por lote'] : fuentesRx,
      accion: modo === 'caida' && filas.length ? { texto: `Crear plan de visitas para ${filas.length} médicos`, medicos: filas.map((r) => r.medicoId!) } : undefined,
      sugerencias:
        modo === 'top'
          ? ['¿Qué médicos bajaron su prescripción y no fueron visitados?', `¿Cuáles son las objeciones más frecuentes de ${f.producto ? productos[f.producto].marca : 'Demo-molécula'}?`]
          : ['¿Qué médicos recibieron muestras pero no aumentaron sus recetas?', '¿Cómo viene la cobertura de visitas de cada APM?'],
    }
  }

  return {
    entendida: false,
    interpretacion: chips,
    resumen: `Todavía no sé responder esa pregunta con los datos conectados. Puedo analizar **prescripción**, **visitas y cobertura**, **muestras entregadas** y **feedback de los médicos**${lista(chips).length ? `, filtrando por ${lista(chips.map((c) => c.toLowerCase()))}` : ''}.`,
    destacados: [],
    columnas: [],
    filas: [],
    sql: '',
    fuentes: [],
    sugerencias: preguntasEjemplo.slice(0, 3),
  }
}
