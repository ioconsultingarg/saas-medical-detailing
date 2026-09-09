import { useState } from 'react'
import './App.css'
import { ContentTree } from './components/ContentTree'
import { NodeViewer } from './components/NodeViewer'
import { TabBar } from './components/TabBar'
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

function primeraHoja(nodo: ContentNode): ContentNode {
  if (!nodo.children || nodo.children.length === 0) return nodo
  return primeraHoja(nodo.children[0])
}

function App() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [nodoActualId, setNodoActualId] = useState(arbolDemo.id)
  const [descargando, setDescargando] = useState(false)
  const [descargado, setDescargado] = useState(false)

  const camino = encontrarCamino(arbolDemo, nodoActualId) ?? [arbolDemo]
  const nodoActual = camino[camino.length - 1]
  const enCatalogo = camino.length === 1
  const linea = camino.length > 1 ? camino[1] : null

  useDwellSync()
  useDwellTracking(!enCatalogo ? nodoActual.id : null)

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
        <button className="hamburger" aria-label="Volver al catálogo" onClick={() => setNodoActualId(arbolDemo.id)}>
          <span />
          <span />
          <span />
        </button>
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

      <div className="device-frame">
        <div className="device-notch" />
        <div className="device-screen">
          <main className="app-main">
            {!enCatalogo && (
              <nav aria-label="Ruta actual" className="breadcrumb">
                <button className="breadcrumb-item" onClick={() => setNodoActualId(arbolDemo.id)}>
                  {arbolDemo.titulo}
                </button>
                <span className="breadcrumb-sep">/</span>
                <span className="breadcrumb-item is-current">{linea!.titulo}</span>
              </nav>
            )}

            {enCatalogo && <ContentTree nodo={arbolDemo} onSelect={(hijo) => setNodoActualId(primeraHoja(hijo).id)} />}

            {!enCatalogo && linea && (
              <>
                <TabBar
                  items={linea.children ?? []}
                  currentId={nodoActual.id}
                  color={linea.color ?? '#0f6e63'}
                  onSelect={(item) => setNodoActualId(item.id)}
                />
                <NodeViewer nodo={nodoActual} />
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

export default App
