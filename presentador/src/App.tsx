import { useState } from 'react'
import { ArrowLeft, Check, Download } from 'lucide-react'
import './App.css'
import { ContentTree } from './components/ContentTree'
import { Landing } from './components/Landing'
import { Presenter } from './components/Presenter'
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
      <Landing
        onEntrar={() => {
          setMostrarBienvenida(false)
          window.scrollTo(0, 0)
        }}
        tema={tema}
        alternarTema={alternar}
      />
    )
  }

  if (!enCatalogo && linea) {
    return (
      <Presenter
        linea={linea}
        actualId={nodoActual.id}
        onIr={setNodoActualId}
        onSalir={() => setNodoActualId(arbolDemo.id)}
      />
    )
  }

  const cantidadLineas = arbolDemo.children?.length ?? 0

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" />
          <div className="brand-texto">
            <div className="brand-name">Presentador</div>
            <div className="brand-tag">{arbolDemo.titulo}</div>
          </div>
        </div>
        <button className="icon-btn icon-btn--label" onClick={() => setMostrarBienvenida(true)} aria-label="Inicio">
          <ArrowLeft size={16} aria-hidden="true" />
          <span className="icon-btn__label">Inicio</span>
        </button>
        <ThemeToggle tema={tema} alternar={alternar} />
      </header>

      <main className="catalog">
        <div className="catalog-head">
          <div>
            <div className="eyebrow">Catálogo de visita</div>
            <h1 className="catalog-title">Elegí la línea que vas a presentar</h1>
            <p className="catalog-sub">
              {cantidadLineas} líneas de producto. Descargalas antes de salir para presentar sin señal en el
              consultorio.
            </p>
          </div>
          <button
            className={`btn btn-quiet ${descargado ? 'is-done' : ''}`}
            onClick={handleDescargarOffline}
            disabled={descargando || descargado}
          >
            {descargado ? <Check size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}
            {descargado ? 'Disponible sin conexión' : descargando ? 'Descargando…' : 'Descargar para usar sin señal'}
          </button>
        </div>

        <ContentTree nodo={arbolDemo} onSelect={(l) => setNodoActualId(primeraHoja(l).id)} />
      </main>
    </div>
  )
}

export default App
