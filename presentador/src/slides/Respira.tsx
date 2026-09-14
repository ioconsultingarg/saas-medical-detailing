import { Timer, Vibrate, Wind, Waves } from 'lucide-react'
import { MonogramaProducto } from '../components/ui'
import { productos } from '../data/productos'
import { recursos } from '../data/recursos'
import { BotonRecurso, cq, LineasPieza, Marco, PuntoRecurso } from './SlideKit'

const P = productos.respira

export function R1Portada() {
  return (
    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '57% 43%' }}>
      <div className="flex flex-col" style={{ padding: `${cq(4.2)} ${cq(4)} ${cq(3)} ${cq(5.2)}` }}>
        <div className="flex items-center" style={{ gap: cq(1) }} translate="no">
          <span style={{ width: cq(2.6), height: cq(2.6) }}>
            <MonogramaProducto id="respira" size={100} className="h-full w-full" />
          </span>
          <span className="font-semibold" style={{ fontSize: cq(1.5), color: P.color }}>
            {P.marca}
          </span>
        </div>
        <div className="my-auto">
          <div className="font-mono text-ink-3 uppercase" style={{ fontSize: cq(1.1), letterSpacing: '0.1em' }}>
            Línea respiratoria
          </div>
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(5.6), lineHeight: 1.02, marginTop: cq(1.4), letterSpacing: '-0.03em' }}>
            Aire donde se necesita.
            <br />
            <span style={{ color: P.color }}>Desde la primera dosis.</span>
          </h2>
          <p className="text-ink-2" style={{ fontSize: cq(1.65), lineHeight: 1.45, marginTop: cq(2), maxWidth: '34ch' }}>
            Broncodilatador inhalado para el control sostenido de síntomas en EPOC y asma.
          </p>
          <div className="flex flex-wrap" style={{ gap: cq(1), marginTop: cq(3) }}>
            <BotonRecurso recurso="r-tecnica" producto="respira">
              Técnica paso a paso
            </BotonRecurso>
            <BotonRecurso recurso="r-3d" producto="respira" tono="contorno">
              Bronquios en 3D
            </BotonRecurso>
          </div>
        </div>
        <div className="text-ink-3" style={{ fontSize: cq(0.98) }}>
          {P.detalle} · Venta bajo receta. Material de demostración.
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ background: P.color }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            aria-hidden="true"
            className="absolute rounded-full"
            style={{ width: cq(22 + i * 12), height: cq(22 + i * 12), right: cq(-6 - i * 6), top: cq(-6 - i * 6), border: `${cq(0.22)} solid rgb(255 255 255 / ${0.28 - i * 0.06})` }}
          />
        ))}
        <div aria-hidden="true" className="absolute rounded-full" style={{ width: cq(9), height: cq(9), right: cq(5), top: cq(5), background: P.acento }} />
        <div className="absolute text-white" style={{ left: cq(4), bottom: cq(5), right: cq(4) }}>
          <div className="font-mono font-medium" style={{ fontSize: cq(10.5), lineHeight: 0.9, letterSpacing: '-0.05em' }}>
            82<span style={{ fontSize: cq(5) }}>%</span>
          </div>
          <p style={{ fontSize: cq(1.55), lineHeight: 1.35, marginTop: cq(1.2), maxWidth: '22ch', color: 'rgb(255 255 255 / 0.88)' }}>
            mantiene la técnica correcta a las 24 semanas¹
          </p>
          <p className="font-mono" style={{ fontSize: cq(0.95), marginTop: cq(1.6), color: 'rgb(255 255 255 / 0.6)' }}>
            1. Estudio DEMO-ADH · datos ilustrativos
          </p>
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
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
            Casi la mitad de los pacientes con EPOC <span style={{ color: P.color }}>tiene síntomas todos los días</span>
          </h2>
          <div className="flex items-end" style={{ gap: cq(1.6), marginTop: cq(3.4) }}>
            <span className="font-mono font-medium" style={{ fontSize: cq(9), lineHeight: 0.85, color: P.color, letterSpacing: '-0.05em' }}>
              48%
            </span>
            <span className="text-ink-2" style={{ fontSize: cq(1.5), lineHeight: 1.35, maxWidth: '18ch', paddingBottom: cq(0.6) }}>
              con síntomas diarios pese al tratamiento¹
            </span>
          </div>
          <div style={{ marginTop: cq(3.4) }}>
            <BotonRecurso recurso="r-impacto" producto="respira">
              Ver la encuesta completa
            </BotonRecurso>
          </div>
        </div>
        <div className="relative rounded-[2.2cqw] bg-sunken" style={{ padding: cq(3) }}>
          <div className="font-semibold text-ink" style={{ fontSize: cq(1.5) }}>
            2 de cada 3 cometen errores de técnica
          </div>
          <div className="flex flex-col" style={{ gap: cq(1.9), marginTop: cq(2.4) }}>
            {barras.map((b) => (
              <div key={b.etiqueta}>
                <div className="flex justify-between text-ink-2" style={{ fontSize: cq(1.2), gap: cq(1) }}>
                  <span>{b.etiqueta}</span>
                  <span className="font-mono font-medium text-ink">{b.valor}%</span>
                </div>
                <div className="overflow-hidden rounded-full bg-white" style={{ height: cq(1.3), marginTop: cq(0.6) }}>
                  <div className="h-full rounded-full" style={{ width: `${b.valor}%`, background: b.destacado ? P.color : '#9aa6b6' }} />
                </div>
              </div>
            ))}
          </div>
          <PuntoRecurso recurso="r-tecnica" etiqueta="Ver la técnica correcta" producto="respira" style={{ left: '58%', top: '31%' }} />
        </div>
      </div>
    </Marco>
  )
}

function CorteBronquio({ luz, etiqueta, activo }: { luz: number; etiqueta: string; activo: boolean }) {
  return (
    <figure className="flex flex-col items-center">
      <svg viewBox="0 0 200 200" style={{ width: cq(19), height: cq(19) }} aria-hidden="true">
        <circle cx="100" cy="100" r="92" fill="#f4dfe0" />
        <circle cx="100" cy="100" r="92" fill="none" stroke="#d99aa0" strokeWidth="6" />
        <circle cx="100" cy="100" r={luz + 22} fill="none" stroke={activo ? P.acento : '#c77a82'} strokeWidth={activo ? 6 : 16} strokeDasharray={activo ? '0' : '10 6'} />
        <circle cx="100" cy="100" r={luz} fill="#fff" />
        {activo &&
          [0, 60, 120, 180, 240, 300].map((a) => (
            <circle key={a} cx={100 + Math.cos((a * Math.PI) / 180) * (luz + 8)} cy={100 + Math.sin((a * Math.PI) / 180) * (luz + 8)} r="5" fill={P.color} />
          ))}
      </svg>
      <figcaption className="font-semibold text-ink" style={{ fontSize: cq(1.45), marginTop: cq(1.2) }}>
        {etiqueta}
      </figcaption>
    </figure>
  )
}

export function R3Mecanismo() {
  return (
    <Marco producto="respira" seccion="Mecanismo" numero={3}>
      <div className="grid h-full" style={{ gridTemplateColumns: '40% 1fr', gap: cq(4) }}>
        <div className="flex flex-col">
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.2), lineHeight: 1.12 }}>
            Relaja el músculo liso y <span style={{ color: P.color }}>abre la vía aérea</span>
          </h2>
          <p className="text-ink-2" style={{ fontSize: cq(1.45), lineHeight: 1.5, marginTop: cq(2) }}>
            Las micropartículas se depositan en los bronquios, activan los receptores β₂ y el músculo se relaja en minutos.
          </p>
          <div className="mt-auto flex flex-wrap" style={{ gap: cq(1) }}>
            <BotonRecurso recurso="r-video" producto="respira">
              Ver animación
            </BotonRecurso>
            <BotonRecurso recurso="r-3d" producto="respira" tono="contorno">
              Árbol bronquial 3D
            </BotonRecurso>
          </div>
        </div>
        <div className="relative flex items-center justify-around rounded-[2.2cqw] bg-sunken" style={{ padding: cq(2) }}>
          <CorteBronquio luz={26} etiqueta="Broncoconstricción" activo={false} />
          <svg viewBox="0 0 60 20" style={{ width: cq(6) }} aria-hidden="true">
            <path d="M2 10h50m-10-8 10 8-10 8" stroke={P.color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <CorteBronquio luz={58} etiqueta="Tras la inhalación" activo />
          <PuntoRecurso recurso="r-video" etiqueta="Ver cómo se abre el bronquio" producto="respira" style={{ left: '76%', top: '42%' }} />
        </div>
      </div>
    </Marco>
  )
}

export function R4Tecnica() {
  const pasos = [
    { Icono: Vibrate, t: 'Agitar', d: '5 segundos antes de cada uso' },
    { Icono: Waves, t: 'Exhalar', d: 'Vaciar los pulmones, lejos de la boquilla' },
    { Icono: Wind, t: 'Inhalar', d: 'Lento y profundo mientras presiona' },
    { Icono: Timer, t: 'Sostener', d: 'Retener el aire 10 segundos' },
  ]
  return (
    <Marco producto="respira" seccion="Técnica" numero={4} referencias="Enjuagar la boca después de cada aplicación.">
      <div className="flex h-full flex-col">
        <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
          Cuatro pasos que <span style={{ color: P.color }}>definen el resultado</span>
        </h2>
        <ol className="grid flex-1 items-stretch" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: cq(1.6), marginTop: cq(3) }}>
          {pasos.map(({ Icono, t, d }, i) => (
            <li key={t} className="flex flex-col rounded-[1.8cqw] border border-line" style={{ padding: cq(2.2), background: i === 2 ? P.tinte : '#fff' }}>
              <span className="font-mono font-medium text-ink-3" style={{ fontSize: cq(1.2) }}>
                Paso {i + 1}
              </span>
              <span className="flex items-center justify-center rounded-full" style={{ width: cq(6), height: cq(6), marginTop: cq(1.6), background: i === 2 ? P.color : P.tinte, color: i === 2 ? '#fff' : P.color }}>
                <Icono style={{ width: '46%', height: '46%' }} strokeWidth={1.8} aria-hidden="true" />
              </span>
              <span className="font-semibold text-ink" style={{ fontSize: cq(2), marginTop: cq(1.8) }}>
                {t}
              </span>
              <span className="text-ink-2" style={{ fontSize: cq(1.3), lineHeight: 1.45, marginTop: cq(0.6) }}>
                {d}
              </span>
            </li>
          ))}
        </ol>
        <div style={{ marginTop: cq(2.4) }}>
          <BotonRecurso recurso="r-tecnica" producto="respira">
            Reproducir la técnica en video
          </BotonRecurso>
        </div>
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
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3), lineHeight: 1.12 }}>
            La técnica correcta <span style={{ color: P.color }}>se mantiene en el tiempo</span>
          </h2>
          <div className="mt-auto">
            <div className="font-mono font-medium" style={{ fontSize: cq(8.6), lineHeight: 0.9, color: P.color, letterSpacing: '-0.05em' }}>
              82%
            </div>
            <p className="text-ink-2" style={{ fontSize: cq(1.45), lineHeight: 1.4, marginTop: cq(1) }}>
              vs. <span className="font-mono">49%</span> con el inhalador habitual¹
            </p>
            <div className="inline-flex items-center rounded-[1cqw] font-mono font-medium" style={{ marginTop: cq(1.6), padding: `${cq(0.5)} ${cq(1)}`, fontSize: cq(1.2), background: P.acento, color: P.sobreAcento }}>
              +33 puntos
            </div>
          </div>
          <div style={{ marginTop: cq(2.6) }}>
            <BotonRecurso recurso="r-adherencia" producto="respira">
              Explorar semana a semana
            </BotonRecurso>
          </div>
        </div>
        <div className="relative flex flex-col">
          <div className="flex flex-wrap text-ink-2" style={{ gap: cq(2), fontSize: cq(1.15) }}>
            {r.series.map((s) => (
              <span key={s.nombre} className="inline-flex items-center" style={{ gap: cq(0.6) }}>
                <span className="rounded-full" style={{ width: cq(1.8), height: cq(0.4), background: s.color }} />
                {s.nombre}
              </span>
            ))}
          </div>
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
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
            2 inhalaciones <span style={{ color: P.color }}>cada 12 horas</span>
          </h2>
          <div className="flex items-center" style={{ gap: cq(2), marginTop: cq(3.4) }}>
            {['08:00', '20:00'].map((h) => (
              <div key={h} className="flex-1 rounded-[1.8cqw] border border-line text-center" style={{ padding: cq(2.2) }}>
                <div className="font-mono font-medium text-ink" style={{ fontSize: cq(3.6) }}>
                  {h}
                </div>
                <div className="flex justify-center" style={{ gap: cq(0.8), marginTop: cq(1.2) }}>
                  {[0, 1].map((i) => (
                    <span key={i} className="rounded-full" style={{ width: cq(2), height: cq(2), background: P.color }} />
                  ))}
                </div>
                <div className="text-ink-2" style={{ fontSize: cq(1.2), marginTop: cq(0.8) }}>
                  2 disparos
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto flex flex-wrap" style={{ gap: cq(1) }}>
            <BotonRecurso recurso="r-ficha" producto="respira">
              Abrir ficha técnica
            </BotonRecurso>
          </div>
        </div>
        <ul className="flex flex-col justify-center" style={{ gap: cq(1.4) }}>
          {[
            'Dosis máxima: 8 inhalaciones por día.',
            'En adultos mayores o con poca fuerza, usar aerocámara.',
            'Enjuagar la boca después de cada uso.',
            'No suspender sin indicación médica.',
          ].map((t) => (
            <li key={t} className="flex items-start rounded-[1.4cqw] bg-sunken text-ink-2" style={{ gap: cq(1.2), padding: `${cq(1.5)} ${cq(1.8)}`, fontSize: cq(1.45), lineHeight: 1.4 }}>
              <span className="shrink-0 rounded-full" style={{ width: cq(1), height: cq(1), marginTop: cq(0.6), background: P.acento }} />
              {t}
            </li>
          ))}
        </ul>
      </div>
    </Marco>
  )
}
