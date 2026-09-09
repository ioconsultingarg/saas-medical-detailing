import { useEffect, useRef } from 'react'
import { guardarEventoDwell, sincronizarEventosPendientes } from '../lib/dwellStore'

const APM_ID_DEMO = 'apm-demo-local'

export function useDwellTracking(nodoId: string | null) {
  const inicioRef = useRef<number | null>(null)

  useEffect(() => {
    if (!nodoId) return

    inicioRef.current = Date.now()
    const nodoActual = nodoId
    const inicio = inicioRef.current

    return () => {
      const fin = Date.now()
      guardarEventoDwell({
        nodoId: nodoActual,
        apmId: APM_ID_DEMO,
        timestampInicio: inicio,
        timestampFin: fin,
        sincronizado: false,
      }).then(sincronizarEventosPendientes)
    }
  }, [nodoId])
}

export function useDwellSync() {
  useEffect(() => {
    sincronizarEventosPendientes()
    window.addEventListener('online', sincronizarEventosPendientes)
    return () => window.removeEventListener('online', sincronizarEventosPendientes)
  }, [])
}
