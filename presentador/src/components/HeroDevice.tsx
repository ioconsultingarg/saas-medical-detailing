import { useEffect, useState } from 'react'
import type { ContentNode } from '../types'

interface Props {
  piezas: { nodo: ContentNode; linea: string; color: string }[]
}

const INTERVALO = 4200

export function HeroDevice({ piezas }: Props) {
  const [indice, setIndice] = useState(0)
  const [pausado, setPausado] = useState(false)

  useEffect(() => {
    if (pausado || piezas.length < 2) return
    const id = setInterval(() => setIndice((i) => (i + 1) % piezas.length), INTERVALO)
    return () => clearInterval(id)
  }, [pausado, piezas.length])

  const actual = piezas[indice]
  if (!actual) return null

  return (
    <div
      className="group/device"
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Carcasa de la tablet */}
      <div className="rounded-[30px] bg-gradient-to-br from-white/50 via-white/10 to-transparent p-px shadow-2xl shadow-brand-900/30 dark:from-white/25 dark:via-white/5">
        <div className="rounded-[29px] bg-gradient-to-br from-slate-800 to-slate-950 p-3.5">
          <div className="mx-auto mb-3 h-1 w-12 rounded-full bg-white/15" />

          {/* Pantalla */}
          <div className="relative overflow-hidden rounded-2xl bg-white">
            {piezas.map((pieza, i) => (
              <img
                key={pieza.nodo.id}
                src={pieza.nodo.url}
                alt={`${pieza.linea} — ${pieza.nodo.titulo}`}
                className={`block w-full transition-opacity duration-700 ease-out ${
                  i === indice ? 'relative opacity-100' : 'absolute inset-0 opacity-0'
                }`}
              />
            ))}

            {/* Marcador interactivo sobre la pieza activa */}
            {actual.nodo.hotspots?.map((h) => (
              <span
                key={h.id}
                aria-hidden="true"
                className="pointer-events-none absolute"
                style={{
                  left: `${(h.x + h.ancho / 2) * 100}%`,
                  top: `${(h.y + h.alto / 2) * 100}%`,
                }}
              >
                <span className="absolute -translate-x-1/2 -translate-y-1/2">
                  <span className="block h-6 w-6 rounded-full bg-coral-accent shadow-lg shadow-coral-accent/50" />
                  <span className="absolute inset-0 animate-ping rounded-full bg-coral-accent/60" />
                </span>
              </span>
            ))}

            {/* Barra de progreso del ciclo */}
            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-black/10">
              <div
                key={`${indice}-${pausado}`}
                className="h-full bg-coral-accent"
                style={{
                  animation: pausado ? 'none' : `barra ${INTERVALO}ms linear forwards`,
                  width: pausado ? '100%' : undefined,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Selector de piezas — el punto de color indica a qué línea pertenece cada una */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {piezas.map((pieza, i) => (
          <button
            key={pieza.nodo.id}
            onClick={() => setIndice(i)}
            aria-label={`Ver ${pieza.linea} — ${pieza.nodo.titulo}`}
            aria-current={i === indice}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] tracking-[0.08em] uppercase transition-all duration-200 active:scale-[0.96] ${
              i === indice
                ? 'text-white shadow-md'
                : 'bg-black/5 text-slate-500 hover:bg-black/10 dark:bg-white/8 dark:text-slate-400 dark:hover:bg-white/15'
            }`}
            style={i === indice ? { backgroundColor: pieza.color } : undefined}
          >
            <span
              aria-hidden="true"
              className="h-1.5 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: i === indice ? 'rgba(255,255,255,0.85)' : pieza.color }}
            />
            {pieza.nodo.titulo}
          </button>
        ))}
      </div>

      <p className="mt-3 text-center font-mono text-[10px] tracking-[0.1em] text-slate-500 uppercase dark:text-slate-500">
        {actual.linea} · contenido de ejemplo
      </p>
    </div>
  )
}
