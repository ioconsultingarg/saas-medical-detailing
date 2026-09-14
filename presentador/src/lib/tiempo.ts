import { useEffect, useState } from 'react'

/** Reloj que se actualiza cada `intervalo` ms; pausado mientras la pestaña está oculta */
export function useAhora(intervalo = 1000, activo = true) {
  const [ahora, setAhora] = useState(() => Date.now())

  useEffect(() => {
    if (!activo) return
    const id = window.setInterval(() => {
      if (!document.hidden) setAhora(Date.now())
    }, intervalo)
    return () => window.clearInterval(id)
  }, [intervalo, activo])

  return ahora
}

export function prefiereMenosMovimiento() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}
