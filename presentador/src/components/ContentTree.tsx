import type { ContentNode } from '../types'

interface Props {
  nodo: ContentNode
  onSelect: (hijo: ContentNode) => void
}

function primeraImagen(nodo: ContentNode): string | null {
  if (nodo.tipo === 'imagen' && nodo.url) return nodo.url
  for (const hijo of nodo.children ?? []) {
    const encontrada = primeraImagen(hijo)
    if (encontrada) return encontrada
  }
  return null
}

export function ContentTree({ nodo, onSelect }: Props) {
  if (!nodo.children || nodo.children.length === 0) return null

  return (
    <nav aria-label="Líneas de producto" className="line-grid">
      {nodo.children.map((linea, i) => {
        const preview = primeraImagen(linea)
        return (
          <button
            key={linea.id}
            className="line-card"
            style={{ background: linea.color, animationDelay: `${i * 70}ms` }}
            onClick={() => onSelect(linea)}
          >
            {preview && <img className="line-card__preview" src={preview} alt="" />}
            <span className="line-card__veil" />
            <span className="line-card__body">
              <span className="line-card__texto">
                <span className="line-card__meta">
                  {linea.children?.length ?? 0} secciones · actualizado hoy
                </span>
                <span className="line-card__title">{linea.titulo}</span>
              </span>
              <span className="line-card__go" aria-hidden="true">
                →
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
