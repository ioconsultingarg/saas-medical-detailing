import { useEffect, useRef, useState, type FormEvent } from 'react'
import { ArrowUp, BookOpen, Check, CircleHelp, ExternalLink, LifeBuoy, Mail, MessageCircle, ThumbsDown, ThumbsUp } from 'lucide-react'
import { preguntasFrecuentes, soporte, type Articulo } from '../data/ayuda'
import { ayudaDePantalla, buscarAyuda } from '../lib/ayuda'
import type { Ruta } from '../lib/ruta'
import { useDemo } from '../state/demo'
import { Sheet } from './Sheet'

interface Turno {
  id: number
  pregunta: string
  resultados: Articulo[]
}

const nombrePantalla: Partial<Record<Ruta['nombre'], string>> = {
  hoy: 'Hoy',
  medicos: 'Fichero médico',
  medico: 'Ficha del médico',
  biblioteca: 'Biblioteca',
  constructor: 'Constructor',
  presentar: 'Presentación',
  compartir: 'Compartir material',
  registro: 'Cierre de visita',
  stock: 'Stock',
  academia: 'Academia',
  curso: 'Curso',
  asistente: 'Asistente',
  integraciones: 'Integraciones',
  actividad: 'Actividad',
}

function TarjetaArticulo({ a, onCerrar }: { a: Articulo; onCerrar: () => void }) {
  const [voto, setVoto] = useState<'si' | 'no' | null>(null)

  return (
    <article className="card p-4">
      <h3 className="text-[15px] leading-snug font-semibold text-ink">{a.titulo}</h3>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-2">{a.resumen}</p>
      {a.pasos && (
        <ol className="mt-3 flex flex-col gap-2">
          {a.pasos.map((p, i) => (
            <li key={p} className="flex gap-2.5 text-[14px] leading-relaxed text-ink-2">
              <span aria-hidden="true" className="num mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-sunken text-[11px] font-medium text-ink-2">
                {i + 1}
              </span>
              {p}
            </li>
          ))}
        </ol>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {a.enlace && (
          <a href={a.enlace.href} onClick={onCerrar} className="btn-secondary">
            {a.enlace.texto}
            <ExternalLink size={15} aria-hidden="true" />
          </a>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {voto ? (
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-ok">
              <Check size={13} aria-hidden="true" />
              Gracias
            </span>
          ) : (
            <>
              <span className="text-[12px] text-ink-3">¿Te sirvió?</span>
              <button type="button" className="btn-icon size-9" aria-label="Sí, me sirvió" onClick={() => setVoto('si')}>
                <ThumbsUp size={15} aria-hidden="true" />
              </button>
              <button type="button" className="btn-icon size-9" aria-label="No me sirvió" onClick={() => setVoto('no')}>
                <ThumbsDown size={15} aria-hidden="true" />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  )
}

export function Ayuda({ abierto, onCerrar, ruta }: { abierto: boolean; onCerrar: () => void; ruta: Ruta }) {
  const { online } = useDemo()
  const [texto, setTexto] = useState('')
  const [turnos, setTurnos] = useState<Turno[]>([])
  const secuencia = useRef(0)
  const finRef = useRef<HTMLDivElement>(null)

  const contexto = nombrePantalla[ruta.nombre]
  const sugeridos = ayudaDePantalla(ruta.nombre)

  useEffect(() => {
    if (!abierto) setTexto('')
  }, [abierto])

  function preguntar(q: string) {
    const pregunta = q.trim()
    if (!pregunta) return
    secuencia.current += 1
    setTurnos((t) => [...t, { id: secuencia.current, pregunta, resultados: buscarAyuda(pregunta, ruta.nombre).map((r) => r.articulo) }])
    setTexto('')
    window.setTimeout(() => finRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }), 60)
  }

  function enviar(e: FormEvent) {
    e.preventDefault()
    preguntar(texto)
  }

  return (
    <Sheet
      abierto={abierto}
      onCerrar={onCerrar}
      titulo="Ayuda"
      subtitulo={
        <span className="eyebrow flex items-center gap-1.5">
          <LifeBuoy size={12} aria-hidden="true" />
          {contexto ? `Estás en ${contexto}` : 'Manual de la app'}
        </span>
      }
      ancho="480px"
      pie={
        <form onSubmit={enviar} className="flex items-end gap-2">
          <label htmlFor="consulta-ayuda" className="sr-only">
            Escribí tu consulta
          </label>
          <input
            id="consulta-ayuda"
            name="consulta-ayuda"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escribí tu consulta…"
            autoComplete="off"
            className="field flex-1"
          />
          <button type="submit" className="btn-icon bg-ink text-white hover:bg-[#1c2536] hover:text-white" aria-label="Preguntar" disabled={!texto.trim()}>
            <ArrowUp size={18} aria-hidden="true" />
          </button>
        </form>
      }
    >
      <div className="flex flex-col gap-5">
        {turnos.length === 0 && (
          <>
            {sugeridos.length > 0 && (
              <section aria-labelledby="ayuda-pantalla">
                <h3 id="ayuda-pantalla" className="eyebrow mb-2 flex items-center gap-1.5">
                  <BookOpen size={12} aria-hidden="true" />
                  Sobre esta pantalla
                </h3>
                <div className="flex flex-col gap-3">
                  {sugeridos.map((a) => (
                    <TarjetaArticulo key={a.id} a={a} onCerrar={onCerrar} />
                  ))}
                </div>
              </section>
            )}

            <section aria-labelledby="ayuda-frecuentes">
              <h3 id="ayuda-frecuentes" className="eyebrow mb-2">
                Preguntas frecuentes
              </h3>
              <div className="flex flex-col gap-2">
                {preguntasFrecuentes.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => preguntar(p)}
                    className="press flex min-h-11 cursor-pointer items-center gap-2 rounded-xl border border-line bg-surface px-3.5 text-left text-[14px] text-ink-2 hover:border-line-2 hover:text-ink"
                  >
                    <CircleHelp size={15} aria-hidden="true" className="shrink-0 text-ink-3" />
                    {p}
                  </button>
                ))}
              </div>
            </section>
          </>
        )}

        {turnos.map((t) => (
          <div key={t.id} className="flex flex-col gap-3">
            <p className="ml-auto max-w-[85%] rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[14px] text-white">{t.pregunta}</p>
            {t.resultados.length === 0 ? (
              <div className="card p-4">
                <p className="text-[14px] leading-relaxed text-ink-2">
                  No encontré eso en el manual. Probá con otras palabras, o escribile al equipo de soporte: te responden {soporte.horario.toLowerCase()}.
                </p>
              </div>
            ) : (
              t.resultados.map((a) => <TarjetaArticulo key={a.id} a={a} onCerrar={onCerrar} />)
            )}
          </div>
        ))}

        <div ref={finRef} />

        <section aria-labelledby="ayuda-soporte" className="rounded-xl bg-sunken p-4">
          <h3 id="ayuda-soporte" className="text-[14px] font-semibold text-ink">
            ¿Necesitás una mano?
          </h3>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-3">
            {online ? `Soporte de IO Consulting · ${soporte.horario}.` : 'Sin conexión no se puede escribir a soporte, pero el manual funciona igual.'}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={`https://wa.me/${soporte.whatsapp.replace('+', '')}`}
              target="_blank"
              rel="noreferrer"
              className={`btn-secondary ${online ? '' : 'pointer-events-none opacity-45'}`}
              aria-disabled={!online}
            >
              <MessageCircle size={16} aria-hidden="true" />
              WhatsApp
            </a>
            <a href={`mailto:${soporte.email}`} className={`btn-secondary ${online ? '' : 'pointer-events-none opacity-45'}`} aria-disabled={!online}>
              <Mail size={16} aria-hidden="true" />
              Correo
            </a>
          </div>
        </section>
      </div>
    </Sheet>
  )
}
