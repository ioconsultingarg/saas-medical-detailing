import { useCallback, useEffect, useState } from 'react'

/*
 * Modo claro y oscuro. La preferencia se guarda en el dispositivo; "automático" sigue
 * lo que tenga configurado el sistema. El atributo data-tema del documento queda siempre
 * resuelto en claro u oscuro, así el CSS no necesita duplicar cada regla.
 */

export type Tema = 'claro' | 'oscuro' | 'auto'

const CLAVE = 'io-pharma-tema'

export function temaGuardado(): Tema {
  try {
    const t = localStorage.getItem(CLAVE)
    return t === 'claro' || t === 'oscuro' ? t : 'auto'
  } catch {
    return 'auto'
  }
}

function sistemaEnOscuro() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-color-scheme: dark)').matches
}

export function aplicarTema(tema: Tema) {
  const oscuro = tema === 'oscuro' || (tema === 'auto' && sistemaEnOscuro())
  document.documentElement.dataset.tema = oscuro ? 'oscuro' : 'claro'
  document.documentElement.style.colorScheme = oscuro ? 'dark' : 'light'
}

export function useTema() {
  const [tema, setTema] = useState<Tema>(temaGuardado)

  useEffect(() => {
    aplicarTema(tema)
    try {
      if (tema === 'auto') localStorage.removeItem(CLAVE)
      else localStorage.setItem(CLAVE, tema)
    } catch {
      // sin almacenamiento: la preferencia dura lo que la pestaña
    }
  }, [tema])

  // en automático, seguir los cambios del sistema sin recargar
  useEffect(() => {
    if (tema !== 'auto' || typeof matchMedia === 'undefined') return
    const mq = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => aplicarTema('auto')
    mq.addEventListener('change', alCambiar)
    return () => mq.removeEventListener('change', alCambiar)
  }, [tema])

  const cambiar = useCallback((t: Tema) => setTema(t), [])

  return { tema, cambiar, oscuro: document.documentElement.dataset.tema === 'oscuro' }
}
