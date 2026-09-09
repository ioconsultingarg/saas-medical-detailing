import { useRef, useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  /** intensidad del giro en grados */
  intensidad?: number
}

export function TiltCard({ children, className = '', intensidad = 7 }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [giro, setGiro] = useState({ x: 0, y: 0 })
  const [brillo, setBrillo] = useState({ x: 50, y: 50 })

  function onMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    setGiro({ x: (0.5 - py) * intensidad * 2, y: (px - 0.5) * intensidad * 2 })
    setBrillo({ x: px * 100, y: py * 100 })
  }

  function reset() {
    setGiro({ x: 0, y: 0 })
    setBrillo({ x: 50, y: 50 })
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMouseMove}
      onMouseLeave={reset}
      style={{
        transform: `perspective(900px) rotateX(${giro.x}deg) rotateY(${giro.y}deg)`,
        transition: 'transform 220ms cubic-bezier(0.2, 0.7, 0.3, 1)',
        transformStyle: 'preserve-3d',
      }}
      className={`group relative ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(360px circle at ${brillo.x}% ${brillo.y}%, rgba(207,233,74,0.16), transparent 62%)`,
        }}
      />
      {children}
    </div>
  )
}
