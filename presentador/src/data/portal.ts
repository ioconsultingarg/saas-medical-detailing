import type { ProductoId } from '../types'
import { haceDias } from './crm'

/*
 * Datos del portal del laboratorio: material aprobado, cupos y farmacovigilancia.
 * El estado que el usuario cambia en la demo vive en el estado de la app, no acá.
 */

export type EstadoPieza = 'borrador' | 'revision' | 'aprobada' | 'publicada' | 'vencida'
export type TipoPieza = 'presentacion' | 'estudio' | 'video' | 'ficha' | 'folleto'

export interface Pieza {
  id: string
  titulo: string
  tipo: TipoPieza
  productoId: ProductoId
  version: string
  estadoInicial: EstadoPieza
  /** quién la subió */
  autor: string
  actualizada: number
  vigencia: string
  /** el visitador puede enviársela al médico, no solo mostrarla */
  compartible: boolean
  peso: string
  nota?: string
  /** al publicarla aparece esta presentación en la biblioteca del visitador */
  habilitaPresentacion?: string
}

export const piezas: Pieza[] = [
  {
    id: 'pz-evidencia',
    titulo: 'Lipvera · Nueva evidencia a 104 semanas',
    tipo: 'presentacion',
    productoId: 'cardio',
    version: '1.0',
    estadoInicial: 'revision',
    autor: 'Brand Manager · Cardiometabólica',
    actualizada: haceDias(1, 11),
    vigencia: '12/2027',
    compartible: false,
    peso: '4 pantallas',
    nota: 'Extiende el estudio pivotal con el seguimiento a dos años. Pendiente de aprobación de Asuntos Médicos.',
    habilitaPresentacion: 'p-cardio-evidencia',
  },
  {
    id: 'pz-visita',
    titulo: 'Lipvera · Visita completa',
    tipo: 'presentacion',
    productoId: 'cardio',
    version: '3.1',
    estadoInicial: 'publicada',
    autor: 'Brand Manager · Cardiometabólica',
    actualizada: haceDias(34, 10),
    vigencia: '03/2027',
    compartible: false,
    peso: '6 pantallas',
  },
  {
    id: 'pz-ficha-c',
    titulo: 'Ficha técnica · Lipvera 20 mg',
    tipo: 'ficha',
    productoId: 'cardio',
    version: '3.1',
    estadoInicial: 'publicada',
    autor: 'Asuntos Médicos',
    actualizada: haceDias(61, 9),
    vigencia: '03/2027',
    compartible: true,
    peso: '8 secciones',
  },
  {
    id: 'pz-moa-c',
    titulo: 'Animación del mecanismo de acción',
    tipo: 'video',
    productoId: 'cardio',
    version: '2.0',
    estadoInicial: 'publicada',
    autor: 'Agencia · Vértice',
    actualizada: haceDias(12, 16),
    vigencia: '09/2027',
    compartible: true,
    peso: '15 s · 1,9 MB',
  },
  {
    id: 'pz-estudio-c',
    titulo: 'Separata · Reducción de LDL a 52 semanas',
    tipo: 'estudio',
    productoId: 'cardio',
    version: '1.2',
    estadoInicial: 'publicada',
    autor: 'Asuntos Médicos',
    actualizada: haceDias(88, 15),
    vigencia: '06/2027',
    compartible: true,
    peso: 'PDF · 1,1 MB',
  },
  {
    id: 'pz-costo',
    titulo: 'Comparativo de costo mensual de tratamiento',
    tipo: 'folleto',
    productoId: 'cardio',
    version: '0.3',
    estadoInicial: 'borrador',
    autor: 'Trade Marketing',
    actualizada: haceDias(3, 18),
    vigencia: '—',
    compartible: false,
    peso: 'PDF · 480 KB',
    nota: 'Falta la fuente del precio de referencia. No enviar a revisión sin eso.',
  },
  {
    id: 'pz-tecnica',
    titulo: 'Respirel · Técnica inhalatoria paso a paso',
    tipo: 'video',
    productoId: 'respira',
    version: '2.2',
    estadoInicial: 'publicada',
    autor: 'Agencia · Vértice',
    actualizada: haceDias(21, 12),
    vigencia: '05/2027',
    compartible: true,
    peso: '16 s · 2,4 MB',
  },
  {
    id: 'pz-adherencia',
    titulo: 'Respirel · Adherencia en EPOC',
    tipo: 'presentacion',
    productoId: 'respira',
    version: '2.4',
    estadoInicial: 'publicada',
    autor: 'Brand Manager · Respiratoria',
    actualizada: haceDias(45, 11),
    vigencia: '05/2027',
    compartible: false,
    peso: '6 pantallas',
  },
  {
    id: 'pz-guia',
    titulo: 'Guía para el paciente · uso del inhalador',
    tipo: 'folleto',
    productoId: 'respira',
    version: '1.4',
    estadoInicial: 'aprobada',
    autor: 'Asuntos Médicos',
    actualizada: haceDias(2, 17),
    vigencia: '08/2027',
    compartible: true,
    peso: 'PDF · 720 KB',
    nota: 'Aprobada por Asuntos Médicos. Falta publicarla para que llegue a las tablets.',
  },
  {
    id: 'pz-vieja',
    titulo: 'Respirel · Visita completa (versión anterior)',
    tipo: 'presentacion',
    productoId: 'respira',
    version: '1.8',
    estadoInicial: 'vencida',
    autor: 'Brand Manager · Respiratoria',
    actualizada: haceDias(210, 10),
    vigencia: 'Venció 08/2026',
    compartible: false,
    peso: '5 pantallas',
    nota: 'Retirada de todas las tablets al publicarse la versión 2.4.',
  },
]

export const piezaPorId = Object.fromEntries(piezas.map((p) => [p.id, p])) as Record<string, Pieza>

export const etiquetaEstado: Record<EstadoPieza, string> = {
  borrador: 'Borrador',
  revision: 'En revisión médica',
  aprobada: 'Aprobada, sin publicar',
  publicada: 'Publicada en las tablets',
  vencida: 'Vencida y retirada',
}

export const etiquetaTipo: Record<TipoPieza, string> = {
  presentacion: 'Presentación',
  estudio: 'Estudio clínico',
  video: 'Video',
  ficha: 'Ficha técnica',
  folleto: 'Material para pacientes',
}

/* ---------- Farmacovigilancia ---------- */

export type EstadoEvento = 'nuevo' | 'analisis' | 'notificado'

export interface EventoAdverso {
  id: string
  fecha: number
  medico: string
  apm: string
  productoId: ProductoId
  relato: string
  origen: 'voz' | 'manual'
  estadoInicial: EstadoEvento
}

export const eventosAdversos: EventoAdverso[] = [
  {
    id: 'ea-2',
    fecha: haceDias(1, 16),
    medico: 'Dr. Alejandro Funes',
    apm: 'Diego Salas',
    productoId: 'cardio',
    relato: 'Refiere una paciente de 68 años con mialgias intensas a las tres semanas de iniciado el tratamiento.',
    origen: 'voz',
    estadoInicial: 'analisis',
  },
  {
    id: 'ea-3',
    fecha: haceDias(4, 10),
    medico: 'Dra. Romina Aguirre',
    apm: 'Mariana Costa',
    productoId: 'respira',
    relato: 'Comentó dos casos de temblor marcado en adultos mayores durante la primera semana de uso.',
    origen: 'manual',
    estadoInicial: 'notificado',
  },
]

export const etiquetaEvento: Record<EstadoEvento, string> = {
  nuevo: 'Sin asignar',
  analisis: 'En análisis',
  notificado: 'Notificado a la autoridad',
}

/** Cupo mensual de muestras por médico, que el laboratorio define por producto */
export const cupoInicial: Record<ProductoId, number> = { cardio: 20, respira: 12 }
