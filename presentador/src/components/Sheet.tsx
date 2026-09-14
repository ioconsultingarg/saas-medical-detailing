import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface Props {
  abierto: boolean
  onCerrar: () => void
  titulo: string
  subtitulo?: ReactNode
  children: ReactNode
  pie?: ReactNode
  ancho?: string
  /** scrim liviano: el panel acompaña sin tapar lo que está detrás (p. ej. la diapositiva) */
  scrimSuave?: boolean
}

const SALIDA_MS = 200

/**
 * Panel lateral en tablet/desktop, hoja inferior en celular.
 * Entra y sale por el mismo lado; la salida es más rápida que la entrada.
 */
export function Sheet({ abierto, onCerrar, titulo, subtitulo, children, pie, ancho = '460px', scrimSuave }: Props) {
  const [montado, setMontado] = useState(abierto)
  const [visible, setVisible] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  const cerrarRef = useRef(onCerrar)
  const tituloId = useId()

  useEffect(() => {
    cerrarRef.current = onCerrar
  })

  useEffect(() => {
    if (abierto) {
      setMontado(true)
      const raf = requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
      return () => cancelAnimationFrame(raf)
    }
    setVisible(false)
    const t = window.setTimeout(() => setMontado(false), SALIDA_MS)
    return () => window.clearTimeout(t)
  }, [abierto])

  useEffect(() => {
    if (!montado || !abierto) return
    const anterior = document.activeElement as HTMLElement | null
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('[data-autofoco]')?.focus(), 30)

    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrarRef.current()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.clearTimeout(t)
      window.removeEventListener('keydown', onKey)
      anterior?.focus?.()
    }
  }, [montado, abierto])

  if (!montado) return null

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div
        className={`sheet-scrim absolute inset-0 ${scrimSuave ? 'bg-ink/25' : 'bg-ink/45'}`}
        data-abierto={visible}
        onClick={onCerrar}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        data-abierto={visible}
        style={{ ['--ancho' as string]: ancho }}
        className="sheet-panel absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-3xl bg-surface shadow-(--shadow-sheet) md:inset-y-0 md:right-0 md:left-auto md:max-h-none md:w-[min(var(--ancho),100vw)] md:rounded-none md:rounded-l-3xl"
      >
        <div aria-hidden="true" className="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-line-2 md:hidden" />
        <header className="flex shrink-0 items-start gap-3 border-b border-line px-5 pt-4 pb-3.5 md:px-6 md:pt-6">
          <div className="min-w-0 flex-1">
            {subtitulo && <div className="mb-1">{subtitulo}</div>}
            <h2 id={tituloId} className="text-[20px] leading-tight font-semibold text-ink">
              {titulo}
            </h2>
          </div>
          <button type="button" className="btn-icon -mt-1 -mr-2" onClick={onCerrar} aria-label="Cerrar panel" data-autofoco>
            <X size={20} aria-hidden="true" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 md:px-6">{children}</div>
        {pie && (
          <footer className="shrink-0 border-t border-line px-5 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] md:px-6 md:pb-5">
            {pie}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  )
}
