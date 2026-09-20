import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { apm } from '../data/agenda'

export type Rol = 'apm' | 'lab'

/** Cuentas ficticias de la demo: se muestran en la pantalla de ingreso, no son un secreto */
export const CUENTAS: Record<Rol, { email: string; clave: string; nombre: string; cargo: string }> = {
  apm: { email: 'lucia.romero@laboratoriodemo.com', clave: 'demo1234', nombre: apm.nombre, cargo: 'Visitadora médica' },
  lab: { email: 'martin.sosa@laboratoriodemo.com', clave: 'demo1234', nombre: 'Martín Sosa', cargo: 'Gerente de producto' },
}

/** Compatibilidad con el acceso anterior */
export const CUENTA_DEMO = CUENTAS.apm

export interface Sesion {
  email: string
  nombre: string
  rol: Rol
  cargo: string
  desde: number
}

const CLAVE = 'presentador-sesion'

function leer(): Sesion | null {
  for (const almacen of [localStorage, sessionStorage]) {
    try {
      const crudo = almacen.getItem(CLAVE)
      if (crudo) {
        const guardada = JSON.parse(crudo) as Sesion
        // sesiones guardadas antes de los roles entran como visitador
        return { ...guardada, rol: guardada.rol ?? 'apm', cargo: guardada.cargo ?? CUENTAS.apm.cargo }
      }
    } catch {
      // almacenamiento bloqueado: se pide ingresar de nuevo
    }
  }
  return null
}

function borrar() {
  for (const almacen of [localStorage, sessionStorage]) {
    try {
      almacen.removeItem(CLAVE)
    } catch {
      // nada que borrar
    }
  }
}

export type ResultadoIngreso = { ok: true } | { ok: false; campo: 'email' | 'clave'; mensaje: string }

interface ContextoSesion {
  sesion: Sesion | null
  ingresar: (email: string, clave: string, recordar: boolean) => Promise<ResultadoIngreso>
  salir: () => void
}

const Contexto = createContext<ContextoSesion | null>(null)

export function SesionProvider({ children }: { children: ReactNode }) {
  const [sesion, setSesion] = useState<Sesion | null>(leer)

  const ingresar = useCallback(async (email: string, clave: string, recordar: boolean): Promise<ResultadoIngreso> => {
    // latencia breve para que el estado "Ingresando…" se perciba como una verificación real
    await new Promise((r) => setTimeout(r, 650))
    const normalizado = email.trim().toLowerCase()
    const entrada = Object.entries(CUENTAS).find(([, c]) => c.email === normalizado)
    if (!entrada) {
      return { ok: false, campo: 'email', mensaje: 'No encontramos una cuenta con ese correo. Usá una de las cuentas de demostración.' }
    }
    const [rol, cuenta] = entrada as [Rol, (typeof CUENTAS)[Rol]]
    if (clave !== cuenta.clave) {
      return { ok: false, campo: 'clave', mensaje: 'La contraseña no coincide. Revisá mayúsculas o usá “Completar datos”.' }
    }
    // la contraseña nunca se guarda: solo quién ingresó, con qué rol y desde cuándo
    const nueva: Sesion = { email: normalizado, nombre: cuenta.nombre, rol, cargo: cuenta.cargo, desde: Date.now() }
    borrar()
    try {
      ;(recordar ? localStorage : sessionStorage).setItem(CLAVE, JSON.stringify(nueva))
    } catch {
      // sin persistencia: la sesión dura mientras la pestaña esté abierta
    }
    setSesion(nueva)
    return { ok: true }
  }, [])

  const salir = useCallback(() => {
    borrar()
    setSesion(null)
  }, [])

  const valor = useMemo(() => ({ sesion, ingresar, salir }), [sesion, ingresar, salir])
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useSesion() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useSesion fuera de SesionProvider')
  return ctx
}
