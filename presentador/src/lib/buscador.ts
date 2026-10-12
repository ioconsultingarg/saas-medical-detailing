import { useCallback, useLayoutEffect, useRef, useState } from 'react'

/*
 * Búsqueda y navegación de la paleta de comandos.
 * Adaptado de beUI (MIT): el puntaje por tokens y el cursor por id. Ver CREDITS.md.
 */

export interface Buscable {
  id: string
  etiqueta: string
  grupo?: string
  claves?: string[]
}

/** Sin tildes, sin signos y en minúscula: "Dra. Méndez" y "mendez" tienen que coincidir. */
function normalizar(valor: string) {
  return valor
    .normalize('NFKD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
}

function puntajeToken(token: string, campo: string) {
  const palabras = campo.split(' ')
  if (palabras.includes(token)) return 100
  if (palabras.some((p) => p.startsWith(token))) return 80
  if (campo.includes(token)) return 60
  // con menos de tres letras no se adivina: "ac" no debería traer media app
  if (token.length < 3) return 0
  for (const palabra of palabras) {
    if (palabra.length - token.length > 2) continue
    let cubiertas = 0
    for (const letra of palabra) if (letra === token[cubiertas]) cubiertas++
    if (cubiertas === token.length) return 20
  }
  return 0
}

/** Cada palabra del texto tiene que aparecer en algún campo; el nombre pesa más. */
export function buscar<T extends Buscable>(items: T[], texto: string): T[] {
  const consulta = normalizar(texto)
  if (!consulta) return items
  const tokens = consulta.split(/\s+/)

  return items
    .map((item) => {
      const etiqueta = normalizar(item.etiqueta)
      const campos = [etiqueta, normalizar(item.grupo ?? ''), ...(item.claves ?? []).map(normalizar)]
      let puntaje = etiqueta === consulta ? 10000 : etiqueta.startsWith(consulta) ? 2000 : 0
      for (const token of tokens) {
        const mejor = Math.max(...campos.map((campo, i) => {
          const m = puntajeToken(token, campo)
          return m ? m + (i === 0 ? 40 : 0) : 0
        }))
        if (!mejor) return { item, puntaje: 0 }
        puntaje += mejor
      }
      return { item, puntaje }
    })
    .filter(({ puntaje }) => puntaje > 0)
    .sort((a, b) => b.puntaje - a.puntaje)
    .map(({ item }) => item)
}

type Cursor = { id: string; consulta: string }

function indiceDe(filas: readonly { id: string }[], consulta: string, cursor: Cursor | null) {
  if (cursor === null || cursor.consulta !== consulta) return -1
  return filas.findIndex((f) => f.id === cursor.id)
}

/**
 * La fila resaltada de una lista que cambia debajo del cursor.
 *
 * Guarda el **id** de la fila, no su posición: una lista que se achicó y otra que
 * cambió sus filas por otras distintas tienen el mismo largo, y en el segundo caso
 * Enter confirmaría una fila que la persona nunca eligió. El cursor además lleva
 * sellada la consulta con la que se puso, así que al escribir otra letra se descarta
 * solo y el resaltado vuelve a la primera fila.
 */
export function useCursorFila(filas: readonly { id: string }[], consulta: string) {
  const [cursor, setCursor] = useState<Cursor | null>(null)
  // se escribe después del commit: un render que React descarta no debe sellar nada
  const ultimo = useRef({ filas, consulta })
  useLayoutEffect(() => {
    ultimo.current = { filas, consulta }
  })

  const indice = indiceDe(filas, consulta, cursor)
  if (cursor !== null && indice < 0) setCursor(null)

  const mover = useCallback((id: string | null) => {
    setCursor(id === null ? null : { id, consulta: ultimo.current.consulta })
  }, [])

  const moverActiva = useCallback((paso: 1 | -1) => {
    const { filas: vivas, consulta: c } = ultimo.current
    const ultima = vivas.length - 1
    if (ultima < 0) return
    // el paso se calcula adentro del update: dos teclas en un mismo lote mueven dos filas
    setCursor((actual) => {
      const en = Math.max(indiceDe(vivas, c, actual), 0)
      return { id: vivas[Math.min(Math.max(en + paso, 0), ultima)].id, consulta: c }
    })
  }, [])

  return { activa: indice < 0 ? 0 : indice, mover, moverActiva }
}
