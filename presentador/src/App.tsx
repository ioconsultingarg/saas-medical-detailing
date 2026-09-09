import { useState } from 'react'
import './App.css'
import { ContentTree } from './components/ContentTree'
import { NodeViewer } from './components/NodeViewer'
import { Welcome } from './components/Welcome'
import { arbolDemo } from './data/mockContent'
import { useDwellSync, useDwellTracking } from './hooks/useDwellTracking'
import { descargarArbolParaOffline } from './lib/offlineContent'
import type { ContentNode } from './types'

function encontrarCamino(raiz: ContentNode, objetivoId: string, camino: ContentNode[] = []): ContentNode[] | null {
  const siguienteCamino = [...camino, raiz]
  if (raiz.id === objetivoId) return siguienteCamino
  for (const hijo of raiz.children ?? []) {
    const resultado = encontrarCamino(hijo, objetivoId, siguienteCamino)
    if (resultado) return resultado
  }
  return null
}

function App() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [nodoActualId, setNodoActualId] = useState(arbolDemo.id)
  const [descargando, setDescargando] = useState(false)
  const [descargado, setDescargado] = useState(false)

  const camino = encontrarCamino(arbolDemo, nodoActualId) ?? [arbolDemo]
  const nodoActual = camino[camino.length - 1]
  const esHoja = !nodoActual.children || nodoActual.children.length === 0

  useDwellSync()
  useDwellTracking(esHoja ? nodoActual.id : null)

  async function handleDescargarOffline() {
    setDescargando(true)
    await descargarArbolParaOffline(arbolDemo)
    setDescargando(false)
    setDescargado(true)
  }

  if (mostrarBienvenida) {
    return (
      <div className="app-shell">
        <Welcome onEntrar={() => setMostrarBienvenida(false)} />
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <div>
            <div className="brand-name">Presentador</div>
            <div className="brand-tag">Medical Detailing · demo</div>
          </div>
        </div>
        <button
          className={`btn btn-secondary ${descargado ? 'is-done' : ''}`}
          onClick={handleDescargarOffline}
          disabled={descargando}
        >
          {descargado ? 'Disponible offline ✓' : descargando ? 'Descargando…' : 'Descargar para offline'}
        </button>
      </header>

      <main className="app-main">
        <nav aria-label="Ruta actual" className="breadcrumb">
          {camino.map((nodo, i) => (
            <span key={nodo.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {i > 0 && <span className="breadcrumb-sep">/</span>}
              <button
                className={`breadcrumb-item ${i === camino.length - 1 ? 'is-current' : ''}`}
                onClick={() => setNodoActualId(nodo.id)}
              >
                {nodo.titulo}
              </button>
            </span>
          ))}
        </nav>

        {!esHoja && <ContentTree nodo={nodoActual} onSelect={(hijo) => setNodoActualId(hijo.id)} />}
        {esHoja && <NodeViewer nodo={nodoActual} />}
      </main>
    </div>
  )
}

export default App
