import type { ContentNode } from '../types'

interface Props {
  nodo: ContentNode
  onSelect: (hijo: ContentNode) => void
}

export function ContentTree({ nodo, onSelect }: Props) {
  if (!nodo.children || nodo.children.length === 0) return null

  return (
    <nav aria-label="Contenido disponible" className="catalog-grid">
      {nodo.children.map((hijo) => (
        <button key={hijo.id} className="catalog-card" onClick={() => onSelect(hijo)}>
          <span className="catalog-card__icon" style={{ background: hijo.color ?? undefined }}>
            {hijo.titulo.charAt(0)}
          </span>
          <span className="catalog-card__title">{hijo.titulo}</span>
          <span className="catalog-card__meta">
            {hijo.children ? `${hijo.children.length} secciones` : hijo.tipo}
          </span>
        </button>
      ))}
    </nav>
  )
}
