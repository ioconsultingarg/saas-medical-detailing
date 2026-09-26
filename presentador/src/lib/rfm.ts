import {
  diasSinVisita,
  medicos,
  muestras90,
  objetivo90,
  recetasTrimestre,
  variacion,
  visitas90,
  type Categoria,
  type MedicoCRM,
} from '../data/crm'
import type { EntregaMuestra, RegistroVisita } from '../types'

/*
 * Segmentación RFM adaptada a la visita médica:
 *  R (recencia)   · hace cuánto no se lo visita
 *  F (frecuencia) · visitas de los últimos 90 días contra el objetivo de su categoría
 *  M (valor)      · recetas del último trimestre, comparadas con el resto de la cartera
 *
 * La sugerencia de categoría nunca se aplica sola: la aprueba una persona, porque define
 * la carga de trabajo del equipo.
 */

export type Segmento = 'campeon' | 'riesgo' | 'crecimiento' | 'dormido' | 'mantener'

export interface Analisis {
  medico: MedicoCRM
  r: number
  f: number
  m: number
  segmento: Segmento
  actual: Categoria
  sugerida: Categoria
  motivo: string
  recetas: number
  dias: number
  visitas: number
  muestras: number
  variacion: number
}

export const etiquetaSegmento: Record<Segmento, string> = {
  campeon: 'Campeón',
  riesgo: 'En riesgo',
  crecimiento: 'En crecimiento',
  dormido: 'Dormido',
  mantener: 'Estable',
}

export const descripcionSegmento: Record<Segmento, string> = {
  campeon: 'Mucho volumen y visita al día. Sostener la frecuencia.',
  riesgo: 'Prescribe bastante pero hace mucho que no se lo visita.',
  crecimiento: 'Viene subiendo: conviene acompañarlo con más frecuencia.',
  dormido: 'Poco volumen y sin contacto reciente.',
  mantener: 'Sin señales que obliguen a cambiar nada.',
}

function puntajeRecencia(dias: number) {
  if (dias <= 15) return 5
  if (dias <= 30) return 4
  if (dias <= 45) return 3
  if (dias <= 60) return 2
  return 1
}

function puntajeFrecuencia(hechas: number, objetivo: number) {
  const ratio = objetivo > 0 ? hechas / objetivo : 0
  if (ratio >= 1) return 5
  if (ratio >= 0.75) return 4
  if (ratio >= 0.5) return 3
  if (ratio >= 0.25) return 2
  return 1
}

/** El valor se mide contra el resto de la cartera, no contra un número fijo */
function puntajeValor(recetas: number, ordenadas: number[]) {
  if (ordenadas.length === 0) return 1
  const posicion = ordenadas.filter((x) => x <= recetas).length / ordenadas.length
  if (posicion >= 0.8) return 5
  if (posicion >= 0.6) return 4
  if (posicion >= 0.4) return 3
  if (posicion >= 0.2) return 2
  return 1
}

function clasificar(r: number, m: number, v: number): Segmento {
  if (m >= 4 && r >= 4) return 'campeon'
  if (m >= 4 && r <= 2) return 'riesgo'
  if (v >= 0.1 && m >= 2) return 'crecimiento'
  if (m <= 2 && r <= 2) return 'dormido'
  return 'mantener'
}

const orden: Categoria[] = ['C', 'B', 'A']

export interface ContextoRfm {
  registros: Record<string, RegistroVisita>
  entregas: EntregaMuestra[]
  categorias: Record<string, Categoria>
}

export function analizar(ctx: ContextoRfm): Analisis[] {
  const valores = medicos.map((m) => recetasTrimestre(m).actual).sort((a, b) => a - b)

  return medicos.map((medico) => {
    const dias = diasSinVisita(medico, ctx.registros)
    const visitas = visitas90(medico, ctx.registros)
    const recetas = recetasTrimestre(medico).actual
    const v = variacion(medico)
    const actual = ctx.categorias[medico.id] ?? medico.categoria

    const r = puntajeRecencia(dias)
    const f = puntajeFrecuencia(visitas, objetivo90[actual])
    const m = puntajeValor(recetas, valores)
    const segmento = clasificar(r, m, v)

    let sugerida: Categoria = m >= 4 ? 'A' : m === 3 ? 'B' : 'C'
    let motivo = ''
    if (sugerida === actual) {
      motivo = descripcionSegmento[segmento]
    } else if (orden.indexOf(sugerida) > orden.indexOf(actual)) {
      motivo = `Emite ${recetas} recetas en el trimestre${v > 0.05 ? ` y creció ${Math.round(v * 100)} %` : ''}: está por encima de lo que espera su categoría.`
    } else {
      // a alguien que viene creciendo no se lo baja de categoría
      if (v >= 0.15) {
        sugerida = actual
        motivo = `Su volumen es bajo para la categoría ${actual}, pero creció ${Math.round(v * 100)} %: conviene sostenerlo un ciclo más.`
      } else {
        motivo = `Emite ${recetas} recetas en el trimestre: queda por debajo de lo que exige la categoría ${actual}.`
      }
    }

    return {
      medico,
      r,
      f,
      m,
      segmento,
      actual,
      sugerida,
      motivo,
      recetas,
      dias,
      visitas,
      muestras: muestras90(medico.id, ctx.entregas),
      variacion: v,
    }
  })
}

export function propuestas(analisis: Analisis[]) {
  return analisis.filter((a) => a.sugerida !== a.actual).sort((a, b) => b.recetas - a.recetas)
}
