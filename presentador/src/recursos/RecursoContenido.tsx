import { lazy, Suspense, useId, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { productos } from '../data/productos'
import type { Recurso } from '../data/recursos'
import { VideoEscena } from './VideoEscena'

const Modelo3D = lazy(() => import('./Modelo3D'))

export function etiquetaRecurso(r: Recurso) {
  switch (r.tipo) {
    case 'estudio':
      return 'Estudio clínico'
    case 'grafico':
      return 'Gráfico interactivo'
    case 'video':
      return `Video · 0:${String(r.duracion).padStart(2, '0')}`
    case 'modelo3d':
      return 'Modelo 3D'
    case 'documento':
      return 'Documento aprobado'
  }
}

function Estudio({ r }: { r: Extract<Recurso, { tipo: 'estudio' }> }) {
  const p = productos[r.productoId]
  const max = Math.max(...r.grafico.barras.map((b) => b.valor))
  return (
    <div className="flex flex-col gap-6">
      <p className="num text-[13px] leading-relaxed text-ink-3">{r.diseno}</p>
      <div className="grid grid-cols-2 gap-3">
        {r.hallazgos.map((h) => (
          <div key={h.texto} className="rounded-xl bg-sunken p-4">
            <div className="num text-[30px] leading-none font-medium" style={{ color: p.color }}>
              {h.valor}
            </div>
            <p className="mt-2 text-[14px] leading-snug text-ink-2">{h.texto}</p>
          </div>
        ))}
      </div>
      <figure>
        <figcaption className="mb-3 text-[15px] font-semibold text-ink">{r.grafico.titulo}</figcaption>
        <ul className="flex flex-col gap-3">
          {r.grafico.barras.map((b) => (
            <li key={b.etiqueta}>
              <div className="flex justify-between gap-3 text-[14px] text-ink-2">
                <span>{b.etiqueta}</span>
                <span className="num font-medium text-ink">
                  {String(b.valor).replace('.', ',')}
                  {r.grafico.unidad === '%' ? '%' : ` ${r.grafico.unidad}`}
                </span>
              </div>
              <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-sunken">
                <div className="h-full rounded-full" style={{ width: `${(b.valor / max) * 100}%`, background: b.destacado ? p.color : '#9aa6b6' }} />
              </div>
            </li>
          ))}
        </ul>
      </figure>
      <p className="border-t border-line pt-3 text-[12px] leading-relaxed text-ink-3">{r.referencia}</p>
    </div>
  )
}

function GraficoInteractivo({ r }: { r: Extract<Recurso, { tipo: 'grafico' }> }) {
  const [i, setI] = useState(Math.floor(r.semanas.length / 2))
  const idRango = useId()
  const W = 400
  const H = 240
  const pad = { t: 14, r: 14, b: 30, l: 36 }
  const max = Math.ceil(Math.max(...r.series.flatMap((s) => s.valores)) / 10) * 10 || 10
  const x = (k: number) => pad.l + (k / (r.semanas.length - 1)) * (W - pad.l - pad.r)
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b)
  const [principal, ...otras] = r.series

  return (
    <div className="flex flex-col gap-5">
      <p className="text-[14px] leading-relaxed text-ink-2">{r.descripcion}</p>
      <div className="rounded-xl border border-line p-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`${r.unidad} en la semana ${r.semanas[i]}`}>
          {[0, max / 2, max].map((t) => (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e6ec" />
              <text x={pad.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="#56617a" fontFamily="IBM Plex Mono">
                {t}
              </text>
            </g>
          ))}
          {r.semanas.map((s, k) => (
            <text key={s} x={x(k)} y={H - 10} textAnchor="middle" fontSize="11" fill={k === i ? '#0b1220' : '#56617a'} fontWeight={k === i ? 600 : 400} fontFamily="IBM Plex Mono">
              {s}
            </text>
          ))}
          <line x1={x(i)} x2={x(i)} y1={pad.t} y2={H - pad.b} stroke="#0b1220" strokeDasharray="3 4" style={{ transition: 'all 200ms var(--ease-fluid)' }} />
          {r.series.map((s, si) => (
            <g key={s.nombre}>
              <polyline points={s.valores.map((v, k) => `${x(k)},${y(v)}`).join(' ')} fill="none" stroke={s.color} strokeWidth={si === 0 ? 3 : 2} strokeLinejoin="round" strokeLinecap="round" />
              <circle cx={x(i)} cy={y(s.valores[i])} r={si === 0 ? 5.5 : 4} fill="#fff" stroke={s.color} strokeWidth="2.5" />
            </g>
          ))}
        </svg>
      </div>

      <div>
        <label htmlFor={idRango} className="flex items-baseline justify-between text-[14px] font-medium text-ink">
          Semana del estudio
          <span className="num text-[22px]">{r.semanas[i]}</span>
        </label>
        <input
          id={idRango}
          type="range"
          min={0}
          max={r.semanas.length - 1}
          step={1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          className="mt-2 h-11 w-full cursor-pointer"
          style={{ accentColor: principal.color }}
          aria-valuetext={`Semana ${r.semanas[i]}`}
        />
      </div>

      <table className="w-full text-[14px]">
        <caption className="sr-only">{r.unidad} por grupo en la semana {r.semanas[i]}</caption>
        <tbody>
          {r.series.map((s) => (
            <tr key={s.nombre} className="border-t border-line">
              <th scope="row" className="py-2.5 text-left font-medium text-ink-2">
                <span className="mr-2 inline-block h-1 w-4 rounded-full align-middle" style={{ background: s.color }} />
                {s.nombre}
              </th>
              <td className="num py-2.5 text-right text-[16px] font-medium text-ink">{s.valores[i]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {otras[0] && (
        <p className="rounded-xl bg-sunken px-4 py-3 text-[14px] text-ink-2">
          Diferencia vs. {otras[0].nombre.toLowerCase()}:{' '}
          <strong className="num text-ink">{principal.valores[i] - otras[0].valores[i]} puntos</strong>
        </p>
      )}
      <p className="border-t border-line pt-3 text-[12px] leading-relaxed text-ink-3">{r.referencia}</p>
    </div>
  )
}

function Documento({ r }: { r: Extract<Recurso, { tipo: 'documento' }> }) {
  return (
    <div className="flex h-full flex-col gap-3">
      <iframe src={r.url} title={r.titulo} className="h-[62dvh] w-full rounded-xl border border-line bg-sunken" />
      <a href={r.url} target="_blank" rel="noreferrer" className="btn-secondary self-start">
        <ExternalLink size={16} aria-hidden="true" />
        Abrir en otra pestaña
      </a>
    </div>
  )
}

export function RecursoContenido({ recurso }: { recurso: Recurso }) {
  switch (recurso.tipo) {
    case 'estudio':
      return <Estudio r={recurso} />
    case 'grafico':
      return <GraficoInteractivo r={recurso} />
    case 'video':
      return <VideoEscena r={recurso} />
    case 'documento':
      return <Documento r={recurso} />
    case 'modelo3d':
      return (
        <Suspense fallback={<div className="flex aspect-square w-full items-center justify-center rounded-2xl bg-stage text-[14px] text-white/70">Cargando modelo 3D…</div>}>
          <Modelo3D r={recurso} />
        </Suspense>
      )
  }
}
