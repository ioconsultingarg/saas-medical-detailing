import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cursoPorId, cursos, desafioSemanal, DIA, insignias, nivelDe, UMBRAL_APROBACION, XP, type Insignia, type ResultadoQuiz } from '../data/academia'
import { useDemo } from './demo'

export interface IntentoEvaluacion {
  puntaje: number
  fecha: number
  aprobado: boolean
}

export interface ProgresoCurso {
  lecciones: string[]
  intentos: IntentoEvaluacion[]
  certificado?: { codigo: string; fecha: number }
}

export interface EstadoAcademia {
  version: 1
  xp: number
  insignias: string[]
  progreso: Record<string, ProgresoCurso>
  vencimientos: Record<string, number>
  racha: { semanas: number; ultimaSemana: number }
  desafio: { semana: number; aciertos: number } | null
  nombreEnRanking: boolean
}

const CLAVE = 'presentador-academia-v1'

export function semanaActual(t = Date.now()) {
  // semanas contadas desde un lunes: la racha se reinicia por semana, no por día
  return Math.floor((t / DIA + 3) / 7)
}

export const progresoVacio: ProgresoCurso = { lecciones: [], intentos: [] }

function inicial(): EstadoAcademia {
  const ahora = Date.now()
  const etica = cursoPorId['curso-etica']
  const emitido = ahora - 118 * DIA
  return {
    version: 1,
    xp: 420,
    insignias: ['primer-certificado'],
    progreso: {
      'curso-etica': {
        lecciones: etica.lecciones.map((l) => l.id),
        intentos: [{ puntaje: 0.8, fecha: emitido, aprobado: true }],
        certificado: { codigo: 'CERT-ETICA-2026-0417', fecha: emitido },
      },
      'curso-cardio': { lecciones: ['c-l1', 'c-l2'], intentos: [] },
      'curso-respira': { lecciones: [], intentos: [] },
    },
    vencimientos: Object.fromEntries(cursos.map((c) => [c.id, ahora + c.diasParaVencer * DIA])),
    racha: { semanas: 3, ultimaSemana: semanaActual() - 1 },
    desafio: null,
    nombreEnRanking: true,
  }
}

function cargar(): EstadoAcademia {
  try {
    const crudo = localStorage.getItem(CLAVE)
    if (crudo) {
      const guardado = JSON.parse(crudo) as EstadoAcademia
      if (guardado.version === 1) return guardado
    }
  } catch {
    // almacenamiento bloqueado: la academia arranca de cero en memoria
  }
  return inicial()
}

function insigniasPorEstado(e: EstadoAcademia) {
  const certificado = (id: string) => Boolean(e.progreso[id]?.certificado)
  const ids: string[] = []
  if (Object.values(e.progreso).some((p) => p.certificado)) ids.push('primer-certificado')
  if (certificado('curso-cardio') && certificado('curso-respira')) ids.push('doble-linea')
  if (e.racha.semanas >= 4) ids.push('constancia')
  if (e.desafio) ids.push('desafio')
  return ids
}

interface ContextoAcademia {
  estado: EstadoAcademia
  nivel: ReturnType<typeof nivelDe>
  pendientes: number
  completarLeccion: (cursoId: string, leccionId: string) => void
  registrarEvaluacion: (cursoId: string, aciertos: number, total: number) => ResultadoQuiz
  responderDesafio: (aciertos: number) => ResultadoQuiz
  setNombreEnRanking: (valor: boolean) => void
  reiniciar: () => void
}

const Contexto = createContext<ContextoAcademia | null>(null)

export function AcademiaProvider({ children }: { children: ReactNode }) {
  const { avisar } = useDemo()
  const [estado, setEstado] = useState(cargar)
  const ref = useRef(estado)

  useEffect(() => {
    ref.current = estado
    try {
      localStorage.setItem(CLAVE, JSON.stringify(estado))
    } catch {
      // sin persistencia: el progreso vive en esta sesión
    }
  }, [estado])

  /** Aplica un cambio, suma XP, actualiza la racha y otorga insignias; avisa lo nuevo */
  const aplicar = useCallback(
    (cambio: (e: EstadoAcademia) => EstadoAcademia, xpGanado: number, extras: string[] = []): Insignia[] => {
      const previo = ref.current
      let s = cambio(previo)
      const semana = semanaActual()
      if (s.racha.ultimaSemana !== semana) {
        const consecutiva = s.racha.ultimaSemana === semana - 1
        s = { ...s, racha: { semanas: consecutiva ? s.racha.semanas + 1 : 1, ultimaSemana: semana } }
      }
      s = { ...s, xp: previo.xp + xpGanado }
      const nuevasIds = [...new Set([...insigniasPorEstado(s), ...extras])].filter((id) => !previo.insignias.includes(id))
      s = { ...s, insignias: [...previo.insignias, ...nuevasIds] }
      ref.current = s
      setEstado(s)

      const nuevas = insignias.filter((i) => nuevasIds.includes(i.id))
      for (const i of nuevas) avisar(`Nueva insignia: ${i.nombre}`)
      const antes = nivelDe(previo.xp).actual.nombre
      const despues = nivelDe(s.xp).actual.nombre
      if (antes !== despues) avisar(`Subiste a nivel ${despues}`)
      return nuevas
    },
    [avisar],
  )

  const completarLeccion = useCallback(
    (cursoId: string, leccionId: string) => {
      const p = ref.current.progreso[cursoId] ?? progresoVacio
      if (p.lecciones.includes(leccionId)) return
      avisar(`+${XP.leccion} XP · lección completada`)
      aplicar((e) => ({ ...e, progreso: { ...e.progreso, [cursoId]: { ...p, lecciones: [...p.lecciones, leccionId] } } }), XP.leccion)
    },
    [aplicar, avisar],
  )

  const registrarEvaluacion = useCallback(
    (cursoId: string, aciertos: number, total: number): ResultadoQuiz => {
      const curso = cursoPorId[cursoId]
      const p = ref.current.progreso[cursoId] ?? progresoVacio
      const ahora = Date.now()
      const puntaje = total > 0 ? aciertos / total : 0
      const aprobado = puntaje >= UMBRAL_APROBACION
      const nuevoCertificado = aprobado && !p.certificado
      let xp = 0
      const extras: string[] = []
      if (nuevoCertificado) {
        xp += XP.aprobado
        if (p.intentos.length === 0 && puntaje === 1) {
          xp += XP.sinErrores
          extras.push('sin-errores')
        }
        if ((ref.current.vencimientos[cursoId] ?? 0) - ahora >= 3 * DIA) extras.push('antes-de-tiempo')
      }
      const certificado = nuevoCertificado
        ? {
            codigo: `CERT-${(curso?.productoId ?? 'etica').toUpperCase()}-${new Date(ahora).getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
            fecha: ahora,
          }
        : p.certificado
      const nuevas = aplicar(
        (e) => ({
          ...e,
          progreso: { ...e.progreso, [cursoId]: { ...p, intentos: [...p.intentos, { puntaje, fecha: ahora, aprobado }], certificado } },
        }),
        xp,
        extras,
      )
      return { aprobado, xpGanado: xp, nuevasInsignias: nuevas }
    },
    [aplicar],
  )

  const responderDesafio = useCallback(
    (aciertos: number): ResultadoQuiz => {
      const semana = semanaActual()
      if (ref.current.desafio?.semana === semana) return { aprobado: null, xpGanado: 0, nuevasInsignias: [] }
      const xp = Math.min(aciertos, desafioSemanal.length) * XP.desafioAcierto
      const nuevas = aplicar((e) => ({ ...e, desafio: { semana, aciertos } }), xp)
      return { aprobado: null, xpGanado: xp, nuevasInsignias: nuevas }
    },
    [aplicar],
  )

  const setNombreEnRanking = useCallback((valor: boolean) => {
    setEstado((e) => {
      const s = { ...e, nombreEnRanking: valor }
      ref.current = s
      return s
    })
  }, [])

  const reiniciar = useCallback(() => {
    const s = inicial()
    ref.current = s
    setEstado(s)
  }, [])

  const valor = useMemo<ContextoAcademia>(
    () => ({
      estado,
      nivel: nivelDe(estado.xp),
      pendientes: cursos.filter((c) => c.obligatorio && !estado.progreso[c.id]?.certificado).length,
      completarLeccion,
      registrarEvaluacion,
      responderDesafio,
      setNombreEnRanking,
      reiniciar,
    }),
    [estado, completarLeccion, registrarEvaluacion, responderDesafio, setNombreEnRanking, reiniciar],
  )

  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>
}

export function useAcademia() {
  const ctx = useContext(Contexto)
  if (!ctx) throw new Error('useAcademia fuera de AcademiaProvider')
  return ctx
}
