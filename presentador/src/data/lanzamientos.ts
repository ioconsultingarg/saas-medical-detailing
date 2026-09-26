import type { ProductoId } from '../types'
import { haceDias, medicos } from './crm'

/*
 * Lanzamientos: para un laboratorio mediano, sacar un producto nuevo es el evento del año.
 * El módulo junta la lista de médicos objetivo, el cronograma y la adopción temprana.
 */

export type FaseLanzamiento = 'preparacion' | 'en_curso' | 'consolidacion'

export interface Hito {
  id: string
  titulo: string
  fecha: number
  responsable: string
  listoInicial: boolean
}

export interface Lanzamiento {
  id: string
  nombre: string
  detalle: string
  productoId: ProductoId
  fase: FaseLanzamiento
  inicio: number
  /** médicos que el laboratorio definió como objetivo */
  objetivo: string[]
  /** piezas del portal que forman el kit de lanzamiento */
  piezas: string[]
  cursoId: string
  /** recetas mensuales del producto antes del lanzamiento, como línea de base */
  baseRecetas: number
  hitos: Hito[]
}

export const etiquetaFase: Record<FaseLanzamiento, string> = {
  preparacion: 'En preparación',
  en_curso: 'En curso',
  consolidacion: 'En consolidación',
}

/** El objetivo se arma con los médicos del producto, priorizando categoría A y B */
function objetivoDe(producto: ProductoId, cantidad: number) {
  return medicos
    .filter((m) => m.productos.includes(producto))
    .sort((a, b) => a.categoria.localeCompare(b.categoria))
    .slice(0, cantidad)
    .map((m) => m.id)
}

export const lanzamientos: Lanzamiento[] = [
  {
    id: 'ln-1',
    nombre: 'Lipvera 10 mg · nueva concentración',
    detalle: 'Presentación de inicio para pacientes que arrancan tratamiento o no toleran la dosis plena.',
    productoId: 'cardio',
    fase: 'en_curso',
    inicio: haceDias(38, 9),
    objetivo: objetivoDe('cardio', 16),
    piezas: ['pz-evidencia', 'pz-ficha-c', 'pz-moa-c'],
    cursoId: 'curso-cardio',
    baseRecetas: 520,
    hitos: [
      { id: 'ln1-h1', titulo: 'Material aprobado por Asuntos Médicos', fecha: haceDias(45, 10), responsable: 'Asuntos Médicos', listoInicial: true },
      { id: 'ln1-h2', titulo: 'Capacitación del equipo y certificación', fecha: haceDias(32, 10), responsable: 'Brand Manager', listoInicial: true },
      { id: 'ln1-h3', titulo: 'Primera ronda de visitas al listado objetivo', fecha: haceDias(10, 10), responsable: 'Equipo de campo', listoInicial: false },
      { id: 'ln1-h4', titulo: 'Entrega de muestras a los 16 médicos objetivo', fecha: haceDias(-6, 10), responsable: 'Equipo de campo', listoInicial: false },
      { id: 'ln1-h5', titulo: 'Revisión de adopción a 60 días', fecha: haceDias(-22, 10), responsable: 'Dirección comercial', listoInicial: false },
    ],
  },
  {
    id: 'ln-2',
    nombre: 'Respirel · aerocámara pediátrica',
    detalle: 'Dispositivo espaciador para pacientes de 4 a 12 años, con guía de técnica para padres.',
    productoId: 'respira',
    fase: 'preparacion',
    inicio: haceDias(-14, 9),
    objetivo: objetivoDe('respira', 12),
    piezas: ['pz-tecnica', 'pz-guia'],
    cursoId: 'curso-respira',
    baseRecetas: 0,
    hitos: [
      { id: 'ln2-h1', titulo: 'Definir el listado de médicos objetivo', fecha: haceDias(4, 10), responsable: 'Brand Manager', listoInicial: true },
      { id: 'ln2-h2', titulo: 'Aprobación del material pediátrico', fecha: haceDias(-3, 10), responsable: 'Asuntos Médicos', listoInicial: false },
      { id: 'ln2-h3', titulo: 'Capacitación obligatoria del equipo', fecha: haceDias(-11, 10), responsable: 'Academia', listoInicial: false },
      { id: 'ln2-h4', titulo: 'Arranque de visitas', fecha: haceDias(-18, 10), responsable: 'Equipo de campo', listoInicial: false },
    ],
  },
]

export const lanzamientoPorId = Object.fromEntries(lanzamientos.map((l) => [l.id, l])) as Record<string, Lanzamiento>
