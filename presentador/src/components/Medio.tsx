import { useRef, useState, type ReactNode } from 'react'
import { Pause, Play } from 'lucide-react'
import { prefiereMenosMovimiento } from '../lib/tiempo'

/** Videos e imágenes que genera el laboratorio (o la agencia) van en `public/media/` */
export const urlMedio = (nombre: string, ext = 'mp4') => `${import.meta.env.BASE_URL}media/${nombre}.${ext}`

interface Props {
  nombre?: string
  /** hover: se reproduce en bucle solo con el puntero encima · unaVez: se reproduce una vez, con botón de pausa */
  modo: 'hover' | 'unaVez'
  className?: string
  children?: ReactNode
}

/**
 * Video decorativo que aparece solo cuando el archivo existe y cargó.
 * Mientras tanto se ve el contenido de respaldo, sin espacios vacíos ni cuadros negros.
 */
export function VideoPortada({ nombre, modo, className, children }: Props) {
  const [listo, setListo] = useState(false)
  const [pausado, setPausado] = useState(true)
  const ref = useRef<HTMLVideoElement>(null)
  const reducido = prefiereMenosMovimiento()

  function reproducir() {
    if (!reducido) void ref.current?.play()?.catch(() => {})
  }

  function detener() {
    ref.current?.pause()
  }

  return (
    <div
      className={className || 'relative'}
      onPointerEnter={modo === 'hover' ? reproducir : undefined}
      onPointerLeave={modo === 'hover' ? detener : undefined}
    >
      {children}
      {nombre && (
        <video
          ref={ref}
          src={urlMedio(nombre)}
          muted
          playsInline
          loop={modo === 'hover'}
          autoPlay={modo === 'unaVez' && !reducido}
          preload="metadata"
          aria-hidden="true"
          tabIndex={-1}
          onLoadedData={() => setListo(true)}
          onPlay={() => setPausado(false)}
          onPause={() => setPausado(true)}
          onEnded={() => setPausado(true)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${listo ? 'opacity-100' : 'opacity-0'}`}
        />
      )}
      {nombre && listo && modo === 'unaVez' && (
        <button
          type="button"
          onClick={() => (pausado ? reproducir() : detener())}
          aria-label={pausado ? 'Reproducir video de portada' : 'Pausar video de portada'}
          className="press absolute right-3 bottom-3 z-10 flex size-11 cursor-pointer items-center justify-center rounded-full bg-black/40 text-white hover:bg-black/55"
        >
          {pausado ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
        </button>
      )}
    </div>
  )
}
