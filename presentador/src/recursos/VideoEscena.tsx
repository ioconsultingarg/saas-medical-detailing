import { useEffect, useId, useRef, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { productos } from '../data/productos'
import type { Recurso } from '../data/recursos'
import { prefiereMenosMovimiento } from '../lib/tiempo'

type Video = Extract<Recurso, { tipo: 'video' }>

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))
const tramo = (t: number, desde: number, hasta: number) => clamp((t - desde) / (hasta - desde))

/** Escena animada del mecanismo cardiovascular: hígado, LDL y receptores */
function EscenaCardio({ t }: { t: number }) {
  const p = productos.cardio
  const efecto = tramo(t, 8, 12)
  const farmaco = tramo(t, 4, 7)
  const receptores = 3 + Math.round(efecto * 6)
  const ldl = Array.from({ length: 16 }, (_, i) => i).filter((i) => i >= Math.round(efecto * 10))
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true">
      <rect width="640" height="360" fill="#0d1117" />
      <text x="36" y="44" fill="#8b98ab" fontSize="13" fontFamily="IBM Plex Mono">HÍGADO</text>
      <path d="M40 120 C 60 70, 220 60, 270 110 C 300 140, 290 230, 230 250 C 160 272, 60 250, 44 200 C 34 170, 30 145, 40 120 Z" fill="#7a3b3f" />
      <path d="M40 120 C 60 70, 220 60, 270 110" stroke="#9b5156" strokeWidth="3" fill="none" />
      {Array.from({ length: 9 }, (_, i) => {
        const a = -0.9 + (i / 8) * 1.8
        const visible = i < receptores
        const cx = 160 + Math.cos(a) * 118
        const cy = 170 + Math.sin(a) * 88
        return (
          <g key={i} transform={`translate(${cx} ${cy}) rotate(${(a * 180) / Math.PI})`} opacity={visible ? 1 : 0.12} style={{ transition: 'opacity 400ms' }}>
            <path d="M0 0 L14 0 M14 0 L22 -7 M14 0 L22 7" stroke={p.acento} strokeWidth="3" strokeLinecap="round" />
          </g>
        )
      })}
      {Array.from({ length: 10 }, (_, i) => {
        const avance = clamp(farmaco * 1.4 - i * 0.04)
        return <circle key={i} cx={330 - avance * (150 + i * 6)} cy={120 + i * 11} r="5" fill="#34d3b4" opacity={avance > 0 && avance < 1 ? 1 : avance >= 1 ? 0.5 : 0} />
      })}
      <text x="360" y="44" fill="#8b98ab" fontSize="13" fontFamily="IBM Plex Mono">ARTERIA</text>
      <rect x="340" y="120" width="270" height="120" rx="60" fill="#3a1c22" />
      <rect x="340" y="120" width="270" height="120" rx="60" fill="none" stroke="#8c3f47" strokeWidth="6" />
      <path d={`M380 ${232 - (1 - efecto) * 26} Q 475 ${226 - (1 - efecto) * 34} 570 ${232 - (1 - efecto) * 26} L570 236 L380 236 Z`} fill="#e8c46a" opacity="0.9" />
      {ldl.map((i) => {
        const x = 350 + ((i * 47 + t * 70) % 250)
        const y = 150 + ((i * 29) % 60)
        return <circle key={i} cx={x} cy={y} r="9" fill="#f2d27a" stroke="#b8923c" strokeWidth="2" />
      })}
      <g fontFamily="IBM Plex Mono" fontSize="13">
        <text x="360" y="290" fill="#8b98ab">LDL CIRCULANTE</text>
        <rect x="360" y="302" width="240" height="8" rx="4" fill="#1e2632" />
        <rect x="360" y="302" width={240 - efecto * 125} height="8" rx="4" fill="#e8c46a" />
      </g>
    </svg>
  )
}

/** Escena respiratoria: corte del bronquio que se abre */
function EscenaRespira({ t }: { t: number }) {
  const p = productos.respira
  const dep = tramo(t, 4, 8)
  const efecto = tramo(t, 8, 11)
  const luz = 34 + efecto * 50
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true">
      <rect width="640" height="360" fill="#0d1117" />
      <text x="36" y="44" fill="#8b98ab" fontSize="13" fontFamily="IBM Plex Mono">CORTE DE BRONQUIO</text>
      <circle cx="320" cy="190" r="140" fill="#5a2f37" />
      <circle cx="320" cy="190" r={luz + 34} fill="none" stroke={efecto > 0.5 ? p.acento : '#b0606b'} strokeWidth={18 - efecto * 12} strokeDasharray={efecto > 0.5 ? '0' : '14 8'} />
      <circle cx="320" cy="190" r={luz + 12} fill="#8d4a55" />
      <circle cx="320" cy="190" r={luz} fill="#0d1117" />
      {Array.from({ length: 18 }, (_, i) => {
        const a = (i / 18) * Math.PI * 2
        const r = 200 - dep * (200 - (luz + 16))
        return <circle key={i} cx={320 + Math.cos(a + t * 0.3) * r} cy={190 + Math.sin(a + t * 0.3) * r} r="4.5" fill="#7cc4ee" opacity={dep > 0 ? 0.95 : 0} />
      })}
      <g fontFamily="IBM Plex Mono" fontSize="13">
        <text x="500" y="300" fill="#8b98ab" textAnchor="middle">CALIBRE</text>
        <text x="500" y="330" fill="#fff" fontSize="22" textAnchor="middle">{Math.round(40 + efecto * 60)}%</text>
      </g>
    </svg>
  )
}

/** Técnica inhalatoria: cuatro pasos con el paso activo destacado */
function EscenaTecnica({ t, capitulo }: { t: number; capitulo: number }) {
  const p = productos.respira
  const pasos = ['Agitar', 'Exhalar', 'Inhalar', 'Sostener']
  const agitar = capitulo === 0 ? Math.sin(t * 18) * 10 : 0
  const cuenta = capitulo === 3 ? Math.max(0, 10 - Math.floor((t - 12) * 2.5)) : 10
  return (
    <svg viewBox="0 0 640 360" className="h-full w-full" aria-hidden="true">
      <rect width="640" height="360" fill="#0d1117" />
      <g transform={`translate(250 70) rotate(${agitar} 70 110)`}>
        <rect x="40" y="0" width="60" height="150" rx="16" fill="#e7eef6" />
        <rect x="20" y="130" width="100" height="60" rx="18" fill={p.color} />
        <rect x="95" y="150" width="60" height="30" rx="8" fill={p.color} />
      </g>
      {capitulo === 1 &&
        [0, 1, 2].map((i) => (
          <path key={i} d={`M ${430 + ((t * 40 + i * 30) % 90)} ${150 + i * 22} q 18 -8 36 0`} stroke="#7cc4ee" strokeWidth="4" fill="none" strokeLinecap="round" opacity="0.8" />
        ))}
      {capitulo === 2 &&
        Array.from({ length: 12 }, (_, i) => (
          <circle key={i} cx={420 + ((i * 13 + t * 90) % 120)} cy={235 + Math.sin(i + t * 4) * 12} r="4" fill={p.acento} opacity="0.9" />
        ))}
      {capitulo === 3 && (
        <text x="470" y="215" fill="#fff" fontSize="64" fontFamily="IBM Plex Mono" textAnchor="middle">
          {cuenta}
        </text>
      )}
      {pasos.map((nombre, i) => (
        <g key={nombre} transform={`translate(${40 + i * 145} 296)`}>
          <rect width="130" height="42" rx="21" fill={i === capitulo ? p.acento : '#1e2632'} />
          <text x="65" y="27" textAnchor="middle" fontSize="15" fontWeight="600" fill={i === capitulo ? p.sobreAcento : '#8b98ab'}>
            {i + 1}. {nombre}
          </text>
        </g>
      ))}
    </svg>
  )
}

export function VideoEscena({ r }: { r: Video }) {
  const [t, setT] = useState(0)
  const [reproduciendo, setReproduciendo] = useState(() => !prefiereMenosMovimiento())
  const ultimo = useRef<number | null>(null)
  const idRango = useId()

  useEffect(() => {
    if (!reproduciendo) {
      ultimo.current = null
      return
    }
    let raf = 0
    const paso = (ahora: number) => {
      const dt = ultimo.current === null ? 0 : (ahora - ultimo.current) / 1000
      ultimo.current = ahora
      setT((prev) => {
        const siguiente = prev + dt
        if (siguiente >= r.duracion) {
          setReproduciendo(false)
          return r.duracion
        }
        return siguiente
      })
      raf = requestAnimationFrame(paso)
    }
    raf = requestAnimationFrame(paso)
    return () => cancelAnimationFrame(raf)
  }, [reproduciendo, r.duracion])

  const capitulo = r.capitulos.reduce((acc, c, i) => (t >= c.desde ? i : acc), 0)
  const fin = t >= r.duracion

  function alternar() {
    if (fin) setT(0)
    setReproduciendo((v) => (fin ? true : !v))
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl bg-stage">
        <div className="aspect-video w-full">
          {r.escena === 'cardio-mecanismo' && <EscenaCardio t={t} />}
          {r.escena === 'respira-mecanismo' && <EscenaRespira t={t} />}
          {r.escena === 'respira-tecnica' && <EscenaTecnica t={t} capitulo={capitulo} />}
        </div>
        <p aria-live="polite" className="min-h-[60px] border-t border-white/10 px-4 py-3 text-[15px] leading-snug text-white">
          {r.capitulos[capitulo].texto}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="btn-primary size-11 px-0" onClick={alternar} aria-label={fin ? 'Volver a reproducir' : reproduciendo ? 'Pausar' : 'Reproducir'}>
          {fin ? <RotateCcw size={18} aria-hidden="true" /> : reproduciendo ? <Pause size={18} aria-hidden="true" /> : <Play size={18} aria-hidden="true" />}
        </button>
        <label htmlFor={idRango} className="sr-only">
          Posición del video
        </label>
        <input
          id={idRango}
          type="range"
          min={0}
          max={r.duracion}
          step={0.1}
          value={t}
          onChange={(e) => setT(Number(e.target.value))}
          className="h-11 min-w-0 flex-1 cursor-pointer accent-ink"
          aria-valuetext={`${Math.floor(t)} de ${r.duracion} segundos`}
        />
        <span className="num w-[76px] text-right text-[13px] text-ink-3">
          0:{String(Math.floor(t)).padStart(2, '0')} / 0:{String(r.duracion).padStart(2, '0')}
        </span>
      </div>

      <ol className="flex flex-col gap-1">
        {r.capitulos.map((c, i) => (
          <li key={c.desde}>
            <button
              type="button"
              onClick={() => setT(c.desde)}
              className={`press flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left text-[14px] ${i === capitulo ? 'bg-sunken text-ink' : 'text-ink-3 hover:bg-sunken'}`}
            >
              <span className="num shrink-0 pt-px">0:{String(c.desde).padStart(2, '0')}</span>
              <span>{c.texto}</span>
            </button>
          </li>
        ))}
      </ol>
      <p className="text-[12px] text-ink-3">Animación de demostración generada en la app: funciona sin conexión.</p>
    </div>
  )
}
