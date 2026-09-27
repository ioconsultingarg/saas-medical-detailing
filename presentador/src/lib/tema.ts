import { useCallback, useEffect, useState } from 'react'

/*
 * Modo claro y oscuro.
 *
 * La app arranca SIEMPRE en oscuro: la visita ocurre en consultorios y pasillos con poca
 * luz, y una pantalla clara encandila y se ve desde lejos. El visitador puede pasar a claro
 * desde su cuenta y esa elección le queda guardada en el dispositivo.
 *
 * El ingreso es la excepción: se muestra siempre en oscuro, sin ofrecer la opción, porque
 * todavía no hay una persona identificada de quien respetar la preferencia.
 */

export type Tema = 'claro' | 'oscuro'

const CLAVE = 'io-pharma-tema'
export const TEMA_POR_DEFECTO: Tema = 'oscuro'

export function temaGuardado(): Tema {
  try {
    return localStorage.getItem(CLAVE) === 'claro' ? 'claro' : TEMA_POR_DEFECTO
  } catch {
    return TEMA_POR_DEFECTO
  }
}

export function aplicarTema(tema: Tema) {
  document.documentElement.dataset.tema = tema
  document.documentElement.style.colorScheme = tema === 'oscuro' ? 'dark' : 'light'
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', tema === 'oscuro' ? '#0a0f16' : '#f7f8fa')
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaGuardado)

  useEffect(() => {
    aplicarTema(tema)
    try {
      localStorage.setItem(CLAVE, tema)
    } catch {
      // sin almacenamiento: la preferencia dura lo que la pestaña
    }
  }, [tema])

  const cambiar = useCallback((t: Tema) => setTema(t), [])

  return { tema, cambiar, oscuro: tema === 'oscuro' }
}

/** El ingreso se ve en oscuro pase lo que pase; al salir de la pantalla vuelve la preferencia */
export function useTemaFijoOscuro() {
  useEffect(() => {
    aplicarTema('oscuro')
    return () => aplicarTema(temaGuardado())
  }, [])
}
