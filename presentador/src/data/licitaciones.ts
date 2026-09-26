import type { ProductoId } from '../types'
import { haceDias } from './crm'

/*
 * Licitaciones y compras institucionales. En la región es un canal grande para un
 * laboratorio mediano, y hoy se maneja con planillas y alarmas en el celular.
 */

export type EstadoLicitacion = 'deteccion' | 'preparacion' | 'presentada' | 'adjudicada' | 'perdida'

export interface Requisito {
  id: string
  texto: string
  listoInicial: boolean
}

export interface Licitacion {
  id: string
  organismo: string
  expediente: string
  objeto: string
  productos: ProductoId[]
  unidades: number
  monto: number
  responsable: string
  cuentaId?: string
  estadoInicial: EstadoLicitacion
  /** fechas clave del proceso */
  publicacion: number
  consultas: number
  apertura: number
  adjudicacion?: number
  nota?: string
  requisitos: Requisito[]
}

export const etiquetaLicitacion: Record<EstadoLicitacion, string> = {
  deteccion: 'Detectada',
  preparacion: 'En preparación',
  presentada: 'Presentada',
  adjudicada: 'Adjudicada',
  perdida: 'No adjudicada',
}

export const ordenEstados: EstadoLicitacion[] = ['deteccion', 'preparacion', 'presentada', 'adjudicada', 'perdida']

const requisitosBase = (prefijo: string, listos: number): Requisito[] =>
  [
    'Pliego descargado y leído',
    'Constancia de inscripción como proveedor',
    'Certificado fiscal para contratar',
    'Muestras del producto para evaluación técnica',
    'Planilla de cotización firmada',
    'Garantía de mantenimiento de oferta',
  ].map((texto, i) => ({ id: `${prefijo}-r${i}`, texto, listoInicial: i < listos }))

export const licitaciones: Licitacion[] = [
  {
    id: 'l1',
    organismo: 'Hospital Municipal San Martín',
    expediente: 'EX-2026-00184521',
    objeto: 'Provisión de broncodilatadores inhalatorios para el período 2027',
    productos: ['respira'],
    unidades: 12000,
    monto: 48600000,
    responsable: 'Tomás Herrera',
    cuentaId: 'c5',
    estadoInicial: 'preparacion',
    publicacion: haceDias(12, 9),
    consultas: haceDias(-2, 12),
    apertura: haceDias(-6, 11),
    nota: 'Somos el proveedor actual. El pliego repite las especificaciones del año pasado.',
    requisitos: requisitosBase('l1', 4),
  },
  {
    id: 'l2',
    organismo: 'Ministerio de Salud de la Provincia',
    expediente: 'LP-2026-0912',
    objeto: 'Compra centralizada de hipolipemiantes',
    productos: ['cardio'],
    unidades: 45000,
    monto: 162000000,
    responsable: 'Dirección comercial',
    estadoInicial: 'deteccion',
    publicacion: haceDias(3, 10),
    consultas: haceDias(-9, 12),
    apertura: haceDias(-17, 11),
    nota: 'Volumen alto y muchos oferentes. Hay que definir si se compite por precio.',
    requisitos: requisitosBase('l2', 1),
  },
  {
    id: 'l3',
    organismo: 'PAMI · Unidad de Gestión Local IV',
    expediente: 'CD-2026-3344',
    objeto: 'Cobertura de tratamiento crónico cardiometabólico',
    productos: ['cardio'],
    unidades: 28000,
    monto: 94500000,
    responsable: 'Lucía Romero',
    cuentaId: 'c7',
    estadoInicial: 'presentada',
    publicacion: haceDias(41, 10),
    consultas: haceDias(28, 12),
    apertura: haceDias(6, 11),
    adjudicacion: haceDias(-13, 12),
    nota: 'Oferta presentada en tiempo. Se espera el dictamen de la comisión evaluadora.',
    requisitos: requisitosBase('l3', 6),
  },
  {
    id: 'l4',
    organismo: 'Hospital Provincial de Niños',
    expediente: 'EX-2026-00170044',
    objeto: 'Aerocámaras espaciadoras pediátricas',
    productos: ['respira'],
    unidades: 3500,
    monto: 11200000,
    responsable: 'Mariana Costa',
    estadoInicial: 'adjudicada',
    publicacion: haceDias(96, 10),
    consultas: haceDias(84, 12),
    apertura: haceDias(72, 11),
    adjudicacion: haceDias(35, 12),
    nota: 'Adjudicada por 12 meses. Primera entrega despachada.',
    requisitos: requisitosBase('l4', 6),
  },
  {
    id: 'l5',
    organismo: 'Instituto de Obra Social Provincial',
    expediente: 'LPU-2026-0075',
    objeto: 'Provisión de inhaladores para el programa de EPOC',
    productos: ['respira'],
    unidades: 9000,
    monto: 36900000,
    responsable: 'Diego Salas',
    estadoInicial: 'perdida',
    publicacion: haceDias(150, 10),
    consultas: haceDias(138, 12),
    apertura: haceDias(126, 11),
    adjudicacion: haceDias(96, 12),
    nota: 'Se perdió por precio: la oferta ganadora estuvo 14 % por debajo.',
    requisitos: requisitosBase('l5', 6),
  },
  {
    id: 'l6',
    organismo: 'Municipalidad de Rosario · Salud Pública',
    expediente: 'CM-2026-0488',
    objeto: 'Botiquín de atención primaria, renglones 4 y 7',
    productos: ['cardio', 'respira'],
    unidades: 6200,
    monto: 21400000,
    responsable: 'Diego Salas',
    cuentaId: 'c1',
    estadoInicial: 'preparacion',
    publicacion: haceDias(7, 10),
    consultas: haceDias(1, 12),
    apertura: haceDias(-3, 11),
    nota: 'Falta la garantía de oferta. La apertura es en tres días.',
    requisitos: requisitosBase('l6', 3),
  },
]

export const licitacionPorId = Object.fromEntries(licitaciones.map((l) => [l.id, l])) as Record<string, Licitacion>

/** Días que faltan para una fecha; negativo si ya pasó */
export function diasHasta(fecha: number) {
  return Math.ceil((fecha - Date.now()) / 86400000)
}

/** La fecha que hay que mirar según en qué punto del proceso está */
export function proximaFecha(l: Licitacion, estado: EstadoLicitacion) {
  if (estado === 'deteccion' || estado === 'preparacion') {
    return diasHasta(l.consultas) >= 0 ? { texto: 'Consultas', fecha: l.consultas } : { texto: 'Apertura', fecha: l.apertura }
  }
  if (estado === 'presentada') return { texto: 'Adjudicación', fecha: l.adjudicacion ?? l.apertura }
  return { texto: 'Apertura', fecha: l.apertura }
}
