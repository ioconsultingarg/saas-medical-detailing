import type { Producto, ProductoId } from '../types'

// Marcas ficticias para la demo: no corresponden a ningún medicamento real.
// Paletas tomadas de 02-SISTEMA-DE-DISENO.md §1.3.
export const productos: Record<ProductoId, Producto> = {
  cardio: {
    id: 'cardio',
    marca: 'Demo-molécula',
    detalle: '20 mg · comprimidos recubiertos',
    linea: 'Cardiometabólica',
    color: '#0a6b5d',
    acento: '#cfe94a',
    sobreAcento: '#06433a',
    colorOscuro: '#06433a',
    tinte: '#e4f2ee',
  },
  respira: {
    id: 'respira',
    marca: 'Respira-mol',
    detalle: '200 mcg · inhalador presurizado',
    linea: 'Respiratoria',
    color: '#144f85',
    acento: '#f5a623',
    sobreAcento: '#0b2d4d',
    colorOscuro: '#0b2d4d',
    tinte: '#e6eef6',
  },
}

export const listaProductos = Object.values(productos)
