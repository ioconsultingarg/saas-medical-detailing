export type ProductoId = 'cardio' | 'respira'

export interface Producto {
  id: ProductoId
  marca: string
  detalle: string
  linea: string
  color: string
  /** secundario de marca para resaltar la cifra clave (lima / ámbar en la spec) */
  acento: string
  /** texto legible sobre el acento */
  sobreAcento: string
  colorOscuro: string
  tinte: string
}

export interface Medico {
  nombre: string
  especialidad: string
  telefono: string
  email: string
}

export interface Visita {
  id: string
  /** ficha del médico en el CRM */
  medicoId: string
  hora: string
  medico: Medico
  consultorio: string
  direccion: string
  barrio: string
  lat: number
  lng: number
  productosInteres: ProductoId[]
  nota: string
}

export type EstadoVisita = 'pendiente' | 'en_curso' | 'completada'

export interface RegistroVisita {
  estado: EstadoVisita
  checkIn?: number
  checkOut?: number
  distanciaCheckIn?: number
  calificacion?: number
  etiquetas?: string[]
  nota?: string
  firma?: string
  muestras?: number
  productos?: ProductoId[]
  /** el registro se completó a partir de un reporte por voz */
  origen?: 'manual' | 'voz'
}

export type TipoItemStock = 'comercial' | 'muestra' | 'material'

export interface ItemStock {
  sku: string
  productoId: ProductoId | null
  nombre: string
  tipo: TipoItemStock
  unidades: number
  umbralBajo: number
  /** trazabilidad: lote vigente y vencimiento (AAAA-MM) */
  lote?: string
  vencimiento?: string
}

export type NivelStock = 'alto' | 'bajo' | 'sin'

export interface Diapositiva {
  id: string
  productoId: ProductoId
  titulo: string
}

export interface Presentacion {
  id: string
  titulo: string
  descripcion: string
  diapositivas: string[]
  tipo: 'oficial' | 'personal'
  creada?: number
}

export type TipoOutbox = 'checkin' | 'checkout' | 'pedido' | 'envio' | 'firma' | 'voz' | 'farmacovigilancia' | 'plan' | 'pieza'

export interface ItemOutbox {
  id: string
  tipo: TipoOutbox
  resumen: string
  creado: number
  sincronizado: number | null
}

export type EstadoFirma = 'digital' | 'papel' | 'pendiente'

/** Entrega de muestras médicas: una fila por lote, firmada por el profesional */
export interface EntregaMuestra {
  id: string
  medicoId: string
  visitaId: string | null
  fecha: number
  sku: string
  lote: string
  vencimiento: string
  cantidad: number
  firma: EstadoFirma
  sincronizado: boolean
}

export interface DwellEvent {
  nodoId: string
  apmId: string
  timestampInicio: number
  timestampFin: number
  sincronizado: boolean
}
