import { useEffect, useState } from 'react'
import { Check, ChevronLeft, Download, LayoutGrid } from 'lucide-react'
import './App.css'
import { ContentTree } from './components/ContentTree'
import { Landing } from './components/Landing'
import { NodeViewer } from './components/NodeViewer'
import { TabBar } from './components/TabBar'
import { ThemeToggle } from './components/ThemeToggle'
import { arbolDemo } from './data/mockContent'
import { useDwellSync, useDwellTracking } from './hooks/useDwellTracking'
import { useTheme } from './hooks/useTheme'
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

function ambienteDe(hex: string): string {
  const limpio = hex.replace('#', '')
  const r = parseInt(limpio.slice(0, 2), 16)
  const g = parseInt(limpio.slice(2, 4), 16)
  const b = parseInt(limpio.slice(4, 6), 16)
  return `radial-gradient(120% 100% at 50% 0%, rgba(${r}, ${g}, ${b}, 0.16) 0%, rgba(${r}, ${g}, ${b}, 0.05) 60%, rgba(14, 27, 26, 0.03) 100%)`
}

function App() {
  const [mostrarBienvenida, setMostrarBienvenida] = useState(true)
  const [nodoActualId, setNodoActualId] = useState(arbolDemo.id)
  const [descargando, setDescargando] = useState(false)
  const [descargado, setDescargado] = useState(false)
  const { tema, alternar } = useTheme()

  const camino = encontrarCamino(arbolDemo, nodoActualId) ?? [arbolDemo]
  const nodoActual = camino[camino.length - 1]
  const enCatalogo = camino.length === 1
  const linea = camino.length > 1 ? camino[1] : null
  const secciones = linea?.children ?? []
  const indiceActual = secciones.findIndex((s) => s.id === nodoActual.id)

  useDwellSync()
  useDwellTracking(!enCatalogo ? nodoActual.id : null)

  useEffect(() => {
    if (enCatalogo || secciones.length === 0) return

    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      const delta = e.key === 'ArrowRight' ? 1 : -1
      const siguiente = secciones[indiceActual + delta]
      if (siguiente) setNodoActualId(siguiente.id)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [enCatalogo, secciones, indiceActual])

  async function handleDescargarOffline() {
    setDescargando(true)
    await descargarArbolParaOffline(arbolDemo)
    setDescargando(false)
    setDescargado(true)
  }

  if (mostrarBienvenida) {
    return (
      <Landing onEntrar={() => setMostrarBienvenida(false)} tema={tema} alternarTema={alternar} />
    )
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <button className="hamburger" aria-label="Volver al catálogo" onClick={() => setNodoActualId(arbolDemo.id)}>
          <LayoutGrid size={18} />
        </button>
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <div className="brand-texto">
            <div className="brand-name">Presentador</div>
            <div className="brand-tag">Laboratorio Demo S.A.</div>
          </div>
        </div>
        <ThemeToggle tema={tema} alternar={alternar} />
        <button
          className={`btn btn-ghost-dark ${descargado ? 'is-done' : ''}`}
          onClick={handleDescargarOffline}
          disabled={descargando}
        >
          {descargado ? <Check size={16} /> : <Download size={16} />}
          <span className="btn-label-largo">
            {descargado ? 'Disponible offline' : descargando ? 'Descargando…' : 'Descargar para offline'}
          </span>
          <span className="btn-label-corto">{descargado ? 'Listo' : 'Offline'}</span>
        </button>
      </header>

      <main className="app-main">
        {enCatalogo && (
          <>
            <div className="section-head">
              <div className="section-eyebrow">Catálogo de visita</div>
              <h2 className="section-title">Elegí la línea que vas a presentar</h2>
            </div>
            <ContentTree nodo={arbolDemo} onSelect={(hijo) => setNodoActualId(primeraHoja(hijo).id)} />
          </>
        )}

        {!enCatalogo && linea && (
          <>
            <div className="viewer-bar">
              <button className="back-pill" onClick={() => setNodoActualId(arbolDemo.id)}>
                <ChevronLeft size={15} />
                Catálogo
              </button>
              <TabBar
                items={secciones}
                currentId={nodoActual.id}
                color={linea.color ?? '#0f6e63'}
                onSelect={(item) => setNodoActualId(item.id)}
              />
              <span className="slide-count">
                {indiceActual + 1} / {secciones.length}
              </span>
            </div>

            <NodeViewer nodo={nodoActual} ambiente={ambienteDe(linea.color ?? '#0f6e63')} />
          </>
        )}
      </main>
    </div>
  )
}

export default App
