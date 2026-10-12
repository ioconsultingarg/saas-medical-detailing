import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from 'motion/react'
import { createOrbRenderer } from './orbe/render'
import { RESORTE_SEGUIR } from '../lib/resortes'

/*
 * El orbe que escucha.
 *
 * Reemplaza a las 36 barritas que había antes: la misma señal de audio —el RMS que
 * ya mide useDictado— pero en una forma que respira, se deforma y se agranda con la
 * voz. Es el momento más memorable de la demo y merecía algo mejor que un ecualizador.
 *
 * Los colores son los de la marca, no los de un asistente de consumo: esto tiene que
 * leerse como parte del producto.
 *
 * Adaptado del Voice Orb de beUI (MIT). Ver CREDITS.md.
 */

/** base, luz y sombra: el celeste de la marca sobre la tarjeta oscura */
const COLORES = ['#56a9dd', '#cfe9fb', '#0b2b45'] as const

const acotar = (v: number) => (Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0)

export function OrbeVoz({
  nivel,
  simulada,
  activo = true,
  tamano = 132,
}: {
  /** 0 a 1, actualizado fuera de React para no re-renderizar a 60 fps */
  nivel: RefObject<number>
  /** con el audio de ejemplo no hay micrófono: se inventa una envolvente creíble */
  simulada: boolean
  activo?: boolean
  tamano?: number
}) {
  const sinMovimiento = useReducedMotion()
  const lienzo = useRef<HTMLCanvasElement>(null)
  const render = useRef<ReturnType<typeof createOrbRenderer> | null>(null)
  const [falló, setFalló] = useState(false)

  const destino = useMotionValue(0)
  const suave = useSpring(destino, RESORTE_SEGUIR)
  // la silueta acompaña al sonido: sube un poco y se achata al crecer
  const transformacion = useTransform(
    suave,
    (v) => `translate3d(0, ${-v * 3}px, 0) scale(${1 + v * 0.06}, ${1 - v * 0.025})`,
  )

  const ultimo = useRef({ nivel, simulada, activo, sinMovimiento })
  useLayoutEffect(() => {
    ultimo.current = { nivel, simulada, activo, sinMovimiento }
  })

  // una sola instancia de WebGL, que se desarma al desmontar
  useEffect(() => {
    if (!lienzo.current) return
    try {
      render.current = createOrbRenderer(
        lienzo.current,
        () => ({
          activity: suave.get(),
          colors: COLORES,
          speed: 1,
          // con movimiento reducido el orbe queda quieto, pero visible
          animated: ultimo.current.activo && !ultimo.current.sinMovimiento,
        }),
        () => setFalló(true),
      )
    } catch {
      setFalló(true)
      return
    }
    const r = render.current
    return () => r?.dispose()
  }, [suave])

  // el nivel se lee en un rAF propio: nunca pasa por el estado de React
  useEffect(() => {
    if (falló) return
    let raf = 0
    const desde = performance.now()
    const cuadro = (t: number) => {
      const s = (t - desde) / 1000
      const { nivel: n, simulada: sim, activo: act, sinMovimiento: quieto } = ultimo.current
      const bruto = sim ? 0.32 + 0.3 * Math.abs(Math.sin(s * 2.1)) * (0.6 + 0.4 * Math.sin(s * 5.3)) : n.current ?? 0
      destino.set(act && !quieto ? acotar(bruto) : 0)
      render.current?.requestDraw()
      raf = requestAnimationFrame(cuadro)
    }
    raf = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(raf)
  }, [destino, falló, simulada])

  useEffect(() => suave.on('change', () => render.current?.requestDraw()), [suave])

  // sin WebGL —o si el contexto se pierde— vuelven las barras, que no dependen de nada
  if (falló) return <BarrasVoz nivel={nivel} simulada={simulada} />

  return (
    <motion.div
      aria-hidden="true"
      className="relative shrink-0"
      style={{ width: tamano, height: tamano, transform: sinMovimiento ? undefined : transformacion }}
    >
      <canvas ref={lienzo} className="block size-full" />
    </motion.div>
  )
}

/** Respaldo sin WebGL: el ecualizador de barras que había antes. */
export function BarrasVoz({ nivel, simulada }: { nivel: RefObject<number>; simulada: boolean }) {
  const barras = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    let raf = 0
    const inicio = performance.now()
    const cuadro = (t: number) => {
      const s = (t - inicio) / 1000
      const base = simulada ? 0.3 + 0.35 * Math.abs(Math.sin(s * 2.1)) * (0.6 + 0.4 * Math.sin(s * 5.3)) : nivel.current ?? 0
      barras.current.forEach((b, i) => {
        if (!b) return
        const forma = 0.35 + 0.65 * Math.abs(Math.sin(i * 0.55 + s * (simulada ? 7 : 4)))
        b.style.transform = `scaleY(${Math.max(0.08, Math.min(1, base * forma * 1.6))})`
      })
      raf = requestAnimationFrame(cuadro)
    }
    raf = requestAnimationFrame(cuadro)
    return () => cancelAnimationFrame(raf)
  }, [nivel, simulada])

  return (
    <div aria-hidden="true" className="flex h-12 items-center gap-[3px]">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          ref={(el) => void (barras.current[i] = el)}
          className="h-full w-[3px] origin-center rounded-full bg-[#7cc4ee]"
          style={{ transform: 'scaleY(0.08)' }}
        />
      ))}
    </div>
  )
}
