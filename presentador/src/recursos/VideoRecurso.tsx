import { useRef, useState } from 'react'
import { urlMedio } from '../components/Medio'
import type { Recurso } from '../data/recursos'
import { VideoEscena } from './VideoEscena'

type Video = Extract<Recurso, { tipo: 'video' }>

/** Usa el video real cuando el archivo ya está en public/media; mientras tanto, la animación generada en la app */
export function VideoRecurso({ r }: { r: Video }) {
  const [listo, setListo] = useState(false)
  const [t, setT] = useState(0)
  const ref = useRef<HTMLVideoElement>(null)

  if (!r.medio) return <VideoEscena r={r} />

  const capitulo = r.capitulos.reduce((acc, c, i) => (t >= c.desde ? i : acc), 0)

  return (
    <div className="flex flex-col gap-4">
      <video
        ref={ref}
        src={urlMedio(r.medio)}
        controls
        playsInline
        preload="metadata"
        onLoadedData={() => setListo(true)}
        onTimeUpdate={(e) => setT(e.currentTarget.currentTime)}
        className={listo ? 'aspect-video w-full rounded-2xl bg-stage' : 'hidden'}
      />
      {listo ? (
        <>
          <p aria-live="polite" className="rounded-xl bg-sunken px-4 py-3 text-[15px] leading-snug text-ink">
            {r.capitulos[capitulo].texto}
          </p>
          <ol className="flex flex-col gap-1">
            {r.capitulos.map((c, i) => (
              <li key={c.desde}>
                <button
                  type="button"
                  onClick={() => {
                    const v = ref.current
                    if (!v) return
                    v.currentTime = c.desde
                    void v.play()?.catch(() => {})
                  }}
                  className={`press flex min-h-11 w-full cursor-pointer items-start gap-3 rounded-lg px-3 py-2 text-left text-[14px] ${i === capitulo ? 'bg-sunken text-ink' : 'text-ink-3 hover:bg-sunken'}`}
                >
                  <span className="num shrink-0 pt-px">0:{String(c.desde).padStart(2, '0')}</span>
                  <span>{c.texto}</span>
                </button>
              </li>
            ))}
          </ol>
        </>
      ) : (
        <VideoEscena r={r} />
      )}
    </div>
  )
}
