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
  | { nombre: 'academia' }
  | { nombre: 'curso'; cursoId: string; leccionId?: string }
  | { nombre: 'medicos' }
  | { nombre: 'medico'; medicoId: string }
  | { nombre: 'asistente' }
  | { nombre: 'integraciones' }

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
    case 'academia':
      return partes[1] === 'curso' && partes[2]
        ? { nombre: 'curso', cursoId: decodeURIComponent(partes[2]), leccionId: params.get('l') ?? undefined }
        : { nombre: 'academia' }
    case 'medicos':
      return partes[1] ? { nombre: 'medico', medicoId: decodeURIComponent(partes[1]) } : { nombre: 'medicos' }
    case 'asistente':
      return { nombre: 'asistente' }
    case 'integraciones':
      return { nombre: 'integraciones' }
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
