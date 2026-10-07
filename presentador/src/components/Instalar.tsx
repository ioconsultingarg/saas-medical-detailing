import { useCallback, useEffect, useState } from 'react'
import { Download, Share, SquarePlus } from 'lucide-react'

/*
 * Instalación de la app en el dispositivo, sin pasar por ninguna tienda.
 *
 * La oferta vive en un solo lugar: la sección "Instalación" de Tu cuenta. Se muestra
 * siempre en el mismo sitio y desaparece para siempre cuando la persona instala la app
 * o cuando dice que no. En Android y escritorio el navegador ofrece el diálogo nativo;
 * en iPhone hay que guiar los pasos, porque Safari no expone ese diálogo.
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

function leerDescartada() {
  try {
    return localStorage.getItem(CLAVE) === 'descartada'
  } catch {
    return false
  }
}

export function useInstalacion() {
  const [evento, setEvento] = useState<EventoInstalacion | null>(null)
  const [instalada, setInstalada] = useState(yaInstalada)
  const [descartada, setDescartada] = useState(leerDescartada)

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

  const descartar = useCallback(() => {
    setDescartada(true)
    try {
      localStorage.setItem(CLAVE, 'descartada')
    } catch {
      // sin almacenamiento: la oferta vuelve a aparecer en la próxima sesión
    }
  }, [])

  const instalar = useCallback(async () => {
    if (!evento) return false
    await evento.prompt()
    const { outcome } = await evento.userChoice
    setEvento(null)
    // rechazar el diálogo del navegador cuenta como decir que no
    if (outcome !== 'accepted') descartar()
    return outcome === 'accepted'
  }, [evento, descartar])

  return {
    instalada,
    descartada,
    /** el navegador puede mostrar el diálogo nativo */
    disponible: Boolean(evento),
    /** hay que explicar los pasos a mano */
    manual: !instalada && !evento && esIOS(),
    instalar,
    descartar,
  }
}

/**
 * Sección de instalación de Tu cuenta: el único lugar donde se ofrece instalar la app.
 * Devuelve null —y no deja hueco— cuando ya está instalada, cuando se rechazó la oferta
 * o cuando el navegador no puede instalarla.
 */
export function SeccionInstalar() {
  const { instalada, descartada, disponible, manual, instalar, descartar } = useInstalacion()

  if (instalada || descartada || (!disponible && !manual)) return null

  return (
    <section aria-labelledby="titulo-instalacion" className="mt-6">
      <h3 id="titulo-instalacion" className="mb-2 text-[14px] font-semibold text-ink">
        Instalación
      </h3>

      {manual ? (
        <div className="rounded-xl border border-line bg-sunken p-3.5">
          <p className="text-[13px] leading-relaxed text-ink-2">Para dejarla en tu pantalla de inicio, desde Safari:</p>
          <ol className="mt-2 flex flex-col gap-1.5 text-[13px] text-ink-2">
            <li className="flex items-center gap-2">
              <Share size={15} aria-hidden="true" className="shrink-0 text-ink-3" />
              Tocá Compartir en la barra del navegador.
            </li>
            <li className="flex items-center gap-2">
              <SquarePlus size={15} aria-hidden="true" className="shrink-0 text-ink-3" />
              Elegí “Agregar a inicio”.
            </li>
          </ol>
        </div>
      ) : (
        <button type="button" className="btn-primary w-full" onClick={() => void instalar()}>
          <Download size={17} aria-hidden="true" />
          Instalar la app
        </button>
      )}

      <p className="mt-1.5 text-[12px] leading-relaxed text-ink-3">
        {manual
          ? 'Queda con su propio ícono, se abre a pantalla completa y conserva lo que trabajaste aunque pasen días sin abrirla.'
          : 'Queda con su propio ícono, se abre a pantalla completa y funciona sin conexión.'}
      </p>

      <button type="button" className="btn-ghost mt-2 min-h-10 w-full text-[13px]" onClick={descartar}>
        No, gracias
      </button>
    </section>
  )
}
