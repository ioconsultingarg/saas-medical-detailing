import { apellido, medicos, tratamiento } from '../data/crm'
import { productos } from '../data/productos'
import type { ItemStock, ProductoId, Visita } from '../types'

/*
 * Extracción de entidades de un reporte dictado.
 * En producción esto lo resuelve un LLM con salida estructurada (JSON Schema);
 * en la demo, un extractor local con las mismas salidas para que funcione sin conexión.
 */

export type TipoEntidad = 'medico' | 'producto' | 'muestra' | 'feedback' | 'accion' | 'evento'

export interface Entidad {
  inicio: number
  fin: number
  tipo: TipoEntidad
}

export interface ItemDictado {
  sku: string
  nombre: string
  cantidad: number
  /** unidades que realmente se pueden registrar con el stock actual */
  disponible: number
}

export interface ExtraccionVoz {
  transcripcion: string
  medico: { nombre: string; coincide: boolean } | null
  productos: ProductoId[]
  items: ItemDictado[]
  calificacion: number
  sentimiento: 'positivo' | 'neutro' | 'negativo'
  etiquetas: string[]
  proximoPaso: string | null
  eventoAdverso: string | null
  resumen: string
  entidades: Entidad[]
  /** proporción de campos del CRM que se completaron */
  cobertura: number
}

/** Minúsculas sin tildes, conservando la longitud para poder resaltar sobre el texto original */
export function normalizar(texto: string) {
  return Array.from(texto, (c) => c.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()[0] ?? c).join('')
}

const numeros: Record<string, number> = {
  un: 1, una: 1, uno: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, diez: 10,
  once: 11, doce: 12, quince: 15, veinte: 20,
}
const numeroRe = `(\\d+|${Object.keys(numeros).join('|')})`

const aliasProducto: [ProductoId, RegExp][] = [
  ['cardio', /demo[\s-]?molecula|estatina|colesterol|\bldl\b/g],
  ['respira', /respirel|inhalador|broncodilatador|\bepoc\b|\basma\b|tecnica inhalatoria/g],
]

const reglasEtiqueta: [string, RegExp][] = [
  ['Pidió estudios', /estudio|separata|paper|publicacion|evidencia/g],
  ['Interesado en muestras', /(pidio|quiere|necesita|mas) muestras|interes\w* en (las )?muestras/g],
  ['Objeción de costo', /\bcost\w*|\bcaro\b|precio/g],
  ['Objeción de cobertura', /cobertura|prepaga\w*|obra social|\bpami\b/g],
  ['Volver en 15 días', /(dos|2) semanas|(15|quince) dias/g],
  ['Derivar a MSL', /\bmsl\b|asuntos medicos|consulta cientifica/g],
]

const positivas = /(?<!no le )interes\w*|conforme|le gusto|receptiv|entusiasm|muy bien|excelente|va a (empezar|probar|indicar|recetar)|(empezar|comenzar) a (indicar|recetar)/g
const negativas = /no le interes|reticente|desconfi|no quiere|prefiere seguir|dudas|no esta convencid|se quejo/g
const eventoRe = /efecto (adverso|secundario)|reaccion adversa|dolor muscular|mialgia|nauseas|mareo|sarpullido|palpitaciones|picazon|hepatotox/g
const accionRe = /volver|proxima visita|llevar(le)?|enviar(le)?|mandar(le)?|agendar|seguimiento|quedamos en/

function oraciones(texto: string) {
  const out: { inicio: number; fin: number }[] = []
  const re = /[^.!?]+[.!?]?/g
  let m: RegExpExecArray | null
  while ((m = re.exec(texto))) {
    const bruto = m[0]
    const lead = bruto.length - bruto.trimStart().length
    if (bruto.trim()) out.push({ inicio: m.index + lead, fin: m.index + bruto.trimEnd().length })
  }
  return out
}

function todos(re: RegExp, texto: string) {
  re.lastIndex = 0
  return [...texto.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : `${re.flags}g`))]
}

export function extraer(transcripcion: string, contexto: { visita: Visita; stock: ItemStock[] }): ExtraccionVoz {
  const texto = transcripcion.trim()
  const n = normalizar(texto)
  const entidades: Entidad[] = []
  const marcar = (inicio: number, largo: number, tipo: TipoEntidad) => entidades.push({ inicio, fin: inicio + largo, tipo })

  // Médico: se valida contra la visita en curso y el resto del fichero
  let medico: ExtraccionVoz['medico'] = null
  const candidatos = [...medicos.filter((m) => m.id === contexto.visita.medicoId), ...medicos.filter((m) => m.id !== contexto.visita.medicoId)]
  for (const m of candidatos) {
    const ap = normalizar(apellido(m.nombre))
    const re = new RegExp(`(?:\\b(?:dr|dra|doctor|doctora)\\.?\\s+(?:\\w+\\s+)?)?\\b${ap}\\b`, 'g')
    const hit = todos(re, n)[0]
    if (hit?.index !== undefined) {
      medico = { nombre: m.nombre, coincide: m.id === contexto.visita.medicoId }
      marcar(hit.index, hit[0].length, 'medico')
      break
    }
  }

  // Productos
  const prods = new Set<ProductoId>()
  const menciones: { p: ProductoId; pos: number }[] = []
  for (const [id, re] of aliasProducto) {
    for (const hit of todos(re, n)) {
      prods.add(id)
      menciones.push({ p: id, pos: hit.index! })
      marcar(hit.index!, hit[0].length, 'producto')
    }
  }
  if (prods.size === 0) contexto.visita.productosInteres.forEach((p) => prods.add(p))

  // Muestras y material: cantidad + sustantivo, asociado al producto mencionado más cerca
  const items = new Map<string, number>()
  const cantidadRe = new RegExp(`\\b${numeroRe}\\s+(?:\\w+\\s+){0,2}?(muestras?|aerocamaras?|folletos?|guias?)\\b`, 'g')
  for (const hit of todos(cantidadRe, n)) {
    const bruto = hit[1]
    const cantidad = /\d/.test(bruto) ? Number(bruto) : numeros[bruto]
    const sustantivo = hit[2]
    let sku: string | null = null
    if (sustantivo.startsWith('aerocamara')) sku = 'RM-AERO'
    else {
      const cercano = menciones.length
        ? menciones.reduce((a, b) => (Math.abs(b.pos - hit.index!) < Math.abs(a.pos - hit.index!) ? b : a)).p
        : [...prods][0]
      if (sustantivo.startsWith('muestra')) sku = cercano === 'cardio' ? 'DM-MM-7' : 'RM-MM-60'
      else sku = cercano === 'cardio' ? 'MAT-FOL-C' : 'MAT-FOL-R'
    }
    // "una aerocámara" también cuenta, pero no "veinte miligramos"
    items.set(sku, (items.get(sku) ?? 0) + cantidad)
    marcar(hit.index!, hit[0].length, 'muestra')
  }
  for (const hit of todos(/\b(una|un) aerocamara\b/g, n)) {
    if (!entidades.some((e) => e.inicio <= hit.index! && e.fin >= hit.index! + hit[0].length)) {
      items.set('RM-AERO', (items.get('RM-AERO') ?? 0) + 1)
      marcar(hit.index!, hit[0].length, 'muestra')
    }
  }
  const listaItems: ItemDictado[] = [...items].map(([sku, cantidad]) => {
    const s = contexto.stock.find((x) => x.sku === sku)
    return { sku, nombre: s?.nombre ?? sku, cantidad, disponible: Math.min(cantidad, s?.unidades ?? 0) }
  })

  // Feedback
  const etiquetas: string[] = []
  for (const [etiqueta, re] of reglasEtiqueta) {
    const hits = todos(re, n)
    if (hits.length) {
      etiquetas.push(etiqueta)
      hits.forEach((h) => marcar(h.index!, h[0].length, 'feedback'))
    }
  }

  const pos = todos(positivas, n)
  const neg = todos(negativas, n)
  pos.forEach((h) => marcar(h.index!, h[0].length, 'feedback'))
  neg.forEach((h) => marcar(h.index!, h[0].length, 'feedback'))
  const intencion = /va a (empezar|probar|indicar|recetar)|(empezar|comenzar) a (indicar|recetar)/.test(n)
  const bruto = pos.length - neg.length
  // una objeción resta, pero no convierte en negativa una visita con interés real
  const puntaje = etiquetas.some((e) => e.startsWith('Objeción')) ? (bruto > 0 ? bruto - 1 : bruto - (neg.length ? 0 : 1)) : bruto
  const calificacion = Math.max(1, Math.min(5, intencion ? 5 : 3 + Math.sign(puntaje) * Math.min(2, Math.abs(puntaje))))
  const sentimiento = calificacion >= 4 ? 'positivo' : calificacion <= 2 ? 'negativo' : 'neutro'

  // Próximo paso y posible evento adverso: se toma la oración completa
  const frases = oraciones(texto)
  let proximoPaso: string | null = null
  let eventoAdverso: string | null = null
  for (const f of frases) {
    const fn = n.slice(f.inicio, f.fin)
    if (!proximoPaso && accionRe.test(fn)) {
      proximoPaso = texto.slice(f.inicio, f.fin).replace(/[.!?]$/, '')
      marcar(f.inicio, f.fin - f.inicio, 'accion')
    }
    const ev = todos(eventoRe, fn)[0]
    if (!eventoAdverso && ev) {
      eventoAdverso = texto.slice(f.inicio, f.fin).replace(/[.!?]$/, '')
      marcar(f.inicio + ev.index!, ev[0].length, 'evento')
    }
  }

  const nombresProductos = [...prods].map((p) => productos[p].marca).join(' y ')
  const partes = [
    `Presentó ${nombresProductos}.`,
    etiquetas.length ? `Feedback: ${etiquetas.map((e) => e.toLowerCase()).join(', ')}.` : '',
    proximoPaso ? `Próximo paso: ${proximoPaso.charAt(0).toLowerCase()}${proximoPaso.slice(1)}.` : '',
    eventoAdverso ? 'Se detectó un posible evento adverso.' : '',
  ]

  const campos = [medico, prods.size, listaItems.length, etiquetas.length, proximoPaso, pos.length + neg.length]
  return {
    transcripcion: texto,
    medico,
    productos: [...prods],
    items: listaItems,
    calificacion,
    sentimiento,
    etiquetas,
    proximoPaso,
    eventoAdverso,
    resumen: partes.filter(Boolean).join(' '),
    entidades: depurar(entidades),
    cobertura: campos.filter(Boolean).length / campos.length,
  }
}

/** Quita superposiciones: gana la entidad más larga */
function depurar(entidades: Entidad[]) {
  const orden = [...entidades].sort((a, b) => b.fin - b.inicio - (a.fin - a.inicio))
  const elegidas: Entidad[] = []
  for (const e of orden) {
    if (e.tipo === 'accion') continue
    if (!elegidas.some((x) => e.inicio < x.fin && e.fin > x.inicio)) elegidas.push(e)
  }
  return elegidas.sort((a, b) => a.inicio - b.inicio)
}

/** Guion de ejemplo para la visita en curso, cuando no hay micrófono o reconocimiento de voz */
export function guionEjemplo(visita: Visita) {
  const trato = tratamiento(visita.medico.nombre) === 'la doctora' ? 'a la doctora' : 'al doctor'
  const ap = apellido(visita.medico.nombre)
  const cardio = visita.productosInteres.includes('cardio')
  const respira = visita.productosInteres.includes('respira')
  if (cardio && respira) {
    return `Salgo de ver ${trato} ${ap}. Le mostré Lipvera con los datos de LDL a la semana 52 y le interesó mucho. Le dejé cuatro muestras. También repasamos la técnica inhalatoria de Respirel y le dejé una aerocámara. Tiene dudas con la cobertura de la obra social. Quedamos en volver en dos semanas con el estudio completo.`
  }
  if (respira) {
    return `Recién termino con ${trato.replace(/^al /, 'el ').replace(/^a la /, 'la ')} ${ap}. Repasamos la técnica inhalatoria de Respirel y quedó muy conforme, va a empezar a indicarlo en pacientes con EPOC. Le dejé una aerocámara y seis muestras. Pidió folletos para adultos mayores. Quedamos en volver en quince días.`
  }
  return `Salgo de ver ${trato} ${ap}. Le presenté Lipvera y le interesaron los datos de reducción de LDL a la semana 52. Le dejé seis muestras. Tiene una objeción con la cobertura de las prepagas y pidió el estudio completo. Comentó que un paciente tuvo dolor muscular leve en el primer mes. Quedamos en volver en dos semanas con la información de cobertura.`
}
