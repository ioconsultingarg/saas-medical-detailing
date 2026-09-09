import { useEffect } from 'react'

interface Props {
  titulo: string
  texto: string
  onClose: () => void
}

export function Popup({ titulo, texto, onClose }: Props) {
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="popup-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-kicker">Información ampliada</div>
        <h3 id="popup-title" className="modal-title">
          {titulo}
        </h3>
        <p className="modal-text">{texto}</p>
        <button className="btn btn-lime" onClick={onClose}>
          Volver a la pieza
        </button>
      </div>
    </div>
  )
}
