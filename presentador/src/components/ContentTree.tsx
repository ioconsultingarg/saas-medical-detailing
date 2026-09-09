import type { ContentNode } from '../types'

interface Props {
  nodo: ContentNode
  onSelect: (hijo: ContentNode) => void
}

function iconoDe(nodo: ContentNode): string {
  if (nodo.children && nodo.children.length > 0) return String(nodo.children.length)
  if (nodo.tipo === 'pdf') return 'PDF'
  if (nodo.tipo === 'video') return 'VID'
  return 'IMG'
}

export function ContentTree({ nodo, onSelect }: Props) {
  if (!nodo.children || nodo.children.length === 0) return null

  return (
    <nav aria-label="Contenido disponible" className="catalog-grid">
      {nodo.children.map((hijo) => (
        <button key={hijo.id} className="catalog-card" onClick={() => onSelect(hijo)}>
          <span className="catalog-card__icon">{iconoDe(hijo)}</span>
          <span className="catalog-card__title">{hijo.titulo}</span>
          <span className="catalog-card__meta">
            {hijo.children ? `${hijo.children.length} elementos` : hijo.tipo}
          </span>
        </button>
      ))}
    </nav>
  )
}
