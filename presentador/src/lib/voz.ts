import { useCallback, useEffect, useRef, useState } from 'react'

/*
 * Dictado con el micrófono real: nivel de audio con Web Audio y transcripción con
 * la Web Speech API cuando el navegador la ofrece (Chrome, Edge, Safari).
 */

interface ResultadoVoz {
  isFinal: boolean
  0: { transcript: string }
}
interface EventoVoz {
  resultIndex: number
  results: ArrayLike<ResultadoVoz>
}
interface Reconocedor {
  lang: string
  continuous: boolean
  interimResults: boolean
  onresult: ((e: EventoVoz) => void) | null
  onerror: ((e: { error: string }) => void) | null
  onend: (() => void) | null
  start: () => void
  stop: () => void
  abort: () => void
}
type ConstructorReconocedor = new () => Reconocedor

function constructorReconocedor(): ConstructorReconocedor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as { SpeechRecognition?: ConstructorReconocedor; webkitSpeechRecognition?: ConstructorReconocedor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function soportaDictado() {
  return Boolean(constructorReconocedor()) && typeof navigator !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia)
}

export type ErrorDictado = 'permiso' | 'sin-soporte' | 'red' | null

export function useDictado(idioma = 'es-AR') {
  const [escuchando, setEscuchando] = useState(false)
  const [texto, setTexto] = useState('')
  const [parcial, setParcial] = useState('')
  const [error, setError] = useState<ErrorDictado>(null)
  const nivel = useRef(0)
  const finalRef = useRef('')
  const rec = useRef<Reconocedor | null>(null)
  const recursos = useRef<{ stream?: MediaStream; ctx?: AudioContext; raf?: number }>({})
  const activo = useRef(false)

  const liberar = useCallback(() => {
    const r = recursos.current
    if (r.raf) cancelAnimationFrame(r.raf)
    r.stream?.getTracks().forEach((t) => t.stop())
    void r.ctx?.close().catch(() => undefined)
    recursos.current = {}
    nivel.current = 0
  }, [])

  const detener = useCallback(() => {
    activo.current = false
    rec.current?.stop()
    rec.current = null
    liberar()
    setEscuchando(false)
    setParcial('')
    return finalRef.current.trim()
  }, [liberar])

  const iniciar = useCallback(async () => {
    const Ctor = constructorReconocedor()
    if (!Ctor) {
      setError('sin-soporte')
      return false
    }
    setError(null)
    finalRef.current = ''
    setTexto('')
    setParcial('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } })
      const ctx = new AudioContext()
      const analizador = ctx.createAnalyser()
      analizador.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analizador)
      const datos = new Uint8Array(analizador.fftSize)
      const medir = () => {
        analizador.getByteTimeDomainData(datos)
        let acumulado = 0
        for (const v of datos) acumulado += ((v - 128) / 128) ** 2
        const rms = Math.sqrt(acumulado / datos.length)
        nivel.current = nivel.current * 0.6 + Math.min(1, rms * 5) * 0.4
        recursos.current.raf = requestAnimationFrame(medir)
      }
      recursos.current = { stream, ctx }
      medir()
    } catch {
      setError('permiso')
      liberar()
      return false
    }

    const r = new Ctor()
    r.lang = idioma
    r.continuous = true
    r.interimResults = true
    r.onresult = (e) => {
      let interino = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const res = e.results[i]
        if (res.isFinal) finalRef.current = `${finalRef.current} ${res[0].transcript.trim()}`.trim()
        else interino += res[0].transcript
      }
      setTexto(finalRef.current)
      setParcial(interino)
    }
    r.onerror = (e) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') setError('permiso')
      else if (e.error === 'network') setError('red')
    }
    // el reconocimiento se corta solo tras un silencio: se reanuda mientras se siga grabando
    r.onend = () => {
      if (activo.current) {
        try {
          r.start()
        } catch {
          // ya estaba iniciado
        }
      }
    }
    rec.current = r
    activo.current = true
    r.start()
    setEscuchando(true)
    return true
  }, [idioma, liberar])

  useEffect(
    () => () => {
      activo.current = false
      rec.current?.abort()
      liberar()
    },
    [liberar],
  )

  return { escuchando, texto, parcial, error, nivel, iniciar, detener }
}
