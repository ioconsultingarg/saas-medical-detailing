import { useEffect, useRef, useState } from 'react'
import { AlertTriangle, Maximize2, Minimize2, Pause, Play, RotateCcw, X } from 'lucide-react'
import { urlMedio } from '../components/Medio'
import { MonogramaProducto } from '../components/ui'
import { piezaPorId } from '../data/piezasVideo'
import { productos } from '../data/productos'
import { cronometro } from '../lib/formato'
import { ir } from '../lib/ruta'

export function PiezaVideo({ piezaId }: { piezaId: string }) {
  const pieza = piezaPorId[piezaId]
  const video = useRef<HTMLVideoElement>(null)
  const contenedor = useRef<HTMLDivElement>(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [t, setT] = useState(0)
  const [duracion, setDuracion] = useState(pieza?.duracion ?? 0)
  const [falta, setFalta] = useState(false)
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [controles, setControles] = useState(true)
  const ocultar = useRef(0)

  useEffect(() => {
    const cambio = () => setPantallaCompleta(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', cambio)
    return () => document.removeEventListener('fullscreenchange', cambio)
  }, [])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const v = video.current
      if (!v) return
      if (e.key === 'Escape' && !document.fullscreenElement) return ir('/biblioteca')
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault()
        v.paused ? void v.play() : v.pause()
      }
      if (e.key === 'ArrowRight') v.currentTime = Math.min(v.duration, v.currentTime + 5)
      if (e.key === 'ArrowLeft') v.currentTime = Math.max(0, v.currentTime - 5)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // los controles se esconden mientras el video corre, para que la pieza ocupe toda la pantalla
  function despertar() {
    setControles(true)
    window.clearTimeout(ocultar.current)
    ocultar.current = window.setTimeout(() => setControles(!video.current || video.current.paused), 2600)
  }

  if (!pieza) {
    ir('/biblioteca')
    return null
  }

  const producto = productos[pieza.productoId]
  const momentoActual = [...pieza.momentos].reverse().find((m) => t >= m.desde) ?? pieza.momentos[0]

  function alternar() {
    const v = video.current
    if (!v) return
    v.paused ? void v.play() : v.pause()
    despertar()
  }

  return (
    <div
      ref={contenedor}
      className="fixed inset-0 z-50 flex flex-col bg-stage text-white"
      onPointerMove={despertar}
      onPointerDown={despertar}
    >
      <header
        className={`absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/70 to-transparent px-4 pt-[calc(12px+env(safe-area-inset-top))] pb-10 transition-opacity duration-300 ${controles ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
      >
        <a href="#/biblioteca" className="press inline-flex min-h-11 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[14px] font-medium hover:bg-white/20">
          <X size={18} aria-hidden="true" />
          Salir
        </a>
        <div className="min-w-0 flex-1 text-center">
          <div className="flex items-center justify-center gap-2">
            <MonogramaProducto id={pieza.productoId} size={16} />
            <h1 className="truncate text-[15px] font-semibold">{pieza.titulo}</h1>
          </div>
          <p className="truncate text-[12px] text-white/55">{producto.marca} · Pieza aprobada por Asuntos Médicos</p>
        </div>
        <button
          type="button"
          className="press inline-flex size-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
          aria-label={pantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'}
          onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void contenedor.current?.requestFullscreen?.())}
        >
          {pantallaCompleta ? <Minimize2 size={19} aria-hidden="true" /> : <Maximize2 size={19} aria-hidden="true" />}
        </button>
      </header>

      <div className="relative flex min-h-0 flex-1 items-center justify-center">
        {falta ? (
          <div className="flex max-w-sm flex-col items-center gap-3 px-6 text-center">
            <AlertTriangle size={26} aria-hidden="true" className="text-[#f5c46b]" />
            <p className="text-[17px] font-semibold">Todavía no está el video de esta pieza</p>
            <p className="text-[14px] text-white/65">
              Falta el archivo <span className="num">{pieza.medio}.mp4</span> en la carpeta de medios.
            </p>
            <a href="#/biblioteca" className="btn mt-2 bg-white text-ink hover:bg-white/90">
              Volver a la biblioteca
            </a>
          </div>
        ) : (
          <video
            ref={video}
            src={urlMedio(pieza.medio)}
            className="h-full w-full object-contain"
            playsInline
            muted
            autoPlay
            onClick={alternar}
            onError={() => setFalta(true)}
            onLoadedMetadata={(e) => setDuracion(e.currentTarget.duration)}
            onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
            onPlay={() => {
              setReproduciendo(true)
              despertar()
            }}
            onPause={() => {
              setReproduciendo(false)
              setControles(true)
            }}
            onEnded={() => setControles(true)}
          />
        )}

        {!falta && !reproduciendo && (
          <button
            type="button"
            onClick={alternar}
            aria-label="Reproducir"
            className="press absolute inset-0 m-auto flex size-20 items-center justify-center rounded-full bg-white/90 text-ink shadow-(--shadow-float) hover:bg-white"
          >
            <Play size={30} aria-hidden="true" className="ml-1 fill-ink" />
          </button>
        )}
      </div>

      {!falta && (
        <footer
          className={`absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/80 to-transparent px-4 pt-14 pb-[calc(14px+env(safe-area-inset-bottom))] transition-opacity duration-300 ${controles ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        >
          <p aria-live="polite" className="mb-3 text-center text-[17px] leading-snug font-medium text-balance md:text-[19px]">
            {momentoActual?.texto}
          </p>

          <div className="mx-auto flex max-w-3xl items-center gap-3">
            <button type="button" onClick={alternar} aria-label={reproduciendo ? 'Pausar' : 'Reproducir'} className="press inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
              {reproduciendo ? <Pause size={19} aria-hidden="true" className="fill-white" /> : <Play size={19} aria-hidden="true" className="fill-white" />}
            </button>
            <button
              type="button"
              aria-label="Volver a empezar"
              className="press inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
              onClick={() => {
                if (!video.current) return
                video.current.currentTime = 0
                void video.current.play()
              }}
            >
              <RotateCcw size={18} aria-hidden="true" />
            </button>

            <div className="relative min-w-0 flex-1">
              <input
                type="range"
                min={0}
                max={duracion || pieza.duracion}
                step={0.1}
                value={t}
                aria-label="Avance del video"
                onChange={(e) => {
                  if (video.current) video.current.currentTime = Number(e.target.value)
                  setT(Number(e.target.value))
                }}
                className="w-full accent-white"
              />
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-1/2 flex -translate-y-1/2">
                {pieza.momentos.slice(1).map((m) => (
                  <span key={m.desde} className="absolute h-3 w-0.5 -translate-y-1/2 rounded-full bg-white/70" style={{ left: `${(m.desde / (duracion || pieza.duracion)) * 100}%` }} />
                ))}
              </div>
            </div>
            <span className="num shrink-0 text-[13px] text-white/75">
              {cronometro(t * 1000)} / {cronometro((duracion || pieza.duracion) * 1000)}
            </span>
          </div>

          <div className="mx-auto mt-3 flex max-w-3xl flex-wrap justify-center gap-1.5">
            {pieza.momentos.map((m, i) => (
              <button
                key={m.desde}
                type="button"
                aria-pressed={m === momentoActual}
                onClick={() => {
                  if (video.current) video.current.currentTime = m.desde + 0.05
                  setT(m.desde)
                }}
                className={`press min-h-9 cursor-pointer rounded-full px-3 text-[13px] font-medium ${m === momentoActual ? 'bg-white text-ink' : 'bg-white/10 text-white/80 hover:bg-white/20'}`}
              >
                {i + 1}. {m.texto.split(':')[0]}
              </button>
            ))}
          </div>
        </footer>
      )}
    </div>
  )
}
