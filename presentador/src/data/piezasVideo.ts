import type { ProductoId } from '../types'

/** Piezas en video para mostrarle al médico: se reproducen a pantalla completa */
export interface PiezaVideo {
  id: string
  titulo: string
  descripcion: string
  productoId: ProductoId
  /** archivo en public/media, sin extensión */
  medio: string
  duracion: number
  momentos: { desde: number; texto: string }[]
}

export const piezasVideo: PiezaVideo[] = [
  {
    id: 'pv-cardio',
    titulo: 'Demo-molécula en 30 segundos',
    descripcion: 'Del problema al resultado: por qué la placa avanza y cómo se frena. Para abrir la visita o dejar cerrada la idea principal.',
    productoId: 'cardio',
    medio: 'presentacion-cardio',
    duracion: 30,
    momentos: [
      { desde: 0, texto: 'El problema: la placa reduce el paso de la sangre.' },
      { desde: 8, texto: 'El mecanismo: menos síntesis hepática y más receptores de LDL.' },
      { desde: 15, texto: 'El resultado: menos LDL circulante y la placa se reduce.' },
      { desde: 23, texto: 'Demo-molécula 20 mg · una vez por día.' },
    ],
  },
  {
    id: 'pv-respira',
    titulo: 'Respira-mol en 30 segundos',
    descripcion: 'La vía aérea que se cierra, la partícula que llega y el alivio sostenido, contado sin palabras.',
    productoId: 'respira',
    medio: 'presentacion-respira',
    duracion: 30,
    momentos: [
      { desde: 0, texto: 'El problema: el músculo liso estrecha la vía aérea.' },
      { desde: 8, texto: 'El mecanismo: las partículas se depositan en el bronquio.' },
      { desde: 15, texto: 'El resultado: la luz bronquial se amplía.' },
      { desde: 23, texto: 'Respira-mol 200 mcg · dos inhalaciones cada 12 horas.' },
    ],
  },
]

export const piezaPorId = Object.fromEntries(piezasVideo.map((p) => [p.id, p])) as Record<string, PiezaVideo>
