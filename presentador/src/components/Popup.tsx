import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

interface Props {
  titulo: string
  texto: string
  onClose: () => void
}

export function Popup({ titulo, texto, onClose }: Props) {
  const botonRef = useRef<HTMLButtonElement>(null)
  const cerrarRef = useRef(onClose)

  useEffect(() => {
    cerrarRef.current = onClose
  })

  useEffect(() => {
    const anterior = document.activeElement as HTMLElement | null
    botonRef.current?.focus()

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') cerrarRef.current()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      anterior?.focus?.()
    }
  }, [])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="modal-grabber" aria-hidden="true" />
        <button className="modal-close" onClick={onClose} aria-label="Cerrar">
          <X size={20} aria-hidden="true" />
        </button>
        <div className="modal-kicker">Información ampliada</div>
        <h3 id="popup-title" className="modal-title">
          {titulo}
        </h3>
        <p className="modal-text">{texto}</p>
        <button ref={botonRef} className="btn btn-primary" onClick={onClose}>
          Volver a la pieza
        </button>
      </div>
    </div>
  )
}
