import { useEffect, useState } from 'react'

export type Ruta =
  | { nombre: 'hoy' }
  | { nombre: 'biblioteca' }
  | { nombre: 'constructor'; baseId?: string }
  | { nombre: 'presentar'; presentacionId: string }
  | { nombre: 'compartir' }
  | { nombre: 'registro' }
  | { nombre: 'stock' }
  | { nombre: 'actividad' }

export function leerRuta(hash = window.location.hash): Ruta {
  const [camino, consulta = ''] = hash.replace(/^#\/?/, '').split('?')
  const partes = camino.split('/').filter(Boolean)
  const params = new URLSearchParams(consulta)

  switch (partes[0]) {
    case 'biblioteca':
      return partes[1] === 'constructor'
        ? { nombre: 'constructor', baseId: params.get('base') ?? undefined }
        : { nombre: 'biblioteca' }
    case 'presentar':
      return partes[1] ? { nombre: 'presentar', presentacionId: decodeURIComponent(partes[1]) } : { nombre: 'biblioteca' }
    case 'cierre':
      return partes[1] === 'registro' ? { nombre: 'registro' } : { nombre: 'compartir' }
    case 'stock':
      return { nombre: 'stock' }
    case 'actividad':
      return { nombre: 'actividad' }
    default:
      return { nombre: 'hoy' }
  }
}

export function ir(camino: string) {
  window.location.hash = camino
}

export function useRuta() {
  const [ruta, setRuta] = useState(leerRuta)

  useEffect(() => {
    function onCambio() {
      setRuta(leerRuta())
    }
    window.addEventListener('hashchange', onCambio)
    return () => window.removeEventListener('hashchange', onCambio)
  }, [])

  return ruta
}
