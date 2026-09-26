import { useEffect, useState } from 'react'
import { Download, Share, SquarePlus, X } from 'lucide-react'

/*
 * Instalación de la app en el dispositivo, sin pasar por ninguna tienda.
 * En Android y escritorio el navegador ofrece el diálogo nativo; en iPhone hay que
 * guiar al usuario, porque Safari no expone ese diálogo.
 */

interface EventoInstalacion extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const CLAVE = 'io-pharma-instalacion'

function yaInstalada() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || (navigator as { standalone?: boolean }).standalone === true
}

function esIOS() {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function useInstalacion() {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null)
  const [instalada, setInstalada] = useState(yaInstalada)

  useEffect(() => {
    function alOfrecer(e: Event) {
      e.preventDefault()
      setEvento(e as EventoInstalacion)
    }
    function alInstalar() {
      setInstalada(true)
      setEvento(null)
    }
    window.addEventListener('beforeinstallprompt', alOfrecer)
    window.addEventListener('appinstalled', alInstalar)
    return () => {
      window.removeEventListener('beforeinstallprompt', alOfrecer)
      window.removeEventListener('appinstalled', alInstalar)
    }
  }, [])

  async function instalar() {
    if (!evento) return false
    await evento.prompt()
    const { outcome } = await evento.userChoice
    setEvento(null)
    return outcome === 'accepted'
  }

  return {
    instalada,
    /** el navegador puede mostrar el diálogo nativo */
    disponible: Boolean(evento),
    /** hay que explicar los pasos a mano */
    manual: !instalada && !evento && esIOS(),
    instalar,
  }
}

export function BotonInstalar({ className = 'btn-secondary' }: { className?: string }) {
  const { instalada, disponible, manual, instalar } = useInstalacion()
  const [pasos, setPasos] = useState(false)

  if (instalada || (!disponible && !manual)) return null

  return (
    <>
      <button type="button" className={className} onClick={() => (disponible ? void instalar() : setPasos((v) => !v))}>
        <Download size={16} aria-hidden="true" />
        Instalar la app
      </button>
      {pasos && (
        <p className="animate-entrar mt-2 flex flex-col gap-1.5 rounded-xl bg-sunken p-3 text-[13px] leading-relaxed text-ink-2">
          <span className="flex items-center gap-2">
            <Share size={14} aria-hidden="true" className="shrink-0 text-ink-3" />
            Tocá Compartir en la barra de Safari.
          </span>
          <span className="flex items-center gap-2">
            <SquarePlus size={14} aria-hidden="true" className="shrink-0 text-ink-3" />
            Elegí “Agregar a inicio”.
          </span>
        </p>
      )}
    </>
  )
}

/** Aviso en la pantalla de ingreso: es donde tiene sentido invitar a instalarla */
export function AvisoInstalar() {
  const { instalada, disponible, manual, instalar } = useInstalacion()
  const [oculto, setOculto] = useState(() => {
    try {
      return localStorage.getItem(CLAVE) === 'oculto'
    } catch {
      return false
    }
  })

  if (instalada || oculto || (!disponible && !manual)) return null

  function descartar() {
    setOculto(true)
    try {
      localStorage.setItem(CLAVE, 'oculto')
    } catch {
      // sin almacenamiento: vuelve a aparecer la próxima vez
    }
  }

  return (
    <div className="animate-entrar mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-line bg-sunken p-3.5">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-ink text-white">
        <Download size={18} />
      </span>
      <div className="min-w-0 flex-1 basis-48">
        <p className="text-[14px] font-semibold text-ink">Instalala en este dispositivo</p>
        <p className="text-[13px] leading-snug text-ink-3">
          {manual ? 'En Safari: Compartir → “Agregar a inicio”. Queda con su ícono y funciona sin conexión.' : 'Queda con su ícono, se abre a pantalla completa y funciona sin conexión.'}
        </p>
      </div>
      {disponible && (
        <button type="button" className="btn-primary" onClick={() => void instalar()}>
          Instalar
        </button>
      )}
      <button type="button" className="btn-icon" aria-label="No mostrar este aviso" onClick={descartar}>
        <X size={18} aria-hidden="true" />
      </button>
    </div>
  )
}
