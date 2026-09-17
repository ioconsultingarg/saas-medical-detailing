import type { EntregaMuestra, EstadoFirma, ProductoId, RegistroVisita } from '../types'
import { visitasDelDia } from './agenda'

/*
 * Fichero médico de la demo: 36 profesionales ficticios repartidos en 4 territorios.
 * Las recetas simulan una auditoría de prescripciones mensual (tipo Close-Up / IQVIA).
 * Todo se genera con una semilla fija: la demo muestra siempre los mismos datos.
 */

export type Categoria = 'A' | 'B' | 'C'
export type Zona = 'Norte' | 'Centro' | 'Oeste' | 'Sur'

export interface Apm {
  id: string
  nombre: string
  zona: Zona
}

export const equipo: Apm[] = [
  { id: 'apm1', nombre: 'Lucía Romero', zona: 'Norte' },
  { id: 'apm2', nombre: 'Diego Salas', zona: 'Centro' },
  { id: 'apm3', nombre: 'Mariana Costa', zona: 'Oeste' },
  { id: 'apm4', nombre: 'Tomás Herrera', zona: 'Sur' },
]

/** La sesión de la demo corresponde a Lucía Romero */
export const APM_ACTUAL = 'apm1'

export interface MedicoCRM {
  id: string
  nombre: string
  especialidad: string
  matricula: string
  categoria: Categoria
  institucion: string
  barrio: string
  zona: Zona
  apmId: string
  telefono: string
  email: string
  consentimiento: { whatsapp: boolean; email: boolean }
  productos: ProductoId[]
  /** recetas mensuales por producto, 6 meses cerrados (el último es el mes anterior) */
  recetas: Partial<Record<ProductoId, number[]>>
  /** recetas de toda la clase terapéutica, para calcular participación */
  mercado: Partial<Record<ProductoId, number[]>>
  /** días desde la última visita previa a hoy */
  diasSinVisita: number
}

export interface VisitaHistorica {
  id: string
  medicoId: string
  fecha: number
  apmId: string
  productos: ProductoId[]
  calificacion: number
  etiquetas: string[]
  nota: string
  muestras: number
  origen: 'manual' | 'voz'
  hoy?: boolean
}

type Semilla = [id: string, nombre: string, especialidad: string, categoria: Categoria, barrio: string, apm: number, productos: 'c' | 'r' | 'cr', tendencia: number, dias: number, institucion?: string]

const semillas: Semilla[] = [
  // Lucía Romero · Zona Norte (los 8 primeros están en la agenda de hoy)
  ['m1', 'Dra. Laura Méndez', 'Cardiología', 'A', 'Palermo', 0, 'c', 0.12, 14],
  ['m2', 'Dr. Martín Ibarra', 'Neumonología', 'A', 'Recoleta', 0, 'r', 0.18, 16],
  ['m3', 'Dra. Sofía Guerrero', 'Clínica médica', 'B', 'Barrio Norte', 0, 'cr', -0.07, 15],
  ['m4', 'Dr. Pablo Ferreyra', 'Cardiología', 'A', 'Belgrano', 0, 'c', -0.14, 21],
  ['m5', 'Dra. Valeria Ríos', 'Neumonología', 'B', 'Colegiales', 0, 'r', 0.05, 30],
  ['m6', 'Dr. Esteban Navarro', 'Medicina interna', 'B', 'Núñez', 0, 'cr', 0.09, 28],
  ['m7', 'Dra. Carolina Paz', 'Cardiología', 'A', 'Villa Urquiza', 0, 'c', 0.02, 13],
  ['m8', 'Dr. Julián Acosta', 'Alergia e inmunología', 'C', 'Saavedra', 0, 'r', -0.03, 44],
  ['m9', 'Dr. Ricardo Olmos', 'Cardiología', 'A', 'Belgrano', 0, 'c', -0.24, 52, 'Sanatorio Belgrano'],
  ['m10', 'Dra. Inés Carranza', 'Neumonología', 'B', 'Palermo', 0, 'r', -0.19, 12, 'Hospital Privado Palermo'],
  ['m11', 'Dr. Hernán Vidal', 'Clínica médica', 'C', 'Coghlan', 0, 'cr', 0.04, 39, 'Consultorio Coghlan'],
  ['m12', 'Dra. Mónica Suárez', 'Medicina interna', 'B', 'Villa Crespo', 0, 'cr', 0.01, 41, 'Centro Médico Villa Crespo'],
  // Diego Salas · Zona Centro
  ['m13', 'Dra. Graciela Ponce', 'Cardiología', 'A', 'Caballito', 1, 'c', 0.08, 9, 'Clínica Caballito'],
  ['m14', 'Dr. Alejandro Funes', 'Cardiología', 'A', 'Almagro', 1, 'c', -0.31, 64, 'Instituto del Corazón Almagro'],
  ['m15', 'Dra. Natalia Brizuela', 'Neumonología', 'B', 'Balvanera', 1, 'r', 0.14, 18, 'Hospital de Clínicas'],
  ['m16', 'Dr. Sergio Lamas', 'Clínica médica', 'B', 'San Nicolás', 1, 'cr', -0.22, 11, 'Centro Médico Tribunales'],
  ['m17', 'Dra. Paula Etchegaray', 'Medicina interna', 'C', 'Monserrat', 1, 'cr', 0.03, 27, 'Consultorio Monserrat'],
  ['m18', 'Dr. Gustavo Quiroga', 'Neumonología', 'A', 'San Telmo', 1, 'r', 0.21, 6, 'Centro Respiratorio San Telmo'],
  ['m19', 'Dra. Cecilia Montero', 'Cardiología', 'B', 'Caballito', 1, 'c', -0.12, 38, 'Consultorios Primera Junta'],
  ['m20', 'Dr. Fabián Rossi', 'Alergia e inmunología', 'C', 'Almagro', 1, 'r', -0.04, 58, 'Consultorio Almagro'],
  // Mariana Costa · Zona Oeste
  ['m21', 'Dr. Leandro Giménez', 'Cardiología', 'A', 'Flores', 2, 'c', 0.17, 7, 'Sanatorio Flores'],
  ['m22', 'Dra. Romina Aguirre', 'Neumonología', 'A', 'Floresta', 2, 'r', -0.06, 14, 'Clínica Floresta'],
  ['m23', 'Dr. Claudio Benítez', 'Cardiología', 'B', 'Villa Luro', 2, 'c', -0.18, 45, 'Centro Cardiológico Oeste'],
  ['m24', 'Dra. Andrea Villalba', 'Clínica médica', 'B', 'Liniers', 2, 'cr', 0.09, 22, 'Policlínico Liniers'],
  ['m25', 'Dr. Marcelo Toledo', 'Medicina interna', 'C', 'Mataderos', 2, 'cr', 0.01, 61, 'Consultorio Mataderos'],
  ['m26', 'Dra. Florencia Sosa', 'Neumonología', 'B', 'Villa del Parque', 2, 'r', -0.26, 19, 'Hospital Privado Devoto'],
  ['m27', 'Dr. Raúl Medina', 'Cardiología', 'A', 'Flores', 2, 'c', -0.09, 36, 'Instituto Cardiovascular Flores'],
  ['m28', 'Dra. Silvina Ledesma', 'Alergia e inmunología', 'C', 'Floresta', 2, 'r', 0.12, 29, 'Consultorio Floresta'],
  // Tomás Herrera · Zona Sur
  ['m29', 'Dra. Mariela Correa', 'Cardiología', 'A', 'Barracas', 3, 'c', -0.2, 8, 'Clínica Barracas'],
  ['m30', 'Dr. Nicolás Peralta', 'Neumonología', 'B', 'Parque Patricios', 3, 'r', 0.06, 16, 'Hospital Parque Patricios'],
  ['m31', 'Dr. Oscar Domínguez', 'Cardiología', 'A', 'Boedo', 3, 'c', -0.27, 71, 'Sanatorio Boedo'],
  ['m32', 'Dra. Lorena Ibáñez', 'Clínica médica', 'C', 'Pompeya', 3, 'cr', 0.04, 49, 'Consultorio Pompeya'],
  ['m33', 'Dr. Federico Castro', 'Medicina interna', 'B', 'Constitución', 3, 'cr', 0.19, 12, 'Centro Médico Constitución'],
  ['m34', 'Dra. Verónica Molina', 'Neumonología', 'A', 'La Boca', 3, 'r', -0.15, 33, 'Centro Respiratorio Sur'],
  ['m35', 'Dr. Daniel Ortiz', 'Cardiología', 'B', 'Barracas', 3, 'c', 0.02, 25, 'Consultorios Barracas'],
  ['m36', 'Dra. Julieta Cabrera', 'Alergia e inmunología', 'C', 'Boedo', 3, 'r', -0.11, 20, 'Consultorio Boedo'],
]

function aleatorio(semilla: number) {
  let a = semilla >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hash(texto: string) {
  let h = 2166136261
  for (let i = 0; i < texto.length; i++) h = Math.imul(h ^ texto.charCodeAt(i), 16777619)
  return h >>> 0
}

const volumenBase: Record<Categoria, number> = { A: 38, B: 20, C: 9 }
const participacionBase: Record<Categoria, number> = { A: 0.27, B: 0.19, C: 0.1 }

export const medicos: MedicoCRM[] = semillas.map(([id, nombre, especialidad, categoria, barrio, apm, cod, tendencia, dias, institucion], i) => {
  const r = aleatorio(hash(id))
  const productos: ProductoId[] = cod === 'cr' ? ['cardio', 'respira'] : cod === 'c' ? ['cardio'] : ['respira']
  const recetas: MedicoCRM['recetas'] = {}
  const mercado: MedicoCRM['mercado'] = {}
  for (const p of productos) {
    const base = volumenBase[categoria] * (cod === 'cr' ? 0.6 : 1) * (0.85 + r() * 0.3)
    const serie = Array.from({ length: 6 }, (_, mes) => {
      // los 3 meses previos rondan la base; los 3 últimos llevan la tendencia de forma gradual
      const factor = mes < 3 ? 1 : 1 + tendencia * (0.55 + (mes - 3) * 0.3)
      return Math.max(1, Math.round(base * factor * (0.95 + r() * 0.1)))
    })
    recetas[p] = serie
    const share = participacionBase[categoria] * (0.85 + r() * 0.3)
    mercado[p] = serie.map((v, mes) => Math.round((mes < 3 ? v : v / (1 + tendencia * 0.6)) / share))
  }
  const visita = visitasDelDia.find((v) => v.medicoId === id)
  const n = String(i + 1).padStart(2, '0')
  return {
    id,
    nombre,
    especialidad,
    matricula: `MN ${String(84000 + hash(id) % 15000)}`,
    categoria,
    institucion: visita?.consultorio ?? institucion ?? `Consultorio ${barrio}`,
    barrio,
    zona: equipo[apm].zona,
    apmId: equipo[apm].id,
    telefono: visita?.medico.telefono ?? `+54911555502${n}`,
    email: visita?.medico.email ?? `${nombre.split(' ')[1][0].toLowerCase()}${nombre.split(' ').slice(-1)[0].toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')}@ejemplo.com`,
    consentimiento: { whatsapp: r() > 0.25, email: r() > 0.1 },
    productos,
    recetas,
    mercado,
    diasSinVisita: dias,
  }
})

export const medicoPorId: Record<string, MedicoCRM> = Object.fromEntries(medicos.map((m) => [m.id, m]))

/* ---------- Tiempo ---------- */

const DIA = 86400000

function inicioDeHoy() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function haceDias(dias: number, hora = 10) {
  return inicioDeHoy() - dias * DIA + hora * 3600000
}

const fmtMes = new Intl.DateTimeFormat('es-AR', { month: 'short' })
/** Etiquetas de los 6 meses cerrados de la auditoría */
export const mesesAuditoria = Array.from({ length: 6 }, (_, i) => {
  const d = new Date()
  d.setDate(1)
  d.setMonth(d.getMonth() - 6 + i)
  return fmtMes.format(d).replace('.', '')
})

/* ---------- Historial de visitas y entregas de muestras ---------- */

const notasPool: Record<ProductoId, string[]> = {
  cardio: [
    'Repasamos el estudio a 52 semanas; pidió la separata.',
    'Consultó por pacientes diabéticos con LDL fuera de meta.',
    'Mostró interés en el perfil de seguridad hepática.',
    'Comparó con la estatina que indica hoy; quedó en probar.',
    'Pidió material para pacientes sobre adherencia.',
  ],
  respira: [
    'Revisamos técnica inhalatoria en adultos mayores.',
    'Atiende muchos pacientes con EPOC moderada.',
    'Consultó por uso con aerocámara en pediatría.',
    'Pidió folletos de técnica para la sala de espera.',
    'Le interesó la reducción de rescates a 12 semanas.',
  ],
}

const etiquetasPositivas = ['Pidió estudios', 'Interesado en muestras', 'Volver en 15 días']
const etiquetasNegativas = ['Objeción de costo', 'Objeción de cobertura', 'Derivar a MSL', 'Pidió estudios']

const muestraDe: Record<ProductoId, { sku: string; lotes: [string, string][] }> = {
  cardio: { sku: 'DM-MM-7', lotes: [['DM2408A', '2027-08'], ['DM2403C', '2027-03']] },
  respira: { sku: 'RM-MM-60', lotes: [['RM2405B', '2027-05'], ['RM2311A', '2026-11']] },
}

const cadaDias: Record<Categoria, number> = { A: 15, B: 30, C: 45 }

export const historialVisitas: VisitaHistorica[] = []
export const entregasHistoricas: EntregaMuestra[] = []

for (const m of medicos) {
  const r = aleatorio(hash(`${m.id}-hist`))
  const tendencia = semillas.find((s) => s[0] === m.id)![7]
  let dias = m.diasSinVisita
  let n = 0
  while (dias <= 180 && n < 9) {
    const p = m.productos[Math.floor(r() * m.productos.length)]
    const negativa = tendencia < -0.1 ? r() < 0.65 : r() < 0.2
    const calificacion = negativa ? 2 + Math.round(r()) : 3 + Math.round(r() * 2)
    const pool = negativa ? etiquetasNegativas : etiquetasPositivas
    const etiquetas = [pool[Math.floor(r() * pool.length)]]
    const muestras = r() < (tendencia < -0.15 ? 0.8 : 0.55) ? 4 + Math.floor(r() * 7) : 0
    const id = `h-${m.id}-${n}`
    const fecha = haceDias(dias, 9 + Math.floor(r() * 8))
    historialVisitas.push({
      id,
      medicoId: m.id,
      fecha,
      apmId: m.apmId,
      productos: [p],
      calificacion,
      etiquetas,
      nota: notasPool[p][Math.floor(r() * notasPool[p].length)],
      muestras,
      origen: n === 0 && r() < 0.5 ? 'voz' : 'manual',
    })
    if (muestras > 0) {
      const [lote, vencimiento] = muestraDe[p].lotes[dias > 90 ? 1 : 0]
      const firma: EstadoFirma = r() < 0.85 ? 'digital' : 'papel'
      entregasHistoricas.push({ id: `e-${id}`, medicoId: m.id, visitaId: id, fecha, sku: muestraDe[p].sku, lote, vencimiento, cantidad: muestras, firma, sincronizado: true })
    }
    dias += cadaDias[m.categoria] + Math.round((r() - 0.5) * 10)
    n += 1
  }
}
historialVisitas.sort((a, b) => b.fecha - a.fecha)
entregasHistoricas.sort((a, b) => b.fecha - a.fecha)

/* ---------- Cálculos ---------- */

const suma = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Visitas de hoy cerradas en la demo, convertidas al formato del historial */
export function visitasDeHoy(registros: Record<string, RegistroVisita>): VisitaHistorica[] {
  return visitasDelDia
    .filter((v) => registros[v.id]?.estado === 'completada')
    .map((v) => {
      const reg = registros[v.id]
      return {
        id: v.id,
        medicoId: v.medicoId,
        fecha: reg.checkOut ?? Date.now(),
        apmId: APM_ACTUAL,
        productos: reg.productos?.length ? reg.productos : v.productosInteres,
        calificacion: reg.calificacion ?? 0,
        etiquetas: reg.etiquetas ?? [],
        nota: reg.nota || v.nota,
        muestras: reg.muestras ?? 0,
        origen: reg.origen ?? 'manual',
        hoy: true,
      }
    })
}

export function visitasDe(medicoId: string, registros: Record<string, RegistroVisita>) {
  return [...visitasDeHoy(registros).filter((v) => v.medicoId === medicoId), ...historialVisitas.filter((v) => v.medicoId === medicoId)]
}

export function diasSinVisita(m: MedicoCRM, registros: Record<string, RegistroVisita>) {
  const hoy = visitasDelDia.some((v) => v.medicoId === m.id && registros[v.id]?.estado === 'completada')
  return hoy ? 0 : m.diasSinVisita
}

export function visitas90(m: MedicoCRM, registros: Record<string, RegistroVisita>) {
  const limite = haceDias(90, 0)
  return visitasDe(m.id, registros).filter((v) => v.fecha >= limite).length
}

export const objetivo90: Record<Categoria, number> = { A: 6, B: 3, C: 2 }

export function recetasTrimestre(m: MedicoCRM, producto?: ProductoId) {
  const series = (producto ? [m.recetas[producto]] : Object.values(m.recetas)).filter((s): s is number[] => Boolean(s))
  return {
    actual: suma(series.map((s) => suma(s.slice(3)))),
    anterior: suma(series.map((s) => suma(s.slice(0, 3)))),
  }
}

/** Variación de recetas: último trimestre contra el anterior (−0,24 = −24 %) */
export function variacion(m: MedicoCRM, producto?: ProductoId) {
  const { actual, anterior } = recetasTrimestre(m, producto)
  return anterior > 0 ? actual / anterior - 1 : 0
}

export function participacion(m: MedicoCRM, producto?: ProductoId) {
  const ps = producto ? [producto] : m.productos
  const propias = suma(ps.map((p) => suma(m.recetas[p]?.slice(3) ?? [])))
  const clase = suma(ps.map((p) => suma(m.mercado[p]?.slice(3) ?? [])))
  return clase > 0 ? propias / clase : 0
}

export function entregasDe(medicoId: string, sesion: EntregaMuestra[]) {
  return [...sesion.filter((e) => e.medicoId === medicoId), ...entregasHistoricas.filter((e) => e.medicoId === medicoId)]
}

export function muestras90(medicoId: string, sesion: EntregaMuestra[]) {
  const limite = haceDias(90, 0)
  return suma(entregasDe(medicoId, sesion).filter((e) => e.fecha >= limite).map((e) => e.cantidad))
}

export const umbralDias: Record<Categoria, number> = { A: 30, B: 45, C: 60 }

export interface Prioridad {
  nivel: 'alta' | 'media' | 'normal'
  motivo: string
}

/** Señal simple para ordenar la cartera: caída de recetas + tiempo sin visita según categoría */
export function prioridad(m: MedicoCRM, dias: number): Prioridad {
  const v = variacion(m)
  const atrasada = dias > umbralDias[m.categoria]
  const pct = `${Math.round(Math.abs(v) * 100)} %`
  if (v <= -0.1 && atrasada) return { nivel: 'alta', motivo: `Bajó ${pct} y no se visita hace ${dias} días` }
  if (v <= -0.15) return { nivel: 'alta', motivo: `Bajó ${pct} en el último trimestre` }
  if (atrasada) return { nivel: 'media', motivo: `Sin visita hace ${dias} días (categoría ${m.categoria})` }
  if (v <= -0.05) return { nivel: 'media', motivo: `Bajó ${pct} en el último trimestre` }
  return { nivel: 'normal', motivo: v >= 0.05 ? `Creció ${Math.round(v * 100)} %` : 'Estable' }
}

export function apmPorId(id: string) {
  return equipo.find((a) => a.id === id) ?? equipo[0]
}

export function tratamiento(nombre: string) {
  return nombre.startsWith('Dra.') ? 'la doctora' : 'el doctor'
}

export function apellido(nombre: string) {
  return nombre.split(' ').slice(-1)[0]
}
