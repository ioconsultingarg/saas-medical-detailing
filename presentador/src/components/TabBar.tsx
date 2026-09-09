import type { ContentNode } from '../types'

interface Props {
  items: ContentNode[]
  currentId: string
  color: string
  onSelect: (item: ContentNode) => void
}

export function TabBar({ items, currentId, color, onSelect }: Props) {
  return (
    <nav aria-label="Secciones" className="tab-bar">
      {items.map((item) => {
        const activo = item.id === currentId
        return (
          <button
            key={item.id}
            className={`tab-item ${activo ? 'is-active' : ''}`}
            style={activo ? { background: color } : undefined}
            onClick={() => onSelect(item)}
          >
            {item.titulo}
          </button>
        )
      })}
    </nav>
  )
}
