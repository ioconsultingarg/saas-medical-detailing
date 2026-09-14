import type { ProductoId } from '../types'

// Contenido de capacitación de demostración: coherente con las piezas de la demo, sin datos clínicos reales.

export const DIA = 86_400_000

export type TipoLeccion = 'video' | 'lectura' | 'modelo3d' | 'objeciones'

export interface Leccion {
  id: string
  titulo: string
  tipo: TipoLeccion
  minutos: number
  recursoId?: string
  intro?: string
  puntos?: { titulo: string; texto: string }[]
  tarjetas?: { objecion: string; respuesta: string; referencia: string }[]
}

export interface Pregunta {
  id: string
  enunciado: string
  opciones: string[]
  correcta: number
  explicacion: string
}

export interface Curso {
  id: string
  titulo: string
  descripcion: string
  categoria: 'Lanzamiento' | 'Producto' | 'Ética y compliance'
  productoId: ProductoId | null
  obligatorio: boolean
  asignadoPor: string
  diasParaVencer: number
  /** video de portada en public/media */
  medio?: string
  lecciones: Leccion[]
  evaluacion: Pregunta[]
}

export type IconoInsignia = 'award' | 'target' | 'flame' | 'medal' | 'zap' | 'timer'

export interface Insignia {
  id: string
  nombre: string
  descripcion: string
  icono: IconoInsignia
}

export interface ResultadoQuiz {
  /** null cuando el cuestionario no tiene nota mínima (desafío semanal) */
  aprobado: boolean | null
  xpGanado: number
  nuevasInsignias: Insignia[]
}

export const UMBRAL_APROBACION = 0.8

/** Los puntos premian la formación: nunca se vinculan con ventas ni prescripciones */
export const XP = { leccion: 40, aprobado: 150, sinErrores: 100, desafioAcierto: 20 } as const

export const niveles = [
  { desde: 0, nombre: 'Inicial' },
  { desde: 300, nombre: 'En formación' },
  { desde: 800, nombre: 'Especialista' },
  { desde: 1500, nombre: 'Referente' },
]

export function nivelDe(xp: number) {
  let i = 0
  for (let k = 0; k < niveles.length; k++) if (xp >= niveles[k].desde) i = k
  const actual = niveles[i]
  const siguiente = niveles[i + 1] ?? null
  return {
    indice: i,
    actual,
    siguiente,
    progreso: siguiente ? (xp - actual.desde) / (siguiente.desde - actual.desde) : 1,
    faltan: siguiente ? siguiente.desde - xp : 0,
  }
}

export const insignias: Insignia[] = [
  { id: 'primer-certificado', nombre: 'Primera certificación', descripcion: 'Aprobaste tu primer curso', icono: 'award' },
  { id: 'constancia', nombre: 'Constancia', descripcion: '4 semanas seguidas capacitándote', icono: 'flame' },
  { id: 'sin-errores', nombre: 'Sin errores', descripcion: '100% en una evaluación al primer intento', icono: 'target' },
  { id: 'antes-de-tiempo', nombre: 'Antes de tiempo', descripcion: 'Te certificaste con 3 días o más de margen', icono: 'timer' },
  { id: 'doble-linea', nombre: 'Doble línea', descripcion: 'Certificado en los dos productos', icono: 'medal' },
  { id: 'desafio', nombre: 'Desafío semanal', descripcion: 'Respondiste un desafío de la semana', icono: 'zap' },
]

export const cursos: Curso[] = [
  {
    id: 'curso-cardio',
    titulo: 'Lanzamiento Demo-molécula 20 mg',
    descripcion: 'Mecanismo, evidencia del ensayo DEMO-201, seguridad y respuesta a las objeciones más frecuentes.',
    categoria: 'Lanzamiento',
    productoId: 'cardio',
    obligatorio: true,
    asignadoPor: 'Gerencia de producto · Línea cardiometabólica',
    diasParaVencer: 9,
    medio: 'curso-cardio',
    lecciones: [
      { id: 'c-l1', titulo: 'Mecanismo de acción', tipo: 'video', minutos: 3, recursoId: 'c-video' },
      {
        id: 'c-l2',
        titulo: 'Evidencia clave del ensayo DEMO-201',
        tipo: 'lectura',
        minutos: 4,
        intro: 'Los cuatro datos que tenés que poder explicar sin mirar la pieza.',
        puntos: [
          { titulo: '−52% de LDL a 52 semanas', texto: 'Con 20 mg, frente a −3% con placebo (p < 0,001). La reducción se sostiene desde la semana 12.' },
          { titulo: '61% fuera de meta', texto: 'En el registro DEMO-LDL, 6 de cada 10 pacientes de alto riesgo no alcanzan su meta con el tratamiento actual.' },
          { titulo: 'Seguridad comparable a placebo', texto: 'Discontinuación por eventos adversos: 2,1% vs. 1,8%. Ante mialgias persistentes, controlar CK.' },
          { titulo: 'Ajuste renal', texto: 'Sin ajuste con depuración ≥ 30 ml/min. Con depuración < 30 ml/min, dosis máxima de 10 mg por día.' },
        ],
      },
      { id: 'c-l3', titulo: 'La placa arterial en 3D', tipo: 'modelo3d', minutos: 2, recursoId: 'c-3d' },
      {
        id: 'c-l4',
        titulo: 'Objeciones frecuentes',
        tipo: 'objeciones',
        minutos: 4,
        intro: 'Leé la objeción, pensá tu respuesta y después tocá la tarjeta para compararla.',
        tarjetas: [
          {
            objecion: '“Ya uso una estatina y a mis pacientes les va bien.”',
            respuesta: 'Preguntá cuántos llegan a la meta de LDL. En el registro DEMO-LDL, el 61% de los pacientes de alto riesgo no la alcanza con su tratamiento actual.',
            referencia: 'Registro DEMO-LDL · pantalla 2 de la presentación',
          },
          {
            objecion: '“Me preocupan los dolores musculares.”',
            respuesta: 'La discontinuación por eventos adversos fue de 2,1% frente a 1,8% con placebo. Ante mialgias persistentes, la ficha indica controlar CK.',
            referencia: 'Análisis agrupado de seguridad · pantalla 5',
          },
          {
            objecion: '“Tengo muchos pacientes con insuficiencia renal.”',
            respuesta: 'No requiere ajuste con depuración ≥ 30 ml/min. Por debajo de ese valor, la dosis máxima es de 10 mg diarios.',
            referencia: 'Estudio farmacocinético · pantalla 6',
          },
        ],
      },
    ],
    evaluacion: [
      {
        id: 'ce1',
        enunciado: '¿Cuál fue la reducción media de LDL a 52 semanas con 20 mg en el ensayo DEMO-201?',
        opciones: ['−36%', '−52%', '−67%', '−3%'],
        correcta: 1,
        explicacion: 'La reducción fue de −52%, frente a −3% con placebo. −36% corresponde al comparador.',
      },
      {
        id: 'ce2',
        enunciado: 'Un paciente tiene una depuración de creatinina de 25 ml/min. ¿Qué dosis máxima corresponde?',
        opciones: ['5 mg por día', '10 mg por día', '20 mg por día', 'Está contraindicado'],
        correcta: 1,
        explicacion: 'Con depuración menor a 30 ml/min la dosis máxima es de 10 mg por día.',
      },
      {
        id: 'ce3',
        enunciado: '¿Cómo actúa Demo-molécula?',
        opciones: [
          'Inhibe la síntesis hepática de colesterol',
          'Bloquea la absorción intestinal de colesterol',
          'Aumenta la excreción biliar',
          'Relaja el músculo liso arterial',
        ],
        correcta: 0,
        explicacion: 'Inhibe la síntesis hepática; en respuesta, el hepatocito expone más receptores y capta más LDL.',
      },
      {
        id: 'ce4',
        enunciado: '¿Qué porcentaje discontinuó por eventos adversos con Demo-molécula?',
        opciones: ['0,8%', '2,1%', '3,1%', '5,4%'],
        correcta: 1,
        explicacion: 'Fue 2,1%, comparable al 1,8% del placebo. 3,1% es la frecuencia de mialgias.',
      },
      {
        id: 'ce5',
        enunciado: 'El médico comenta que un paciente tiene mialgias persistentes. ¿Qué indica la ficha técnica?',
        opciones: ['Duplicar la dosis', 'Controlar CK', 'Suspender sin evaluar', 'No requiere acción'],
        correcta: 1,
        explicacion: 'Ante mialgias persistentes corresponde controlar CK. Además, recordá reportarlo a Farmacovigilancia.',
      },
    ],
  },
  {
    id: 'curso-respira',
    titulo: 'Técnica inhalatoria con Respira-mol',
    descripcion: 'Cómo enseñar la técnica correcta, qué errores son más comunes y qué muestra el estudio de adherencia.',
    categoria: 'Producto',
    productoId: 'respira',
    obligatorio: true,
    asignadoPor: 'Gerencia de producto · Línea respiratoria',
    diasParaVencer: 3,
    medio: 'curso-respira',
    lecciones: [
      { id: 'r-l1', titulo: 'Técnica paso a paso', tipo: 'video', minutos: 2, recursoId: 'r-tecnica' },
      { id: 'r-l2', titulo: 'Mecanismo broncodilatador', tipo: 'video', minutos: 2, recursoId: 'r-video' },
      { id: 'r-l3', titulo: 'El árbol bronquial en 3D', tipo: 'modelo3d', minutos: 2, recursoId: 'r-3d' },
      {
        id: 'r-l4',
        titulo: 'Adherencia y errores frecuentes',
        tipo: 'lectura',
        minutos: 3,
        intro: 'La técnica es el mensaje: un inhalador bien usado es el que funciona.',
        puntos: [
          { titulo: '2 de cada 3 cometen errores', texto: 'El más frecuente es no exhalar antes de inhalar (52%), seguido de no sostener la respiración (44%).' },
          { titulo: '82% de adherencia a 24 semanas', texto: 'Con Respira-mol y educación en la técnica, frente a 49% con el inhalador habitual.' },
          { titulo: 'Posología', texto: '2 inhalaciones cada 12 horas. Dosis máxima de 8 inhalaciones por día.' },
          { titulo: 'Aerocámara', texto: 'Recomendala en adultos mayores o pacientes con poca fuerza o coordinación.' },
        ],
      },
    ],
    evaluacion: [
      {
        id: 're1',
        enunciado: '¿Cuál es la posología habitual de Respira-mol?',
        opciones: ['1 inhalación por día', '2 inhalaciones cada 12 horas', '4 inhalaciones cada 6 horas', 'A demanda, sin límite'],
        correcta: 1,
        explicacion: '2 inhalaciones cada 12 horas, con un máximo de 8 por día.',
      },
      {
        id: 're2',
        enunciado: '¿Cuánto tiempo debe sostener la respiración el paciente después de inhalar?',
        opciones: ['2 segundos', '5 segundos', '10 segundos', '30 segundos'],
        correcta: 2,
        explicacion: 'Sostener el aire 10 segundos mejora el depósito de las partículas en los bronquios.',
      },
      {
        id: 're3',
        enunciado: '¿Cuál es el error de técnica más frecuente?',
        opciones: ['No agitar el dispositivo', 'No exhalar antes de inhalar', 'Inhalar demasiado rápido', 'Usar aerocámara'],
        correcta: 1,
        explicacion: 'No exhalar antes de inhalar aparece en el 52% de los pacientes.',
      },
      {
        id: 're4',
        enunciado: '¿Qué porcentaje mantenía la técnica correcta a las 24 semanas con Respira-mol?',
        opciones: ['49%', '64%', '82%', '95%'],
        correcta: 2,
        explicacion: '82%, frente a 49% con el inhalador habitual.',
      },
      {
        id: 're5',
        enunciado: '¿En qué pacientes conviene recomendar la aerocámara?',
        opciones: ['En todos los pacientes', 'En adultos mayores o con poca fuerza', 'Solo en niños', 'Nunca con este dispositivo'],
        correcta: 1,
        explicacion: 'La aerocámara ayuda cuando cuesta coordinar el disparo con la inhalación.',
      },
    ],
  },
  {
    id: 'curso-etica',
    titulo: 'Buenas prácticas en la visita médica',
    descripcion: 'Qué se puede comunicar, cómo responder consultas fuera de indicación y cuándo reportar a Farmacovigilancia.',
    categoria: 'Ética y compliance',
    productoId: null,
    obligatorio: true,
    asignadoPor: 'Asuntos Médicos y Compliance',
    diasParaVencer: 240,
    medio: 'curso-etica',
    lecciones: [
      {
        id: 'e-l1',
        titulo: 'Qué se puede comunicar',
        tipo: 'lectura',
        minutos: 4,
        intro: 'Principios del código de ética del laboratorio (versión de demostración).',
        puntos: [
          { titulo: 'Solo material aprobado', texto: 'Usá la versión vigente de cada pieza. Si el laboratorio la revoca, deja de estar disponible en la app.' },
          { titulo: 'Indicaciones aprobadas', texto: 'No promociones usos fuera de indicación, aunque el médico pregunte por ellos.' },
          { titulo: 'Beneficio y riesgo', texto: 'Presentá la eficacia junto con la información de seguridad, nunca solo los resultados favorables.' },
          { titulo: 'Muestras con registro', texto: 'Las muestras respetan el cupo por médico y se entregan con firma de recepción.' },
        ],
      },
      {
        id: 'e-l2',
        titulo: 'Situaciones difíciles',
        tipo: 'objeciones',
        minutos: 4,
        intro: 'Cómo responder sin salirte de las reglas.',
        tarjetas: [
          {
            objecion: '“¿Me contás si sirve para un uso que no está en el prospecto?”',
            respuesta: 'No respondas sobre usos fuera de indicación. Ofrecé derivar la consulta a Asuntos Médicos, que responde por escrito.',
            referencia: 'Política de comunicación médica (demo)',
          },
          {
            objecion: '“Un paciente tuvo una reacción después de tomarlo.”',
            respuesta: 'Registrá el caso y reportalo a Farmacovigilancia dentro del plazo que fija el laboratorio, aunque no esté confirmado.',
            referencia: 'Procedimiento de Farmacovigilancia (demo)',
          },
          {
            objecion: '“¿Me dejás más muestras para mi familia?”',
            respuesta: 'Las muestras son para uso profesional y tienen cupo por médico. Explicá el límite y registrá cada entrega con firma.',
            referencia: 'Política de muestras médicas (demo)',
          },
        ],
      },
    ],
    evaluacion: [
      {
        id: 'ee1',
        enunciado: 'Un médico pregunta por un uso que no figura en el prospecto. ¿Qué hacés?',
        opciones: ['Le cuento lo que sé', 'Derivo la consulta a Asuntos Médicos', 'Le muestro estudios de otros países', 'Cambio de tema sin responder'],
        correcta: 1,
        explicacion: 'Las consultas fuera de indicación las responde Asuntos Médicos por escrito.',
      },
      {
        id: 'ee2',
        enunciado: '¿Cuándo se reporta un posible evento adverso?',
        opciones: ['Solo si está confirmado', 'Siempre, dentro del plazo que fija el laboratorio', 'Solo si es grave', 'Cuando lo pide el médico'],
        correcta: 1,
        explicacion: 'Todo posible evento adverso se reporta, aunque no esté confirmado.',
      },
      {
        id: 'ee3',
        enunciado: '¿Qué material podés usar en la visita?',
        opciones: ['Cualquier estudio publicado', 'La versión vigente aprobada por el laboratorio', 'Presentaciones armadas por colegas', 'Material de congresos'],
        correcta: 1,
        explicacion: 'Solo la versión vigente aprobada. En la app, las piezas revocadas dejan de estar disponibles.',
      },
      {
        id: 'ee4',
        enunciado: 'Al presentar eficacia, ¿qué más tenés que comunicar?',
        opciones: ['Nada más', 'La información de seguridad', 'El precio de la competencia', 'Testimonios de pacientes'],
        correcta: 1,
        explicacion: 'Beneficio y riesgo van juntos en toda comunicación promocional.',
      },
      {
        id: 'ee5',
        enunciado: '¿Qué requisito tiene la entrega de muestras?',
        opciones: ['Ninguno', 'Cupo por médico y firma de recepción', 'Solo avisar al supervisor', 'Pago simbólico'],
        correcta: 1,
        explicacion: 'Se respeta el cupo por médico y queda registrada con firma.',
      },
    ],
  },
]

export const cursoPorId = Object.fromEntries(cursos.map((c) => [c.id, c])) as Record<string, Curso>

/** Compañeros ficticios de la zona para el ranking de formación */
export const equipo = [
  { nombre: 'Martina Sosa', xp: 1180 },
  { nombre: 'Diego Paredes', xp: 960 },
  { nombre: 'Carla Benítez', xp: 710 },
  { nombre: 'Tomás Aguirre', xp: 540 },
  { nombre: 'Julieta Ramos', xp: 310 },
]

export const desafioSemanal: Pregunta[] = [
  {
    id: 'ds1',
    enunciado: 'Verdadero o falso: la reducción de LDL con Demo-molécula se mantiene hasta la semana 52.',
    opciones: ['Verdadero', 'Falso'],
    correcta: 0,
    explicacion: 'Verdadero: a la semana 52 la reducción media es de −52%.',
  },
  {
    id: 'ds2',
    enunciado: '¿Cuál es la dosis máxima diaria de Respira-mol?',
    opciones: ['4 inhalaciones', '6 inhalaciones', '8 inhalaciones', '12 inhalaciones'],
    correcta: 2,
    explicacion: 'La dosis máxima es de 8 inhalaciones por día.',
  },
  {
    id: 'ds3',
    enunciado: 'Un médico te pide muestras por encima del cupo. ¿Qué hacés?',
    opciones: ['Se las dejo igual', 'Explico el límite y registro la entrega', 'Le doy muestras de otro producto', 'Le pido que no lo comente'],
    correcta: 1,
    explicacion: 'El cupo existe por normativa: se explica y cada entrega queda registrada.',
  },
]
