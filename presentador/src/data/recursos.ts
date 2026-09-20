import type { ProductoId } from '../types'

// Todos los datos clínicos son de demostración: ilustran el formato, no describen estudios reales.

export interface BarraComparativa {
  etiqueta: string
  valor: number
  destacado?: boolean
}

export type Recurso =
  | {
      id: string
      tipo: 'estudio'
      productoId: ProductoId
      titulo: string
      diseno: string
      hallazgos: { valor: string; texto: string }[]
      grafico: { titulo: string; unidad: string; barras: BarraComparativa[] }
      referencia: string
    }
  | {
      id: string
      tipo: 'grafico'
      productoId: ProductoId
      titulo: string
      descripcion: string
      unidad: string
      semanas: number[]
      series: { nombre: string; color: string; valores: number[] }[]
      referencia: string
    }
  | {
      id: string
      tipo: 'video'
      productoId: ProductoId
      titulo: string
      escena: 'cardio-mecanismo' | 'respira-mecanismo' | 'respira-tecnica'
      /** video real en public/media; si todavía no existe se usa la animación generada */
      medio?: string
      duracion: number
      capitulos: { desde: number; texto: string }[]
    }
  | {
      id: string
      tipo: 'modelo3d'
      productoId: ProductoId
      titulo: string
      modelo: 'arteria' | 'bronquios'
      descripcion: string
      estados: [string, string]
    }
  | {
      id: string
      tipo: 'documento'
      productoId: ProductoId
      titulo: string
      url: string
    }

const base = import.meta.env.BASE_URL

export const recursos: Record<string, Recurso> = {
  'c-epidemiologia': {
    id: 'c-epidemiologia',
    tipo: 'estudio',
    productoId: 'cardio',
    titulo: 'Control de LDL en práctica clínica',
    diseno: 'Registro observacional · 14 centros · n = 3.420 pacientes de alto riesgo',
    hallazgos: [
      { valor: '61%', texto: 'no alcanza la meta de LDL con su tratamiento actual' },
      { valor: '1 de 3', texto: 'abandona el tratamiento antes del año' },
    ],
    grafico: {
      titulo: 'Pacientes en meta de LDL según riesgo',
      unidad: '%',
      barras: [
        { etiqueta: 'Riesgo moderado', valor: 58 },
        { etiqueta: 'Riesgo alto', valor: 39, destacado: true },
        { etiqueta: 'Riesgo muy alto', valor: 22, destacado: true },
      ],
    },
    referencia: 'Registro de demostración DEMO-LDL. Datos ilustrativos.',
  },
  'c-eficacia': {
    id: 'c-eficacia',
    tipo: 'grafico',
    productoId: 'cardio',
    titulo: 'Reducción de LDL a lo largo del tratamiento',
    descripcion: 'Mové el control para ver la reducción media en cada semana del estudio.',
    unidad: '% de reducción de LDL',
    semanas: [0, 2, 4, 8, 12, 24, 52],
    series: [
      { nombre: 'Demo-molécula 20 mg', color: '#0a6b5d', valores: [0, 28, 39, 46, 49, 51, 52] },
      { nombre: 'Comparador', color: '#8795a1', valores: [0, 19, 27, 33, 35, 36, 36] },
      { nombre: 'Placebo', color: '#c7d0d8', valores: [0, 2, 3, 3, 4, 3, 3] },
    ],
    referencia: 'Ensayo de demostración DEMO-201, doble ciego, 52 semanas. Datos ilustrativos.',
  },
  'c-seguridad': {
    id: 'c-seguridad',
    tipo: 'estudio',
    productoId: 'cardio',
    titulo: 'Perfil de seguridad a 52 semanas',
    diseno: 'Análisis agrupado · 4 ensayos · n = 5.180 pacientes',
    hallazgos: [
      { valor: '2,1%', texto: 'discontinuó por eventos adversos (placebo 1,8%)' },
      { valor: '<0,1%', texto: 'elevación de CK mayor a 10 veces el límite normal' },
    ],
    grafico: {
      titulo: 'Eventos adversos más frecuentes',
      unidad: '%',
      barras: [
        { etiqueta: 'Mialgias', valor: 3.1, destacado: true },
        { etiqueta: 'Cefalea', valor: 2.4 },
        { etiqueta: 'Náuseas', valor: 1.6 },
        { etiqueta: 'Elevación de transaminasas', valor: 0.8 },
      ],
    },
    referencia: 'Análisis agrupado de demostración. Datos ilustrativos.',
  },
  'c-video': {
    id: 'c-video',
    tipo: 'video',
    productoId: 'cardio',
    titulo: 'Mecanismo de acción',
    escena: 'cardio-mecanismo',
    medio: 'mecanismo-cardio',
    duracion: 15,
    capitulos: [
      { desde: 0, texto: 'El hígado produce colesterol y lo libera a la sangre como LDL.' },
      { desde: 4, texto: 'Demo-molécula inhibe la síntesis y el hepatocito expone más receptores.' },
      { desde: 8, texto: 'Con menos LDL circulante, la placa deja de crecer.' },
      { desde: 12, texto: 'Resultado: la luz de la arteria vuelve a ampliarse.' },
    ],
  },
  'c-3d': {
    id: 'c-3d',
    tipo: 'modelo3d',
    productoId: 'cardio',
    titulo: 'Arteria coronaria con placa',
    modelo: 'arteria',
    descripcion: 'Girá el modelo con el dedo. Compará la luz arterial con y sin control del LDL.',
    estados: ['Sin control de LDL', 'Con tratamiento'],
  },
  'c-renal': {
    id: 'c-renal',
    tipo: 'estudio',
    productoId: 'cardio',
    titulo: 'Ajuste de dosis en insuficiencia renal',
    diseno: 'Farmacocinética en 4 grupos de función renal · n = 96',
    hallazgos: [
      { valor: 'Sin ajuste', texto: 'con depuración de creatinina ≥ 30 ml/min' },
      { valor: '10 mg/día', texto: 'dosis máxima con depuración < 30 ml/min' },
    ],
    grafico: {
      titulo: 'Exposición relativa según función renal',
      unidad: '× exposición',
      barras: [
        { etiqueta: 'Normal', valor: 1 },
        { etiqueta: 'Leve', valor: 1.1 },
        { etiqueta: 'Moderada', valor: 1.3 },
        { etiqueta: 'Grave', valor: 2.1, destacado: true },
      ],
    },
    referencia: 'Estudio farmacocinético de demostración. Datos ilustrativos.',
  },
  'c-ficha': {
    id: 'c-ficha',
    tipo: 'documento',
    productoId: 'cardio',
    titulo: 'Ficha técnica · Demo-molécula',
    url: `${base}content/ficha-tecnica.pdf`,
  },
  'r-impacto': {
    id: 'r-impacto',
    tipo: 'estudio',
    productoId: 'respira',
    titulo: 'Control de síntomas en EPOC',
    diseno: 'Encuesta multicéntrica · 22 centros · n = 1.960 pacientes',
    hallazgos: [
      { valor: '48%', texto: 'tiene síntomas diarios pese al tratamiento' },
      { valor: '2 de 3', texto: 'comete al menos un error de técnica inhalatoria' },
    ],
    grafico: {
      titulo: 'Errores de técnica más frecuentes',
      unidad: '%',
      barras: [
        { etiqueta: 'No exhala antes de inhalar', valor: 52, destacado: true },
        { etiqueta: 'No sostiene la respiración', valor: 44, destacado: true },
        { etiqueta: 'No agita el dispositivo', valor: 31 },
        { etiqueta: 'Inhala demasiado rápido', valor: 27 },
      ],
    },
    referencia: 'Encuesta de demostración DEMO-EPOC. Datos ilustrativos.',
  },
  'r-video': {
    id: 'r-video',
    tipo: 'video',
    productoId: 'respira',
    titulo: 'Mecanismo de acción',
    escena: 'respira-mecanismo',
    medio: 'mecanismo-respira',
    duracion: 12,
    capitulos: [
      { desde: 0, texto: 'En la broncoconstricción el músculo liso estrecha la vía aérea.' },
      { desde: 4, texto: 'Las partículas de Respira-mol se depositan en los bronquios.' },
      { desde: 8, texto: 'El músculo se relaja y la luz bronquial se amplía.' },
    ],
  },
  'r-3d': {
    id: 'r-3d',
    tipo: 'modelo3d',
    productoId: 'respira',
    titulo: 'Árbol bronquial',
    modelo: 'bronquios',
    descripcion: 'Girá el modelo. Compará el calibre de la vía aérea antes y después de la dosis.',
    estados: ['Broncoconstricción', 'Tras la inhalación'],
  },
  'r-tecnica': {
    id: 'r-tecnica',
    tipo: 'video',
    productoId: 'respira',
    titulo: 'Técnica inhalatoria paso a paso',
    escena: 'respira-tecnica',
    medio: 'tecnica-inhalatoria',
    duracion: 16,
    capitulos: [
      { desde: 0, texto: '1. Agitá el inhalador durante 5 segundos.' },
      { desde: 4, texto: '2. Exhalá completamente, lejos de la boquilla.' },
      { desde: 8, texto: '3. Inhalá lento y profundo mientras presionás.' },
      { desde: 12, texto: '4. Sostené la respiración 10 segundos.' },
    ],
  },
  'r-adherencia': {
    id: 'r-adherencia',
    tipo: 'grafico',
    productoId: 'respira',
    titulo: 'Pacientes que mantienen la técnica correcta',
    descripcion: 'Mové el control para ver la adherencia en cada semana de seguimiento.',
    unidad: '% de pacientes',
    semanas: [0, 4, 8, 12, 16, 20, 24],
    series: [
      { nombre: 'Respira-mol + educación', color: '#144f85', valores: [64, 78, 81, 83, 82, 82, 82] },
      { nombre: 'Inhalador habitual', color: '#8795a1', valores: [61, 63, 58, 55, 52, 50, 49] },
    ],
    referencia: 'Estudio de demostración DEMO-ADH, 24 semanas. Datos ilustrativos.',
  },
  'r-ficha': {
    id: 'r-ficha',
    tipo: 'documento',
    productoId: 'respira',
    titulo: 'Ficha técnica · Respira-mol',
    url: `${base}content/linea-b-ficha.pdf`,
  },
}
