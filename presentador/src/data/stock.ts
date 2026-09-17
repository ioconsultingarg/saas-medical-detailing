import type { ItemStock, NivelStock } from '../types'

export const stockInicial: ItemStock[] = [
  { sku: 'DM-20-30', productoId: 'cardio', nombre: 'Demo-molécula 20 mg × 30 comp.', tipo: 'comercial', unidades: 1240, umbralBajo: 300 },
  { sku: 'DM-20-60', productoId: 'cardio', nombre: 'Demo-molécula 20 mg × 60 comp.', tipo: 'comercial', unidades: 180, umbralBajo: 250 },
  { sku: 'DM-10-30', productoId: 'cardio', nombre: 'Demo-molécula 10 mg × 30 comp.', tipo: 'comercial', unidades: 0, umbralBajo: 200 },
  { sku: 'DM-MM-7', productoId: 'cardio', nombre: 'Muestra médica 20 mg × 7 comp.', tipo: 'muestra', unidades: 460, umbralBajo: 80, lote: 'DM2408A', vencimiento: '2027-08' },
  { sku: 'RM-200-200', productoId: 'respira', nombre: 'Respira-mol 200 mcg × 200 dosis', tipo: 'comercial', unidades: 820, umbralBajo: 250 },
  { sku: 'RM-100-120', productoId: 'respira', nombre: 'Respira-mol 100 mcg × 120 dosis', tipo: 'comercial', unidades: 95, umbralBajo: 200 },
  { sku: 'RM-MM-60', productoId: 'respira', nombre: 'Muestra médica × 60 dosis', tipo: 'muestra', unidades: 0, umbralBajo: 60, lote: 'RM2405B', vencimiento: '2027-05' },
  { sku: 'RM-AERO', productoId: 'respira', nombre: 'Aerocámara espaciadora', tipo: 'material', unidades: 140, umbralBajo: 40, lote: 'AE2311', vencimiento: '2029-11' },
  { sku: 'MAT-FOL-C', productoId: 'cardio', nombre: 'Folleto para pacientes · colesterol', tipo: 'material', unidades: 2000, umbralBajo: 300 },
  { sku: 'MAT-FOL-R', productoId: 'respira', nombre: 'Guía de técnica inhalatoria', tipo: 'material', unidades: 55, umbralBajo: 120 },
  { sku: 'MAT-REC', productoId: null, nombre: 'Recetario institucional', tipo: 'material', unidades: 320, umbralBajo: 100 },
]

export function nivelDe(item: ItemStock): NivelStock {
  if (item.unidades <= 0) return 'sin'
  if (item.unidades <= item.umbralBajo) return 'bajo'
  return 'alto'
}

export const etiquetaNivel: Record<NivelStock, string> = {
  alto: 'Stock alto',
  bajo: 'Stock bajo',
  sin: 'Sin stock',
}

/** Solo muestras y material promocional se piden desde la visita; lo comercial va por droguería */
export function esSolicitable(item: ItemStock) {
  return item.tipo !== 'comercial'
}
