const reloj = new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false })
const fecha = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const numero = new Intl.NumberFormat('es-AR')

export const hora = (ts: number) => reloj.format(ts)
export const fechaLarga = (d = new Date()) => fecha.format(d)
export const miles = (n: number) => numero.format(n)
const fechaCortaFmt = new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' })
export const fechaCorta = (ts: number) => fechaCortaFmt.format(ts)

export function minutos(ms: number) {
  return Math.max(1, Math.round(ms / 60000))
}

export function cronometro(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function hace(ts: number, ahora = Date.now()) {
  const seg = Math.round((ahora - ts) / 1000)
  if (seg < 10) return 'recién'
  if (seg < 60) return `hace ${seg} s`
  const min = Math.round(seg / 60)
  if (min < 60) return `hace ${min} min`
  return `a las ${hora(ts)}`
}

/** Distancia en metros entre dos coordenadas (fórmula de haversine) */
export function distanciaMetros(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000
  const rad = (g: number) => (g * Math.PI) / 180
  const dLat = rad(b.lat - a.lat)
  const dLng = rad(b.lng - a.lng)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2
  return Math.round(2 * R * Math.asin(Math.sqrt(h)))
}
