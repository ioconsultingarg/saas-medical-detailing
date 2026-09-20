import { articulos, type Articulo } from '../data/ayuda'
import { normalizar } from './extraccionVoz'
import type { Ruta } from './ruta'

/*
 * Buscador del manual: coincidencia local por palabras, con preferencia por la pantalla en uso.
 * En producción esto lo resuelve un modelo que lee el mismo manual y los tickets de soporte.
 */

const vacias = new Set(['como', 'que', 'donde', 'cual', 'cuales', 'para', 'por', 'una', 'uno', 'los', 'las', 'del', 'con', 'sin', 'the', 'hago', 'hace', 'puedo', 'quiero', 'app', 'esta', 'este'])

function palabras(texto: string) {
  return normalizar(texto)
    .replace(/[¿?¡!.,;:()]/g, ' ')
    .split(/\s+/)
    .filter((p) => p.length > 2 && !vacias.has(p))
}

export interface Resultado {
  articulo: Articulo
  puntaje: number
}

export function buscarAyuda(consulta: string, pantalla?: Ruta['nombre']): Resultado[] {
  const termos = palabras(consulta)
  if (termos.length === 0) return []

  return articulos
    .map((a) => {
      const claves = normalizar(a.claves.join(' '))
      const titulo = normalizar(a.titulo)
      const cuerpo = normalizar(`${a.resumen} ${(a.pasos ?? []).join(' ')}`)
      let puntaje = 0
      for (const t of termos) {
        if (claves.includes(t)) puntaje += 3
        if (titulo.includes(t)) puntaje += 2
        if (cuerpo.includes(t)) puntaje += 1
      }
      if (puntaje > 0 && pantalla && a.pantallas.includes(pantalla)) puntaje += 1.5
      return { articulo: a, puntaje }
    })
    .filter((r) => r.puntaje >= 3)
    .sort((a, b) => b.puntaje - a.puntaje)
    .slice(0, 3)
}

/** Artículos que corresponden a la pantalla en la que está el usuario */
export function ayudaDePantalla(pantalla: Ruta['nombre']) {
  return articulos.filter((a) => a.pantallas.includes(pantalla)).slice(0, 3)
}
