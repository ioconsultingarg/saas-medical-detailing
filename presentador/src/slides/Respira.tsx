import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { Timer, Vibrate, Wind, Waves } from 'lucide-react'
import { MonogramaProducto } from '../components/ui'
import { productos } from '../data/productos'
import { recursos } from '../data/recursos'
import { Aparece, Barra, BotonRecurso, cq, LineasPieza, Marco, Numero, PuntoRecurso, useAnimar, useDiapositiva } from './SlideKit'

const P = productos.respira

export function R1Portada() {
  return (
    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '57% 43%' }}>
      <div className="flex flex-col" style={{ padding: `${cq(4.2)} ${cq(4)} ${cq(3)} ${cq(5.2)}` }}>
        <Aparece className="flex items-center" style={{ gap: cq(1) }}>
          <span style={{ width: cq(2.6), height: cq(2.6) }}>
            <MonogramaProducto id="respira" size={100} className="h-full w-full" />
          </span>
          <span className="font-semibold" style={{ fontSize: cq(1.5), color: P.color }} translate="no">
            {P.marca}
          </span>
        </Aparece>
        <div className="my-auto">
          <Aparece retraso={80} className="font-mono text-ink-3 uppercase" style={{ fontSize: cq(1.1), letterSpacing: '0.1em' }}>
            Línea respiratoria
          </Aparece>
          <Aparece retraso={160}>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(5.6), lineHeight: 1.02, marginTop: cq(1.4), letterSpacing: '-0.03em' }}>
              Aire donde se necesita.
              <br />
              <span style={{ color: P.color }}>Desde la primera dosis.</span>
            </h2>
          </Aparece>
          <Aparece retraso={260}>
            <p className="text-ink-2" style={{ fontSize: cq(1.65), lineHeight: 1.45, marginTop: cq(2), maxWidth: '34ch' }}>
              Broncodilatador inhalado para el control sostenido de síntomas en EPOC y asma.
            </p>
          </Aparece>
          <Aparece retraso={360} className="flex flex-wrap" style={{ gap: cq(1), marginTop: cq(3) }}>
            <BotonRecurso recurso="r-tecnica" producto="respira">
              Técnica paso a paso
            </BotonRecurso>
            <BotonRecurso recurso="r-3d" producto="respira" tono="contorno">
              Bronquios en 3D
            </BotonRecurso>
          </Aparece>
        </div>
        <div className="text-ink-3" style={{ fontSize: cq(0.98) }}>
          {P.detalle} · Venta bajo receta. Material de demostración.
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ background: P.color }}>
        {[0, 1, 2, 3].map((i) => (
          <Aparece
            key={i}
            escala
            retraso={120 + i * 110}
            className="absolute rounded-full"
            style={{ width: cq(22 + i * 12), height: cq(22 + i * 12), right: cq(-6 - i * 6), top: cq(-6 - i * 6), border: `${cq(0.22)} solid rgb(255 255 255 / ${0.28 - i * 0.06})` }}
          />
        ))}
        <Aparece escala retraso={80} className="absolute rounded-full" style={{ width: cq(9), height: cq(9), right: cq(5), top: cq(5), background: P.acento }} />
        <div className="absolute text-white" style={{ left: cq(4), bottom: cq(5), right: cq(4) }}>
          <div className="font-mono font-medium" style={{ fontSize: cq(10.5), lineHeight: 0.9, letterSpacing: '-0.05em' }}>
            <Numero valor={82} retraso={350} />
            <span style={{ fontSize: cq(5) }}>%</span>
          </div>
          <Aparece retraso={600}>
            <p style={{ fontSize: cq(1.55), lineHeight: 1.35, marginTop: cq(1.2), maxWidth: '22ch', color: 'rgb(255 255 255 / 0.88)' }}>
              mantiene la técnica correcta a las 24 semanas¹
            </p>
            <p className="font-mono" style={{ fontSize: cq(0.95), marginTop: cq(1.6), color: 'rgb(255 255 255 / 0.6)' }}>
              1. Estudio DEMO-ADH · datos ilustrativos
            </p>
          </Aparece>
        </div>
      </div>
    </div>
  )
}

export function R2Problema() {
  const r = recursos['r-impacto']
  const barras = r.tipo === 'estudio' ? r.grafico.barras : []
  return (
    <Marco producto="respira" seccion="El problema" numero={2} referencias="1. Encuesta DEMO-EPOC, 22 centros, n = 1.960. Datos ilustrativos.">
      <div className="grid h-full items-center" style={{ gridTemplateColumns: '1fr 1fr', gap: cq(5) }}>
        <div>
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
              Casi la mitad de los pacientes con EPOC <span style={{ color: P.color }}>tiene síntomas todos los días</span>
            </h2>
          </Aparece>
          <Aparece retraso={150} className="flex items-end" style={{ gap: cq(1.6), marginTop: cq(3.4) }}>
            <span className="font-mono font-medium" style={{ fontSize: cq(9), lineHeight: 0.85, color: P.color, letterSpacing: '-0.05em' }}>
              <Numero valor={48} retraso={250} />%
            </span>
            <span className="text-ink-2" style={{ fontSize: cq(1.5), lineHeight: 1.35, maxWidth: '18ch', paddingBottom: cq(0.6) }}>
              con síntomas diarios pese al tratamiento¹
            </span>
          </Aparece>
          <Aparece retraso={300} style={{ marginTop: cq(3.4) }}>
            <BotonRecurso recurso="r-impacto" producto="respira">
              Ver la encuesta completa
            </BotonRecurso>
          </Aparece>
        </div>
        <Aparece retraso={200} className="relative rounded-[2.2cqw] bg-sunken" style={{ padding: cq(3) }}>
          <div className="font-semibold text-ink" style={{ fontSize: cq(1.5) }}>
            2 de cada 3 cometen errores de técnica
          </div>
          <div className="flex flex-col" style={{ gap: cq(1.9), marginTop: cq(2.4) }}>
            {barras.map((b, i) => (
              <div key={b.etiqueta}>
                <div className="flex justify-between text-ink-2" style={{ fontSize: cq(1.2), gap: cq(1) }}>
                  <span>{b.etiqueta}</span>
                  <span className="font-mono font-medium text-ink">
                    <Numero valor={b.valor} retraso={450 + i * 120} duracion={900} />%
                  </span>
                </div>
                <Barra valor={b.valor} color={b.destacado ? P.color : '#9aa6b6'} alto={cq(1.3)} margen={cq(0.6)} retraso={450 + i * 120} />
              </div>
            ))}
          </div>
          <PuntoRecurso recurso="r-tecnica" etiqueta="Ver la técnica correcta" producto="respira" style={{ left: '58%', top: '31%' }} />
        </Aparece>
      </div>
    </Marco>
  )
}

/** Corte de bronquio: la luz se abre o se cierra con una transición continua */
function CorteBronquio({ abierto }: { abierto: boolean }) {
  const grupo: CSSProperties = { transformBox: 'fill-box', transformOrigin: 'center', transition: 'transform 900ms var(--ease-move)' }
  return (
    <svg viewBox="0 0 200 200" style={{ width: cq(22), height: cq(22) }} aria-hidden="true">
      <circle cx="100" cy="100" r="92" fill="#f4dfe0" />
      <circle cx="100" cy="100" r="92" fill="none" stroke="#d99aa0" strokeWidth="6" />
      <g style={{ ...grupo, transform: `scale(${abierto ? 1 : 0.62})` }}>
        <circle cx="100" cy="100" r="80" fill="none" stroke={abierto ? P.acento : '#c77a82'} strokeWidth={abierto ? 6 : 14} style={{ transition: 'stroke 600ms ease, stroke-width 600ms ease' }} />
      </g>
      <g style={{ ...grupo, transform: `scale(${abierto ? 1 : 0.46})` }}>
        <circle cx="100" cy="100" r="58" fill="#fff" />
      </g>
      {[0, 60, 120, 180, 240, 300].map((a, i) => (
        <circle
          key={a}
          cx={100 + Math.cos((a * Math.PI) / 180) * 66}
          cy={100 + Math.sin((a * Math.PI) / 180) * 66}
          r="5"
          fill={P.color}
          style={{ opacity: abierto ? 1 : 0, transition: `opacity 400ms ease ${abierto ? 450 + i * 60 : 0}ms` }}
        />
      ))}
    </svg>
  )
}

export function R3Mecanismo() {
  const { interactivo } = useDiapositiva()
  const animar = useAnimar()
  const [abierto, setAbierto] = useState(!animar)
  const tocado = useRef(false)

  // al entrar la pantalla se muestra el cambio: de bronquio cerrado a abierto
  useEffect(() => {
    if (!animar) return
    const t = window.setTimeout(() => {
      if (!tocado.current) setAbierto(true)
    }, 1300)
    return () => window.clearTimeout(t)
  }, [animar])

  const estados = [
    { valor: false, texto: 'Broncoconstricción' },
    { valor: true, texto: 'Tras la inhalación' },
  ]

  return (
    <Marco producto="respira" seccion="Mecanismo" numero={3}>
      <div className="grid h-full" style={{ gridTemplateColumns: '40% 1fr', gap: cq(4) }}>
        <div className="flex flex-col">
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.2), lineHeight: 1.12 }}>
              Relaja el músculo liso y <span style={{ color: P.color }}>abre la vía aérea</span>
            </h2>
          </Aparece>
          <Aparece retraso={150}>
            <p className="text-ink-2" style={{ fontSize: cq(1.45), lineHeight: 1.5, marginTop: cq(2) }}>
              Las micropartículas se depositan en los bronquios, activan los receptores β₂ y el músculo se relaja en minutos.
            </p>
          </Aparece>
          <Aparece retraso={300} className="mt-auto flex flex-wrap" style={{ gap: cq(1) }}>
            <BotonRecurso recurso="r-video" producto="respira">
              Ver animación
            </BotonRecurso>
            <BotonRecurso recurso="r-3d" producto="respira" tono="contorno">
              Árbol bronquial 3D
            </BotonRecurso>
          </Aparece>
        </div>
        <Aparece retraso={180} className="relative flex flex-col items-center justify-center rounded-[2.2cqw] bg-sunken" style={{ padding: cq(2), gap: cq(2.2) }}>
          <CorteBronquio abierto={abierto} />
          <div role="group" aria-label="Estado del bronquio" className="flex rounded-full bg-white" style={{ padding: cq(0.4), gap: cq(0.4) }}>
            {estados.map((e) => {
              const elegido = abierto === e.valor
              const estilo: CSSProperties = {
                fontSize: cq(1.3),
                padding: `${cq(0.8)} ${cq(1.7)}`,
                minHeight: 'max(36px, 4cqw)',
                background: elegido ? P.color : 'transparent',
                color: elegido ? '#fff' : '#334155',
                transition: 'background-color 250ms ease, color 250ms ease',
              }
              return interactivo ? (
                <button
                  key={e.texto}
                  type="button"
                  aria-pressed={elegido}
                  onClick={() => {
                    tocado.current = true
                    setAbierto(e.valor)
                  }}
                  className="press flex cursor-pointer items-center rounded-full font-semibold"
                  style={estilo}
                >
                  {e.texto}
                </button>
              ) : (
                <span key={e.texto} className="flex items-center rounded-full font-semibold" style={estilo}>
                  {e.texto}
                </span>
              )
            })}
          </div>
          <PuntoRecurso recurso="r-video" etiqueta="Ver cómo se abre el bronquio" producto="respira" style={{ left: '84%', top: '16%' }} />
        </Aparece>
      </div>
    </Marco>
  )
}

export function R4Tecnica() {
  const { interactivo } = useDiapositiva()
  const [activo, setActivo] = useState(2)
  const pasos = [
    { Icono: Vibrate, t: 'Agitar', d: '5 segundos antes de cada uso' },
    { Icono: Waves, t: 'Exhalar', d: 'Vaciar los pulmones, lejos de la boquilla' },
    { Icono: Wind, t: 'Inhalar', d: 'Lento y profundo mientras presiona' },
    { Icono: Timer, t: 'Sostener', d: 'Retener el aire 10 segundos' },
  ]
  return (
    <Marco producto="respira" seccion="Técnica" numero={4} referencias="Enjuagar la boca después de cada aplicación.">
      <div className="flex h-full flex-col">
        <Aparece>
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
            Cuatro pasos que <span style={{ color: P.color }}>definen el resultado</span>
          </h2>
        </Aparece>
        <ol className="grid flex-1 items-stretch" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: cq(1.6), marginTop: cq(3) }}>
          {pasos.map(({ Icono, t, d }, i) => {
            const elegido = activo === i
            const estilo: CSSProperties = {
              padding: cq(2.2),
              background: elegido ? P.tinte : '#fff',
              borderColor: elegido ? P.color : undefined,
              transition: 'background-color 250ms ease, border-color 250ms ease',
            }
            const contenido = (
              <>
                <span className="font-mono font-medium text-ink-3" style={{ fontSize: cq(1.2) }}>
                  Paso {i + 1}
                </span>
                <span
                  key={elegido ? 'activo' : 'reposo'}
                  className={`flex items-center justify-center rounded-full ${elegido && interactivo ? 'aparece-escala' : ''}`}
                  style={{ width: cq(6), height: cq(6), marginTop: cq(1.6), background: elegido ? P.color : P.tinte, color: elegido ? '#fff' : P.color }}
                >
                  <Icono style={{ width: '46%', height: '46%' }} strokeWidth={1.8} aria-hidden="true" />
                </span>
                <span className="font-semibold text-ink" style={{ fontSize: cq(2), marginTop: cq(1.8) }}>
                  {t}
                </span>
                <span className="text-ink-2" style={{ fontSize: cq(1.3), lineHeight: 1.45, marginTop: cq(0.6) }}>
                  {d}
                </span>
              </>
            )
            return (
              <li key={t} className="flex">
                <Aparece retraso={180 + i * 110} className="flex flex-1">
                  {interactivo ? (
                    <button type="button" aria-pressed={elegido} onClick={() => setActivo(i)} className="press flex flex-1 cursor-pointer flex-col items-start rounded-[1.8cqw] border border-line text-left" style={estilo}>
                      {contenido}
                    </button>
                  ) : (
                    <div className="flex flex-1 flex-col items-start rounded-[1.8cqw] border border-line" style={estilo}>
                      {contenido}
                    </div>
                  )}
                </Aparece>
              </li>
            )
          })}
        </ol>
        <Aparece retraso={650} style={{ marginTop: cq(2.4) }}>
          <BotonRecurso recurso="r-tecnica" producto="respira">
            Reproducir la técnica en video
          </BotonRecurso>
        </Aparece>
      </div>
    </Marco>
  )
}

export function R5Adherencia() {
  const r = recursos['r-adherencia']
  if (r.tipo !== 'grafico') return null
  return (
    <Marco producto="respira" seccion="Adherencia" numero={5} referencias="1. Estudio DEMO-ADH, 24 semanas, n = 860. Datos ilustrativos.">
      <div className="grid h-full" style={{ gridTemplateColumns: '34% 1fr', gap: cq(4) }}>
        <div className="flex flex-col">
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3), lineHeight: 1.12 }}>
              La técnica correcta <span style={{ color: P.color }}>se mantiene en el tiempo</span>
            </h2>
          </Aparece>
          <div className="mt-auto">
            <div className="font-mono font-medium" style={{ fontSize: cq(8.6), lineHeight: 0.9, color: P.color, letterSpacing: '-0.05em' }}>
              <Numero valor={82} retraso={300} />%
            </div>
            <Aparece retraso={450}>
              <p className="text-ink-2" style={{ fontSize: cq(1.45), lineHeight: 1.4, marginTop: cq(1) }}>
                vs. <span className="font-mono">49%</span> con el inhalador habitual¹
              </p>
              <div className="inline-flex items-center rounded-[1cqw] font-mono font-medium" style={{ marginTop: cq(1.6), padding: `${cq(0.5)} ${cq(1)}`, fontSize: cq(1.2), background: P.acento, color: P.sobreAcento }}>
                +33 puntos
              </div>
            </Aparece>
          </div>
          <Aparece retraso={600} style={{ marginTop: cq(2.6) }}>
            <BotonRecurso recurso="r-adherencia" producto="respira">
              Explorar semana a semana
            </BotonRecurso>
          </Aparece>
        </div>
        <div className="relative flex flex-col">
          <Aparece retraso={150} className="flex flex-wrap text-ink-2" style={{ gap: cq(2), fontSize: cq(1.15) }}>
            {r.series.map((s) => (
              <span key={s.nombre} className="inline-flex items-center" style={{ gap: cq(0.6) }}>
                <span className="rounded-full" style={{ width: cq(1.8), height: cq(0.4), background: s.color }} />
                {s.nombre}
              </span>
            ))}
          </Aparece>
          <div className="relative min-h-0 flex-1" style={{ marginTop: cq(1.2) }}>
            <LineasPieza semanas={r.semanas} series={r.series} unidad={r.unidad} destacar={3} />
            <PuntoRecurso recurso="r-adherencia" etiqueta="Ver dato de la semana 12" producto="respira" style={{ left: '52%', top: '22%' }} />
          </div>
        </div>
      </div>
    </Marco>
  )
}

export function R6Posologia() {
  return (
    <Marco producto="respira" seccion="Posología" numero={6} referencias="Consultar la ficha técnica completa antes de prescribir.">
      <div className="grid h-full" style={{ gridTemplateColumns: '1fr 1fr', gap: cq(5) }}>
        <div className="flex flex-col">
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
              2 inhalaciones <span style={{ color: P.color }}>cada 12 horas</span>
            </h2>
          </Aparece>
          <div className="flex items-center" style={{ gap: cq(2), marginTop: cq(3.4) }}>
            {['08:00', '20:00'].map((h, k) => (
              <Aparece key={h} retraso={180 + k * 140} className="flex-1 rounded-[1.8cqw] border border-line text-center" style={{ padding: cq(2.2) }}>
                <div className="font-mono font-medium text-ink" style={{ fontSize: cq(3.6) }}>
                  {h}
                </div>
                <div className="flex justify-center" style={{ gap: cq(0.8), marginTop: cq(1.2) }}>
                  {[0, 1].map((i) => (
                    <Aparece key={i} escala retraso={420 + k * 140 + i * 110} className="rounded-full" style={{ width: cq(2), height: cq(2), background: P.color }} />
                  ))}
                </div>
                <div className="text-ink-2" style={{ fontSize: cq(1.2), marginTop: cq(0.8) }}>
                  2 disparos
                </div>
              </Aparece>
            ))}
          </div>
          <Aparece retraso={600} className="mt-auto flex flex-wrap" style={{ gap: cq(1) }}>
            <BotonRecurso recurso="r-ficha" producto="respira">
              Abrir ficha técnica
            </BotonRecurso>
          </Aparece>
        </div>
        <ul className="flex flex-col justify-center" style={{ gap: cq(1.4) }}>
          {[
            'Dosis máxima: 8 inhalaciones por día.',
            'En adultos mayores o con poca fuerza, usar aerocámara.',
            'Enjuagar la boca después de cada uso.',
            'No suspender sin indicación médica.',
          ].map((t, i) => (
            <li key={t}>
              <Aparece retraso={260 + i * 110} className="flex items-start rounded-[1.4cqw] bg-sunken text-ink-2" style={{ gap: cq(1.2), padding: `${cq(1.5)} ${cq(1.8)}`, fontSize: cq(1.45), lineHeight: 1.4 }}>
                <span className="shrink-0 rounded-full" style={{ width: cq(1), height: cq(1), marginTop: cq(0.6), background: P.acento }} />
                {t}
              </Aparece>
            </li>
          ))}
        </ul>
      </div>
    </Marco>
  )
}
