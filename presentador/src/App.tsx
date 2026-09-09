import { useState } from 'react'
import { ContentTree } from './components/ContentTree'
import { NodeViewer } from './components/NodeViewer'
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

  return (
    <div style={{ maxWidth: 960, margin: '0 auto', padding: 24, fontFamily: 'Arial, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 20, margin: 0 }}>Presentador — Medical Detailing (demo)</h1>
        <button onClick={handleDescargarOffline} disabled={descargando}>
          {descargado ? 'Contenido disponible offline ✓' : descargando ? 'Descargando…' : 'Descargar para uso offline'}
        </button>
      </header>

      <nav aria-label="Ruta actual" style={{ marginBottom: 16, color: '#64748b', fontSize: 14 }}>
        {camino.map((nodo, i) => (
          <span key={nodo.id}>
            {i > 0 && ' / '}
            <button
              onClick={() => setNodoActualId(nodo.id)}
              style={{
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                color: i === camino.length - 1 ? '#0f172a' : '#2563eb',
                fontWeight: i === camino.length - 1 ? 600 : 400,
                padding: 0,
              }}
            >
              {nodo.titulo}
            </button>
          </span>
        ))}
      </nav>

      {!esHoja && <ContentTree nodo={nodoActual} onSelect={(hijo) => setNodoActualId(hijo.id)} />}
      {esHoja && <NodeViewer nodo={nodoActual} />}
    </div>
  )
}

export default App
