import type { CSSProperties } from 'react'
import { ArrowRight } from 'lucide-react'
import { partirTitulo } from '../lib/titulos'
import type { ContentNode } from '../types'

interface Props {
  nodo: ContentNode
  onSelect: (linea: ContentNode) => void
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
        const { categoria, producto } = partirTitulo(linea.titulo)
        const secciones = linea.children ?? []

        return (
          <button
            key={linea.id}
            className="line-card"
            style={{ '--line': linea.color ?? '#0f6e63', animationDelay: `${i * 80}ms` } as CSSProperties}
            onClick={() => onSelect(linea)}
          >
            <span className="line-card__media">
              {preview && <img src={preview} alt="" />}
              <span className="line-card__count">{secciones.length} secciones</span>
            </span>

            <span className="line-card__body">
              <span className="line-card__text">
                {categoria && (
                  <span className="line-card__product">
                    <span className="line-card__dot" aria-hidden="true" />
                    {categoria}
                  </span>
                )}
                <span className="line-card__title">{producto}</span>
                <span className="line-card__sections">{secciones.map((s) => s.titulo).join(' · ')}</span>
              </span>
              <span className="line-card__go" aria-hidden="true">
                <ArrowRight size={20} />
              </span>
            </span>
          </button>
        )
      })}
    </nav>
  )
}
