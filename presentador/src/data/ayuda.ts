import type { Ruta } from '../lib/ruta'

/*
 * Manual de la app, escrito como respuestas cortas.
 * El buscador de Ayuda trabaja sobre estos artículos: en la demo con coincidencia local,
 * en producción con un modelo que lee este mismo manual más los tickets de soporte.
 */

export interface Articulo {
  id: string
  titulo: string
  resumen: string
  /** pantallas donde este artículo se ofrece primero */
  pantallas: Ruta['nombre'][]
  claves: string[]
  pasos?: string[]
  enlace?: { texto: string; href: string }
}

export const articulos: Articulo[] = [
  {
    id: 'checkin',
    titulo: 'Hacer check-in en el consultorio',
    resumen: 'El check-in abre la visita y registra a qué distancia del consultorio estabas. Desde ahí se cuenta la duración.',
    pantallas: ['hoy'],
    claves: ['check-in', 'checkin', 'empezar visita', 'llegar', 'geocerca', 'distancia', 'abrir visita'],
    pasos: [
      'Entrá en Hoy y buscá la visita en la agenda.',
      'Tocá "Hacer check-in". Si ya hay una visita abierta, primero cerrá esa.',
      'Queda corriendo el cronómetro en la barra de arriba.',
    ],
    enlace: { texto: 'Ir a la agenda de hoy', href: '#/' },
  },
  {
    id: 'cerrar',
    titulo: 'Cerrar una visita y hacer check-out',
    resumen: 'El cierre guarda la receptividad, el feedback, las muestras entregadas y la firma del profesional.',
    pantallas: ['registro', 'compartir', 'hoy'],
    claves: ['cerrar visita', 'check-out', 'checkout', 'terminar', 'registrar', 'firma', 'receptividad', 'estrellas'],
    pasos: [
      'Tocá "Cerrar visita" en la barra de arriba, o entrá en Compartir material y seguí al paso 2.',
      'Elegí la receptividad con las estrellas y marcá las etiquetas que correspondan.',
      'Si entregaste muestras, pedile la firma al médico en la pantalla o marcá que firmó el remito en papel.',
      'Tocá "Guardar y hacer check-out".',
    ],
    enlace: { texto: 'Ir al cierre de visita', href: '#/cierre' },
  },
  {
    id: 'voz',
    titulo: 'Completar el registro hablando',
    resumen: 'Contás cómo fue la visita y la IA completa receptividad, feedback, muestras y próximo paso. Vos revisás antes de guardar.',
    pantallas: ['registro'],
    claves: ['voz', 'dictar', 'audio', 'grabar', 'reporte por voz', 'ia', 'inteligencia artificial', 'micrófono', 'zero click'],
    pasos: [
      'En el cierre de visita tocá "Grabar reporte" y hablá con naturalidad.',
      'Nombrá el producto, las muestras que dejaste, qué dijo el médico y el próximo paso.',
      'Tocá "Terminar": vas a ver la transcripción con lo que reconoció.',
      'Revisá los campos y tocá "Aplicar al registro". Nada se guarda sin que lo confirmes.',
    ],
    enlace: { texto: 'Probar el reporte por voz', href: '#/cierre/registro' },
  },
  {
    id: 'evento-adverso',
    titulo: 'Qué hacer si el médico menciona un efecto adverso',
    resumen: 'La app lo detecta en el reporte por voz y te pide notificarlo. El plazo para reportar a Farmacovigilancia es de 24 horas.',
    pantallas: ['registro'],
    claves: ['evento adverso', 'efecto adverso', 'farmacovigilancia', 'reacción', 'seguridad', 'notificar'],
    pasos: [
      'Si aparece el aviso rojo, tocá "Notificar a Farmacovigilancia".',
      'Sin conexión queda en la cola con prioridad y se envía apenas vuelve la señal.',
      'Nunca minimices el comentario del médico: el reporte es obligatorio aunque el caso parezca leve.',
    ],
  },
  {
    id: 'presentar',
    titulo: 'Presentar y moverse entre pantallas',
    resumen: 'Las páginas se pasan arrastrando con el dedo, como un papel. Cada dato se puede abrir para ampliarlo.',
    pantallas: ['presentar', 'biblioteca'],
    claves: ['presentar', 'pasar página', 'diapositiva', 'hotspot', 'recurso', 'anotar', 'lápiz', 'pantalla completa'],
    pasos: [
      'Arrastrá la hoja hacia la izquierda para avanzar y hacia la derecha para volver.',
      'Tocá los botones de cada pantalla para abrir estudios, videos, la ficha técnica o el modelo 3D.',
      'Con el ícono del lápiz podés dibujar sobre la pantalla mientras explicás.',
      'El ícono de cuadrícula abre el índice para saltar a cualquier pantalla.',
    ],
    enlace: { texto: 'Ir a la biblioteca', href: '#/biblioteca' },
  },
  {
    id: 'constructor',
    titulo: 'Armar una presentación a medida',
    resumen: 'Podés duplicar una presentación oficial y dejar solo las pantallas que le interesan a ese médico.',
    pantallas: ['biblioteca', 'constructor'],
    claves: ['armar', 'constructor', 'duplicar', 'editar', 'orden', 'mi presentación', 'personalizar'],
    pasos: [
      'En Biblioteca tocá "Armar presentación", o "Duplicar" sobre una oficial.',
      'Elegí las pantallas y ordenalas arrastrándolas.',
      'Ponele un nombre y guardala: queda disponible sin conexión.',
    ],
    enlace: { texto: 'Armar una presentación', href: '#/biblioteca/constructor' },
  },
  {
    id: 'muestras',
    titulo: 'Entregar muestras y dejar la firma',
    resumen: 'Cada entrega descuenta stock y queda trazada con su lote, su vencimiento y la firma de quien la recibió.',
    pantallas: ['stock', 'registro'],
    claves: ['muestras', 'stock', 'pedido', 'entregar', 'lote', 'vencimiento', 'cupo', 'remito', 'material'],
    pasos: [
      'En Stock elegí las cantidades y tocá "Solicitar".',
      'Si hay una visita abierta, la entrega queda asociada a ese médico.',
      'Al cerrar la visita, pedile la firma de recepción al profesional.',
      'En Stock → Trazabilidad ves el libro de entregas de los últimos 90 días.',
    ],
    enlace: { texto: 'Ir a Stock', href: '#/stock' },
  },
  {
    id: 'sin-conexion',
    titulo: 'Trabajar sin señal',
    resumen: 'Todo funciona sin conexión: las visitas, las firmas, las entregas y los reportes quedan guardados en la tablet.',
    pantallas: ['actividad', 'hoy'],
    claves: ['sin conexión', 'offline', 'señal', 'sincronizar', 'cola', 'pendientes', 'internet', 'wifi'],
    pasos: [
      'Seguí trabajando igual: la app no te va a frenar.',
      'En la barra de arriba vas a ver "Sin conexión" y la cantidad de movimientos pendientes.',
      'Cuando vuelve la señal se envía solo, en segundo plano.',
      'En Actividad podés ver la cola y forzar la sincronización.',
    ],
    enlace: { texto: 'Ver la cola de sincronización', href: '#/actividad' },
  },
  {
    id: 'fichero',
    titulo: 'Entender la prioridad del fichero médico',
    resumen: 'La cartera se ordena por a quién conviene ver primero, cruzando la tendencia de recetas con el tiempo sin visita.',
    pantallas: ['medicos', 'medico'],
    claves: ['fichero', 'médicos', 'prioridad', 'categoría', 'tendencia', 'recetas', 'cartera', 'frecuencia'],
    pasos: [
      'Prioridad alta: bajó su prescripción y además está atrasado respecto de su frecuencia.',
      'La frecuencia objetivo es de 30 días para categoría A, 45 para B y 60 para C.',
      'Entrá a la ficha para ver el historial, la curva de recetas y las muestras entregadas.',
    ],
    enlace: { texto: 'Ir al fichero médico', href: '#/medicos' },
  },
  {
    id: 'asistente',
    titulo: 'Preguntarle a los datos',
    resumen: 'El asistente responde en lenguaje natural sobre prescripción, visitas, muestras y feedback, y muestra siempre de dónde sacó el dato.',
    pantallas: ['asistente'],
    claves: ['asistente', 'preguntar', 'gerencia', 'consulta', 'reporte', 'tablero', 'analizar', 'sql'],
    pasos: [
      'Escribí la pregunta como se la harías a una persona.',
      'Podés filtrar nombrando el producto, la especialidad, la zona o el APM.',
      'Abrí "Cómo lo calculé" para ver la consulta y las fuentes.',
      'Si la respuesta lista médicos, podés crear un plan de visitas con un toque.',
    ],
    enlace: { texto: 'Abrir el asistente', href: '#/asistente' },
  },
  {
    id: 'academia',
    titulo: 'Cursos y certificación',
    resumen: 'Para presentar un producto hay que tener la capacitación aprobada. La evaluación se puede repetir.',
    pantallas: ['academia', 'curso'],
    claves: ['academia', 'curso', 'capacitación', 'certificado', 'examen', 'evaluación', 'puntos', 'insignias'],
    pasos: [
      'Entrá en Academia y seguí el curso del producto.',
      'Al terminar las lecciones se habilita la evaluación.',
      'Con la evaluación aprobada, la certificación aparece en Biblioteca sobre ese producto.',
    ],
    enlace: { texto: 'Ir a Academia', href: '#/academia' },
  },
  {
    id: 'compartir',
    titulo: 'Mandarle material al médico',
    resumen: 'Se puede enviar por WhatsApp, correo o SMS, siempre que el profesional haya dado su consentimiento para ese canal.',
    pantallas: ['compartir'],
    claves: ['compartir', 'whatsapp', 'correo', 'mail', 'sms', 'enviar', 'material', 'consentimiento'],
    pasos: [
      'Al terminar de presentar, tocá "Compartir material".',
      'Elegí las piezas y el canal; vas a ver el mensaje antes de enviarlo.',
      'Si el médico no dio consentimiento para un canal, ese botón aparece deshabilitado.',
    ],
    enlace: { texto: 'Ir a compartir', href: '#/cierre' },
  },
  {
    id: 'atajos',
    titulo: 'Gestos y atajos',
    resumen: 'Todo se puede hacer con el dedo, pero desde una notebook los atajos aceleran la demo.',
    pantallas: ['presentar', 'hoy'],
    claves: ['atajos', 'teclado', 'gestos', 'flechas', 'escape', 'barra espaciadora'],
    pasos: [
      'Presentación: flechas para pasar de pantalla, Escape para salir.',
      'Video: barra espaciadora para pausar, flechas para adelantar cinco segundos.',
      'Ayuda: la tecla ? abre este panel desde cualquier pantalla.',
    ],
  },
  {
    id: 'demo',
    titulo: 'Reiniciar la demostración',
    resumen: 'Deja la app como recién instalada: visitas pendientes, stock completo y cursos sin empezar.',
    pantallas: ['actividad'],
    claves: ['reiniciar', 'demo', 'borrar', 'empezar de cero', 'datos de prueba', 'cerrar sesión'],
    pasos: ['Entrá en Actividad.', 'Tocá "Reiniciar demo" y confirmá.'],
    enlace: { texto: 'Ir a Actividad', href: '#/actividad' },
  },
]

export const preguntasFrecuentes = [
  '¿Cómo cierro una visita?',
  '¿Cómo funciona el reporte por voz?',
  '¿Qué pasa si me quedo sin señal?',
  '¿Cómo pido muestras y quién firma?',
]

/** Contacto del equipo que da soporte a la cuenta */
export const soporte = {
  whatsapp: '+5491155550199',
  email: 'soporte@ioconsulting.com.ar',
  horario: 'Lunes a viernes de 9 a 18 h',
}
