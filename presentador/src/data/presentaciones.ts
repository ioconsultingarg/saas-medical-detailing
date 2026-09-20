import type { Diapositiva, Presentacion, ProductoId } from '../types'

export const diapositivas: Diapositiva[] = [
  { id: 'c1', productoId: 'cardio', titulo: 'Portada' },
  { id: 'c2', productoId: 'cardio', titulo: 'El desafío del LDL' },
  { id: 'c3', productoId: 'cardio', titulo: 'Mecanismo de acción' },
  { id: 'c4', productoId: 'cardio', titulo: 'Eficacia' },
  { id: 'c5', productoId: 'cardio', titulo: 'Seguridad' },
  { id: 'c6', productoId: 'cardio', titulo: 'Posología' },
  { id: 'r1', productoId: 'respira', titulo: 'Portada' },
  { id: 'r2', productoId: 'respira', titulo: 'El problema del control' },
  { id: 'r3', productoId: 'respira', titulo: 'Mecanismo de acción' },
  { id: 'r4', productoId: 'respira', titulo: 'Técnica inhalatoria' },
  { id: 'r5', productoId: 'respira', titulo: 'Adherencia' },
  { id: 'r6', productoId: 'respira', titulo: 'Posología' },
]

export const diapositivaPorId = Object.fromEntries(diapositivas.map((d) => [d.id, d])) as Record<string, Diapositiva>

export const presentacionesOficiales: Presentacion[] = [
  {
    id: 'p-cardio',
    titulo: 'Lipvera · Visita completa',
    descripcion: 'Del problema clínico a la posología, con estudios y modelo 3D.',
    diapositivas: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
    tipo: 'oficial',
  },
  {
    id: 'p-cardio-breve',
    titulo: 'Lipvera · Mensaje clave',
    descripcion: 'Versión de 3 minutos para agendas cortas.',
    diapositivas: ['c1', 'c4', 'c6'],
    tipo: 'oficial',
  },
  {
    id: 'p-respira',
    titulo: 'Respirel · Visita completa',
    descripcion: 'Control de síntomas, mecanismo, técnica y adherencia.',
    diapositivas: ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'],
    tipo: 'oficial',
  },
  {
    id: 'p-respira-breve',
    titulo: 'Respirel · Técnica y adherencia',
    descripcion: 'Foco en el uso correcto del inhalador.',
    diapositivas: ['r1', 'r4', 'r5'],
    tipo: 'oficial',
  },
]

/** Estimación para mostrar al armar la visita: ~1 minuto por pantalla */
export function minutosEstimados(p: Presentacion) {
  return Math.max(1, Math.round(p.diapositivas.length * 1.1))
}

export function productosDe(p: Presentacion): ProductoId[] {
  const ids = p.diapositivas.map((id) => diapositivaPorId[id]?.productoId)
  return [...new Set(ids.filter((x): x is ProductoId => Boolean(x)))]
}
