import type { ProductoId } from '../types'
import { haceDias } from './crm'

/*
 * Cuentas institucionales: droguerías, cadenas de farmacias, instituciones y financiadores.
 * Es donde el laboratorio factura de verdad, aunque la receta la escriba el médico.
 * Datos ficticios, generados con valores fijos para que la demo sea siempre igual.
 */

export type TipoCuenta = 'drogueria' | 'cadena' | 'institucion' | 'financiador'
export type EstadoCuenta = 'activa' | 'negociacion' | 'inactiva'

export interface Contacto {
  nombre: string
  cargo: string
  telefono: string
  email: string
}

export interface Acuerdo {
  id: string
  titulo: string
  detalle: string
  vence: number
}

export interface Movimiento {
  fecha: number
  tipo: 'reunion' | 'acuerdo' | 'pedido' | 'reclamo' | 'nota'
  titulo: string
  detalle: string
  autor: string
}

export interface Cuenta {
  id: string
  nombre: string
  tipo: TipoCuenta
  cuit: string
  localidad: string
  zona: string
  kam: string
  estado: EstadoCuenta
  /** compras de los últimos 6 meses, en unidades */
  compras: number[]
  productos: ProductoId[]
  condiciones: { descuento: number; plazoPago: number; exhibicion: string }
  contactos: Contacto[]
  acuerdos: Acuerdo[]
  historial: Movimiento[]
  /** días desde el último contacto registrado */
  diasSinContacto: number
}

export const etiquetaTipo: Record<TipoCuenta, string> = {
  drogueria: 'Droguería',
  cadena: 'Cadena de farmacias',
  institucion: 'Institución',
  financiador: 'Obra social o prepaga',
}

export const etiquetaEstado: Record<EstadoCuenta, string> = {
  activa: 'Activa',
  negociacion: 'En negociación',
  inactiva: 'Sin operar',
}

export const etiquetaMovimiento: Record<Movimiento['tipo'], string> = {
  reunion: 'Reunión',
  acuerdo: 'Acuerdo',
  pedido: 'Pedido',
  reclamo: 'Reclamo',
  nota: 'Nota',
}

export const cuentas: Cuenta[] = [
  {
    id: 'c1',
    nombre: 'Droguería del Litoral',
    tipo: 'drogueria',
    cuit: '30-71234567-4',
    localidad: 'Rosario, Santa Fe',
    zona: 'Litoral',
    kam: 'Diego Salas',
    estado: 'activa',
    compras: [4200, 4550, 4310, 4980, 5240, 5610],
    productos: ['cardio', 'respira'],
    condiciones: { descuento: 22, plazoPago: 60, exhibicion: 'Góndola preferencial en 40 farmacias' },
    contactos: [
      { nombre: 'Andrés Puig', cargo: 'Gerente de compras', telefono: '+5493415550110', email: 'apuig@ejemplo.com' },
      { nombre: 'Silvia Roldán', cargo: 'Administración', telefono: '+5493415550111', email: 'sroldan@ejemplo.com' },
    ],
    acuerdos: [
      { id: 'a1', titulo: 'Acuerdo de volumen 2026', detalle: '22 % de descuento sobre 5.000 unidades trimestrales', vence: haceDias(-74, 12) },
      { id: 'a2', titulo: 'Exhibición en góndola', detalle: 'Cabecera en 40 farmacias de la red, revisión trimestral', vence: haceDias(-22, 12) },
    ],
    historial: [
      { fecha: haceDias(9, 11), tipo: 'pedido', titulo: 'Pedido mensual por 5.610 unidades', detalle: 'Creció 7 % contra el mes anterior, empujado por Lipvera 20 mg.', autor: 'Diego Salas' },
      { fecha: haceDias(24, 15), tipo: 'reunion', titulo: 'Revisión trimestral con compras', detalle: 'Pidieron mejorar el plazo de pago a 75 días a cambio de sostener el volumen.', autor: 'Diego Salas' },
      { fecha: haceDias(51, 10), tipo: 'acuerdo', titulo: 'Renovación del acuerdo de volumen', detalle: 'Se mantuvo el 22 % con revisión en diciembre.', autor: 'Dirección comercial' },
    ],
    diasSinContacto: 9,
  },
  {
    id: 'c2',
    nombre: 'Distribuidora Andes',
    tipo: 'drogueria',
    cuit: '30-70998877-1',
    localidad: 'Mendoza',
    zona: 'Cuyo',
    kam: 'Mariana Costa',
    estado: 'activa',
    compras: [2600, 2480, 2390, 2210, 2050, 1870],
    productos: ['cardio'],
    condiciones: { descuento: 18, plazoPago: 45, exhibicion: 'Sin acuerdo de exhibición' },
    contactos: [{ nombre: 'Gustavo Reta', cargo: 'Dueño', telefono: '+5492615550120', email: 'greta@ejemplo.com' }],
    acuerdos: [{ id: 'a3', titulo: 'Condición comercial estándar', detalle: '18 % de descuento, sin compromiso de volumen', vence: haceDias(-12, 12) }],
    historial: [
      { fecha: haceDias(38, 16), tipo: 'reclamo', titulo: 'Reclamo por faltante de Lipvera 20 mg × 60', detalle: 'Se quedaron sin stock tres semanas y derivaron recetas a la competencia.', autor: 'Mariana Costa' },
      { fecha: haceDias(72, 11), tipo: 'reunion', titulo: 'Visita comercial', detalle: 'Plantearon que el descuento quedó por debajo del mercado.', autor: 'Mariana Costa' },
    ],
    diasSinContacto: 38,
  },
  {
    id: 'c3',
    nombre: 'Farmacias Vital',
    tipo: 'cadena',
    cuit: '30-71555444-8',
    localidad: 'CABA y GBA',
    zona: 'Norte',
    kam: 'Lucía Romero',
    estado: 'activa',
    compras: [3100, 3240, 3480, 3520, 3810, 4020],
    productos: ['cardio', 'respira'],
    condiciones: { descuento: 25, plazoPago: 90, exhibicion: '62 sucursales con material en mostrador' },
    contactos: [
      { nombre: 'Paula Iriarte', cargo: 'Gerenta comercial', telefono: '+5491155550130', email: 'piriarte@ejemplo.com' },
      { nombre: 'Marcos Levi', cargo: 'Category manager', telefono: '+5491155550131', email: 'mlevi@ejemplo.com' },
    ],
    acuerdos: [
      { id: 'a4', titulo: 'Acuerdo anual de exhibición', detalle: 'Material en mostrador en 62 sucursales', vence: haceDias(-9, 12) },
      { id: 'a5', titulo: 'Campaña de invierno respiratoria', detalle: 'Descuento adicional del 4 % de junio a agosto', vence: haceDias(-118, 12) },
    ],
    historial: [
      { fecha: haceDias(4, 10), tipo: 'reunion', titulo: 'Preparación de la campaña de invierno', detalle: 'Quieren cerrar el material de Respirel antes de fin de mes.', autor: 'Lucía Romero' },
      { fecha: haceDias(19, 14), tipo: 'acuerdo', titulo: 'Ampliación a 62 sucursales', detalle: 'Se sumaron 8 sucursales del corredor norte.', autor: 'Lucía Romero' },
      { fecha: haceDias(46, 9), tipo: 'pedido', titulo: 'Pedido trimestral', detalle: '4.020 unidades, récord de la cuenta.', autor: 'Sistema' },
    ],
    diasSinContacto: 4,
  },
  {
    id: 'c4',
    nombre: 'Red Farmasalud',
    tipo: 'cadena',
    cuit: '30-71777222-3',
    localidad: 'Córdoba',
    zona: 'Centro',
    kam: 'Diego Salas',
    estado: 'negociacion',
    compras: [0, 0, 0, 0, 0, 0],
    productos: ['cardio', 'respira'],
    condiciones: { descuento: 0, plazoPago: 0, exhibicion: 'A definir' },
    contactos: [{ nombre: 'Verónica Lastra', cargo: 'Directora de compras', telefono: '+5493515550140', email: 'vlastra@ejemplo.com' }],
    acuerdos: [],
    historial: [
      { fecha: haceDias(6, 15), tipo: 'reunion', titulo: 'Segunda reunión de apertura', detalle: 'Piden 28 % y 90 días para abrir la cuenta. Dirección comercial evalúa.', autor: 'Diego Salas' },
      { fecha: haceDias(27, 11), tipo: 'nota', titulo: 'Presentación institucional', detalle: 'Se envió el portfolio completo y la ficha de proveedor.', autor: 'Diego Salas' },
    ],
    diasSinContacto: 6,
  },
  {
    id: 'c5',
    nombre: 'Hospital Municipal San Martín',
    tipo: 'institucion',
    cuit: '30-99887766-5',
    localidad: 'La Plata, Buenos Aires',
    zona: 'Sur',
    kam: 'Tomás Herrera',
    estado: 'activa',
    compras: [820, 760, 910, 880, 940, 1010],
    productos: ['respira'],
    condiciones: { descuento: 30, plazoPago: 120, exhibicion: 'No aplica' },
    contactos: [{ nombre: 'Dra. Norma Villar', cargo: 'Jefa de Farmacia', telefono: '+5492215550150', email: 'nvillar@ejemplo.com' }],
    acuerdos: [{ id: 'a6', titulo: 'Provisión por licitación 2026', detalle: 'Renovable por 12 meses', vence: haceDias(-47, 12) }],
    historial: [
      { fecha: haceDias(14, 10), tipo: 'pedido', titulo: 'Entrega mensual del período', detalle: '1.010 unidades de Respirel 200 mcg.', autor: 'Sistema' },
      { fecha: haceDias(60, 13), tipo: 'reunion', titulo: 'Reunión con Farmacia', detalle: 'Anticiparon el llamado a licitación del próximo período.', autor: 'Tomás Herrera' },
    ],
    diasSinContacto: 14,
  },
  {
    id: 'c6',
    nombre: 'Droguería Suramericana',
    tipo: 'drogueria',
    cuit: '30-70445566-9',
    localidad: 'Tucumán',
    zona: 'Norte grande',
    kam: 'Mariana Costa',
    estado: 'inactiva',
    compras: [1400, 1180, 640, 0, 0, 0],
    productos: ['cardio'],
    condiciones: { descuento: 20, plazoPago: 60, exhibicion: 'Sin acuerdo' },
    contactos: [{ nombre: 'Hernán Pizarro', cargo: 'Compras', telefono: '+5493815550160', email: 'hpizarro@ejemplo.com' }],
    acuerdos: [],
    historial: [
      { fecha: haceDias(96, 12), tipo: 'reclamo', titulo: 'Cuenta suspendida por mora', detalle: 'Quedaron dos facturas impagas; Administración frenó las entregas.', autor: 'Administración' },
      { fecha: haceDias(140, 10), tipo: 'pedido', titulo: 'Último pedido despachado', detalle: '640 unidades.', autor: 'Sistema' },
    ],
    diasSinContacto: 96,
  },
  {
    id: 'c7',
    nombre: 'Obra Social Metalúrgicos',
    tipo: 'financiador',
    cuit: '30-54332211-7',
    localidad: 'CABA',
    zona: 'Norte',
    kam: 'Lucía Romero',
    estado: 'negociacion',
    compras: [0, 0, 0, 0, 0, 0],
    productos: ['cardio'],
    condiciones: { descuento: 0, plazoPago: 0, exhibicion: 'No aplica' },
    contactos: [{ nombre: 'Lic. Raúl Ferrante', cargo: 'Gerencia de prestaciones', telefono: '+5491155550170', email: 'rferrante@ejemplo.com' }],
    acuerdos: [],
    historial: [
      { fecha: haceDias(11, 16), tipo: 'reunion', titulo: 'Presentación del dossier de valor', detalle: 'Analizan incorporar Lipvera al vademécum con cobertura del 70 %.', autor: 'Lucía Romero' },
    ],
    diasSinContacto: 11,
  },
]

export const cuentaPorId = Object.fromEntries(cuentas.map((c) => [c.id, c])) as Record<string, Cuenta>

const suma = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

/** Variación de compras: último trimestre contra el anterior */
export function variacionCompras(c: Cuenta) {
  const actual = suma(c.compras.slice(3))
  const anterior = suma(c.compras.slice(0, 3))
  return anterior > 0 ? actual / anterior - 1 : actual > 0 ? 1 : 0
}

export function comprasTrimestre(c: Cuenta) {
  return suma(c.compras.slice(3))
}

/** Acuerdos que vencen dentro de los próximos 60 días */
export function acuerdosPorVencer(c: Cuenta, dias = 60) {
  const limite = Date.now() + dias * 86400000
  return c.acuerdos.filter((a) => a.vence <= limite)
}
