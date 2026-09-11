import { useEffect, useRef, useState } from 'react'

function prefiereMenosMovimiento() {
  return typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Desplazamiento sutil para capas decorativas del fondo.
 * Nunca aplicar a texto ni a controles: marea y perjudica la lectura.
 */
export function useParallax(factor = 0.08) {
  const [desplazamiento, setDesplazamiento] = useState(0)

  useEffect(() => {
    if (prefiereMenosMovimiento()) return

    let pendiente = false
    function onScroll() {
      if (pendiente) return
      pendiente = true
      requestAnimationFrame(() => {
        setDesplazamiento(window.scrollY * factor)
        pendiente = false
      })
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [factor])

  return desplazamiento
}

/** true una vez que el scroll pasó el umbral — para el menú que cambia al hacer scroll */
export function useScrolled(umbral = 24) {
  const [pasado, setPasado] = useState(false)

  useEffect(() => {
    function onScroll() {
      setPasado(window.scrollY > umbral)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [umbral])

  return pasado
}

/**
 * Animación de entrada por sección. Arranca visible si no hay IntersectionObserver,
 * para que el contenido nunca quede atrapado en opacidad 0.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entradas) => {
        if (entradas.some((e) => e.isIntersecting)) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}
