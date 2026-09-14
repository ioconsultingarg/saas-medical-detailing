import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState, type ReactNode } from 'react'
import { apm, registrosIniciales, visitasDelDia } from '../data/agenda'
import { diapositivaPorId } from '../data/presentaciones'
import { stockInicial } from '../data/stock'
import { minutos } from '../lib/formato'
import type { ItemOutbox, ItemStock, Presentacion, ProductoId, RegistroVisita, TipoOutbox, Visita } from '../types'

export interface ItemCarrito {
  sku: string
  cantidad: number
}

export interface EstadoDemo {
  version: 3
  registros: Record<string, RegistroVisita>
  visitaActivaId: string | null
  stock: ItemStock[]
  stockActualizado: number
  carrito: ItemCarrito[]
  outbox: ItemOutbox[]
  personales: Presentacion[]
  forzarOffline: boolean
  hotspotsVistos: string[]
  tiempos: Record<string, number>
  enviados: string[]
}

type Accion =
  | { tipo: 'checkin'; visitaId: string; distancia: number }
  | { tipo: 'cerrar'; calificacion: number; etiquetas: string[]; nota: string; firma: string | null }
  | { tipo: 'carrito'; sku: string; delta: number }
  | { tipo: 'vaciarCarrito' }
  | { tipo: 'pedido' }
  | { tipo: 'guardarPresentacion'; presentacion: Presentacion }
  | { tipo: 'borrarPresentacion'; id: string }
  | { tipo: 'envio'; canal: string }
  | { tipo: 'offline'; valor: boolean }
  | { tipo: 'hotspot'; recursoId: string }
  | { tipo: 'tiempo'; diapositivaId: string; ms: number }
  | { tipo: 'sincronizar' }
  | { tipo: 'reiniciar' }

const CLAVE = 'presentador-demo-v3'
export const CUPO_MUESTRAS = 20

function estadoInicial(): EstadoDemo {
  return {
    version: 3,
    registros: registrosIniciales(),
    visitaActivaId: null,
    stock: stockInicial.map((s) => ({ ...s })),
    stockActualizado: Date.now(),
    carrito: [],
    outbox: [],
    personales: [],
    forzarOffline: false,
    hotspotsVistos: [],
    tiempos: {},
    enviados: [],
  }
}

function cargar(): EstadoDemo {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) {
      const guardado = JSON.parse(crudo) as EstadoDemo
      if (guardado.version === 3) return guardado
    }
  } catch {
    // almacenamiento bloqueado: la demo arranca de cero en memoria
  }
  return estadoInicial()
}

let secuencia = 0
function entradaOutbox(tipo: TipoOutbox, resumen: string): ItemOutbox {
  secuencia += 1
  return { id: `${Date.now()}-${secuencia}`, tipo, resumen, creado: Date.now(), sincronizado: null }
}

export function nombreCorto(v: Visita) {
  const partes = v.medico.nombre.split(' ')
  return `${partes[0]} ${partes[partes.length - 1]}`
}

function reducir(estado: EstadoDemo, accion: Accion): EstadoDemo {
  switch (accion.tipo) {
    case 'checkin': {
      const visita = visitasDelDia.find((v) => v.id === accion.visitaId)
      if (!visita || estado.visitaActivaId) return estado
      return {
        ...estado,
        visitaActivaId: visita.id,
        registros: {
          ...estado.registros,
          [visita.id]: { estado: 'en_curso', checkIn: Date.now(), distanciaCheckIn: accion.distancia, muestras: 0 },
        },
        hotspotsVistos: [],
        tiempos: {},
        enviados: [],
        outbox: [entradaOutbox('checkin', `Check-in · ${nombreCorto(visita)} · a ${accion.distancia} m`), ...estado.outbox],
      }
    }
    case 'cerrar': {
      const id = estado.visitaActivaId
      const visita = visitasDelDia.find((v) => v.id === id)
      if (!id || !visita) return estado
      const previo = estado.registros[id]
      const productos = [
        ...new Set(
          Object.keys(estado.tiempos)
            .map((d) => diapositivaPorId[d]?.productoId)
            .filter((p): p is ProductoId => Boolean(p)),
        ),
      ]
      const checkOut = Date.now()
      return {
        ...estado,
        visitaActivaId: null,
        registros: {
          ...estado.registros,
          [id]: {
            ...previo,
            estado: 'completada',
            checkOut,
            calificacion: accion.calificacion,
            etiquetas: accion.etiquetas,
            nota: accion.nota,
            firma: accion.firma ?? undefined,
            productos,
          },
        },
        outbox: [
          entradaOutbox('checkout', `Visita cerrada · ${nombreCorto(visita)} · ${minutos(checkOut - (previo?.checkIn ?? checkOut))} min`),
          ...estado.outbox,
        ],
      }
    }
    case 'carrito': {
      const item = estado.stock.find((s) => s.sku === accion.sku)
      if (!item) return estado
      const actual = estado.carrito.find((c) => c.sku === accion.sku)?.cantidad ?? 0
      const siguiente = Math.max(0, Math.min(item.unidades, actual + accion.delta))
      const resto = estado.carrito.filter((c) => c.sku !== accion.sku)
      return { ...estado, carrito: siguiente > 0 ? [...resto, { sku: accion.sku, cantidad: siguiente }] : resto }
    }
    case 'vaciarCarrito':
      return { ...estado, carrito: [] }
    case 'pedido': {
      if (estado.carrito.length === 0) return estado
      let unidades = 0
      let muestras = 0
      const stock = estado.stock.map((s) => {
        const pedido = estado.carrito.find((c) => c.sku === s.sku)
        if (!pedido) return s
        const cantidad = Math.min(pedido.cantidad, s.unidades)
        unidades += cantidad
        if (s.tipo === 'muestra') muestras += cantidad
        return { ...s, unidades: s.unidades - cantidad }
      })
      const visita = visitasDelDia.find((v) => v.id === estado.visitaActivaId)
      const destino = visita ? ` para ${nombreCorto(visita)}` : ''
      const registros =
        visita && estado.registros[visita.id]
          ? {
              ...estado.registros,
              [visita.id]: { ...estado.registros[visita.id], muestras: (estado.registros[visita.id].muestras ?? 0) + muestras },
            }
          : estado.registros
      return {
        ...estado,
        stock,
        registros,
        carrito: [],
        outbox: [entradaOutbox('pedido', `Pedido de ${unidades} u. en ${estado.carrito.length} ítems${destino}`), ...estado.outbox],
      }
    }
    case 'guardarPresentacion': {
      const resto = estado.personales.filter((p) => p.id !== accion.presentacion.id)
      return { ...estado, personales: [accion.presentacion, ...resto] }
    }
    case 'borrarPresentacion':
      return { ...estado, personales: estado.personales.filter((p) => p.id !== accion.id) }
    case 'envio': {
      const visita = visitasDelDia.find((v) => v.id === estado.visitaActivaId)
      return {
        ...estado,
        enviados: [...new Set([...estado.enviados, accion.canal])],
        outbox: [
          entradaOutbox('envio', `Material enviado por ${accion.canal}${visita ? ` · ${nombreCorto(visita)}` : ''}`),
          ...estado.outbox,
        ],
      }
    }
    case 'offline':
      return { ...estado, forzarOffline: accion.valor }
    case 'hotspot':
      return estado.hotspotsVistos.includes(accion.recursoId)
        ? estado
        : { ...estado, hotspotsVistos: [...estado.hotspotsVistos, accion.recursoId] }
    case 'tiempo':
      if (!estado.visitaActivaId || accion.ms < 400) return estado
      return {
        ...estado,
        tiempos: { ...estado.tiempos, [accion.diapositivaId]: (estado.tiempos[accion.diapositivaId] ?? 0) + accion.ms },
      }
    case 'sincronizar': {
      const ahora = Date.now()
      return {
        ...estado,
        stockActualizado: ahora,
        outbox: estado.outbox.map((o) => (o.sincronizado ? o : { ...o, sincronizado: ahora })),
      }
    }
    case 'reiniciar':
      return estadoInicial()
  }
}

interface Aviso {
  id: number
  texto: string
  tono: 'ok' | 'info' | 'warn'
}

interface ContextoDemo {
  estado: EstadoDemo
  online: boolean
  pendientes: number
  visitaActiva: Visita | null
  despachar: (a: Accion) => void
  avisar: (texto: string, tono?: Aviso['tono']) => void
  apm: typeof apm
}

const Contexto = createContext<ContextoDemo | null>(null)

function useConexionNavegador() {
  const [online, setOnline] = useState(() => (typeof navigator === 'undefined' ? true : navigator.onLine))
  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  return online
}

export function DemoProvider({ children }: { children: ReactNode }) {
  const [estado, despachar] = useReducer(reducir, undefined, cargar)
  const [avisos, setAvisos] = useState<Aviso[]>([])
  const navegadorOnline = useConexionNavegador()
  const online = navegadorOnline && !estado.forzarOffline
  const pendientes = estado.outbox.filter((o) => !o.sincronizado).length

  useEffect(() => {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // sin persistencia: la demo sigue funcionando en memoria
    }
  }, [estado])

  // Cola offline: al recuperar conexión se sincroniza lo pendiente
  useEffect(() => {
    if (!online || pendientes === 0) return
    const id = window.setTimeout(() => despachar({ tipo: 'sincronizar' }), 1600)
    return () => window.clearTimeout(id)
  }, [online, pendientes])

  const avisar = useCallback((texto: string, tono: Aviso['tono'] = 'ok') => {
    const id = Date.now() + Math.random()
    setAvisos((a) => [...a.slice(-2), { id, texto, tono }])
    window.setTimeout(() => setAvisos((a) => a.filter((x) => x.id !== id)), 3600)
  }, [])

  const valor = useMemo<ContextoDemo>(
    () => ({
      estado,
      online,
      pendientes,
      visitaActiva: visitasDelDia.find((v) => v.id === estado.visitaActivaId) ?? null,
      despachar,
      avisar,
      apm,
    }),
    [estado, online, pendientes, avisar],
  )

  return (
    <Contexto.Provider value={valor}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(84px+env(safe-area-inset-bottom))] z-[80] flex flex-col items-center gap-2 px-4 md:top-[calc(76px+env(safe-area-inset-top))] md:bottom-auto"
      >
        {avisos.map((a) => (
          <div
            key={a.id}
            className="animate-entrar flex max-w-md items-center gap-2.5 rounded-xl bg-ink px-4 py-3 text-[14px] font-medium text-white shadow-(--shadow-float)"
          >
            <span
              aria-hidden="true"
              className={`size-2 shrink-0 rounded-full ${a.tono === 'warn' ? 'bg-[#f5a623]' : a.tono === 'info' ? 'bg-[#7cc4ee]' : 'bg-[#34d399]'}`}
            />
            {a.texto}
          </div>
        ))}
      </div>
    </Contexto.Provider>
  )
}

export function useDemo() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useDemo fuera de DemoProvider')
  return ctx
}

export function todasLasPresentaciones(personales: Presentacion[], oficiales: Presentacion[]) {
  return [...personales, ...oficiales]
}
