import type { ContentNode } from '../types'

interface Props {
  nodo: ContentNode
  onSelect: (hijo: ContentNode) => void
}

export function ContentTree({ nodo, onSelect }: Props) {
  if (!nodo.children || nodo.children.length === 0) return null

  return (
    <nav aria-label="Contenido disponible" style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {nodo.children.map((hijo) => (
        <button
          key={hijo.id}
          onClick={() => onSelect(hijo)}
          style={{
            padding: '10px 16px',
            borderRadius: 8,
            border: '1px solid #cbd5e1',
            background: '#f8fafc',
            color: '#0f172a',
            cursor: 'pointer',
          }}
        >
          {hijo.titulo}
        </button>
      ))}
    </nav>
  )
}
