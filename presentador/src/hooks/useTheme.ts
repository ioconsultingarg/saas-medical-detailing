import { useEffect, useState } from 'react'

export type Tema = 'light' | 'dark'

const STORAGE_KEY = 'presentador-tema'

function temaInicial(): Tema {
  try {
    const guardado = localStorage.getItem(STORAGE_KEY)
    if (guardado === 'light' || guardado === 'dark') return guardado
  } catch {
    // localStorage bloqueado (modo privado): seguimos con la preferencia del sistema
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function useTheme() {
  const [tema, setTema] = useState<Tema>(temaInicial)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'dark')
    try {
      localStorage.setItem(STORAGE_KEY, tema)
    } catch {
      // sin persistencia: el tema vive solo en esta sesión
    }
  }, [tema])

  return {
    tema,
    alternar: () => setTema((actual) => (actual === 'dark' ? 'light' : 'dark')),
  }
}
