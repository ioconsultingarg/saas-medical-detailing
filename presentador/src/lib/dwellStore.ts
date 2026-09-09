import { createStore, del, entries, set } from 'idb-keyval'
import type { DwellEvent } from '../types'
import { supabase } from './supabase'

const store = createStore('presentador-db', 'dwell-events')

export async function guardarEventoDwell(evento: DwellEvent) {
  const key = `${evento.nodoId}-${evento.timestampInicio}`
  await set(key, evento, store)
}

export async function sincronizarEventosPendientes() {
  if (!supabase || !navigator.onLine) return

  const todos = await entries<string, DwellEvent>(store)
  const pendientes = todos.filter(([, evento]) => !evento.sincronizado)
  if (pendientes.length === 0) return

  const filas = pendientes.map(([, evento]) => ({
    nodo_id: evento.nodoId,
    apm_id: evento.apmId,
    timestamp_inicio: new Date(evento.timestampInicio).toISOString(),
    timestamp_fin: new Date(evento.timestampFin).toISOString(),
  }))

  const { error } = await supabase.from('dwell_events').insert(filas)
  if (error) return // se reintenta en el próximo evento 'online' o al reabrir la app

  await Promise.all(pendientes.map(([key]) => del(key, store)))
}
