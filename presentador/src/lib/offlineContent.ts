import type { ContentNode } from '../types'

const CACHE_NAME = 'presentador-content-v1'

function urlsDelArbol(nodo: ContentNode): string[] {
  const propias = nodo.url ? [nodo.url] : []
  const hijos = nodo.children?.flatMap(urlsDelArbol) ?? []
  return [...propias, ...hijos]
}

export async function descargarArbolParaOffline(raiz: ContentNode) {
  if (!('caches' in window)) return
  const cache = await caches.open(CACHE_NAME)
  const urls = urlsDelArbol(raiz)
  await Promise.all(
    urls.map(async (url) => {
      const yaExiste = await cache.match(url)
      if (!yaExiste) await cache.add(url)
    }),
  )
}

export async function estaDisponibleOffline(url: string): Promise<boolean> {
  if (!('caches' in window)) return false
  const cache = await caches.open(CACHE_NAME)
  const respuesta = await cache.match(url)
  return respuesta !== undefined
}
