import { useState } from 'react'
import { MonogramaProducto } from '../components/ui'
import { productos } from '../data/productos'
import { recursos } from '../data/recursos'
import { Aparece, Barra, BotonRecurso, cq, LineasPieza, Marco, Numero, PuntoRecurso, useDiapositiva } from './SlideKit'

const P = productos.cardio

export function C1Portada() {
  return (
    <div className="absolute inset-0 grid" style={{ gridTemplateColumns: '57% 43%' }}>
      <div className="flex flex-col" style={{ padding: `${cq(4.2)} ${cq(4)} ${cq(3)} ${cq(5.2)}` }}>
        <Aparece className="flex items-center" style={{ gap: cq(1) }}>
          <span style={{ width: cq(2.6), height: cq(2.6) }}>
            <MonogramaProducto id="cardio" size={100} className="h-full w-full" />
          </span>
          <span className="font-semibold" style={{ fontSize: cq(1.5), color: P.color }} translate="no">
            {P.marca}
          </span>
        </Aparece>
        <div className="my-auto">
          <Aparece retraso={80} className="font-mono text-ink-3 uppercase" style={{ fontSize: cq(1.1), letterSpacing: '0.1em' }}>
            Línea cardiometabólica
          </Aparece>
          <Aparece retraso={160}>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(5.6), lineHeight: 1.02, marginTop: cq(1.4), letterSpacing: '-0.03em' }}>
              Menos LDL.
              <br />
              <span style={{ color: P.color }}>Más años de corazón.</span>
            </h2>
          </Aparece>
          <Aparece retraso={260}>
            <p className="text-ink-2" style={{ fontSize: cq(1.65), lineHeight: 1.45, marginTop: cq(2), maxWidth: '34ch' }}>
              Inhibidor de la síntesis hepática de colesterol para pacientes con riesgo cardiovascular alto y muy alto.
            </p>
          </Aparece>
          <Aparece retraso={360} className="flex flex-wrap" style={{ gap: cq(1), marginTop: cq(3) }}>
            <BotonRecurso recurso="c-3d" producto="cardio">
              Ver la arteria en 3D
            </BotonRecurso>
            <BotonRecurso recurso="c-ficha" producto="cardio" tono="contorno">
              Ficha técnica
            </BotonRecurso>
          </Aparece>
        </div>
        <div className="text-ink-3" style={{ fontSize: cq(0.98) }}>
          {P.detalle} · Venta bajo receta. Material de demostración.
        </div>
      </div>

      <div className="relative overflow-hidden" style={{ background: P.color }}>
        <Aparece escala retraso={120} className="absolute rounded-full" style={{ width: cq(34), height: cq(34), right: cq(-9), top: cq(-7), background: P.acento, opacity: 0.95 }} />
        <div aria-hidden="true" className="absolute rounded-full border-white/25" style={{ width: cq(46), height: cq(46), left: cq(-14), bottom: cq(-20), borderWidth: cq(0.25) }} />
        <div className="absolute text-white" style={{ left: cq(4), bottom: cq(5), right: cq(4) }}>
          <div className="font-mono font-medium" style={{ fontSize: cq(10.5), lineHeight: 0.9, letterSpacing: '-0.05em' }}>
            <Numero valor={52} retraso={350} />
            <span style={{ fontSize: cq(5) }}>%</span>
          </div>
          <Aparece retraso={600}>
            <p style={{ fontSize: cq(1.55), lineHeight: 1.35, marginTop: cq(1.2), maxWidth: '22ch', color: 'rgb(255 255 255 / 0.88)' }}>
              reducción media de LDL a 52 semanas con 20 mg¹
            </p>
            <p className="font-mono" style={{ fontSize: cq(0.95), marginTop: cq(1.6), color: 'rgb(255 255 255 / 0.6)' }}>
              1. Ensayo DEMO-201 · datos ilustrativos
            </p>
          </Aparece>
        </div>
      </div>
    </div>
  )
}

export function C2Desafio() {
  const r = recursos['c-epidemiologia']
  const barras = r.tipo === 'estudio' ? r.grafico.barras : []
  return (
    <Marco producto="cardio" seccion="El desafío" numero={2} referencias="1. Registro DEMO-LDL, 14 centros, n = 3.420. Datos ilustrativos.">
      <div className="grid h-full items-center" style={{ gridTemplateColumns: '1fr 1fr', gap: cq(5) }}>
        <div>
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
              6 de cada 10 pacientes de alto riesgo <span style={{ color: P.color }}>no llegan a su meta de LDL</span>
            </h2>
          </Aparece>
          <Aparece retraso={150} className="flex items-end" style={{ gap: cq(1.6), marginTop: cq(3.4) }}>
            <span className="font-mono font-medium" style={{ fontSize: cq(9), lineHeight: 0.85, color: P.color, letterSpacing: '-0.05em' }}>
              <Numero valor={61} retraso={250} />%
            </span>
            <span className="text-ink-2" style={{ fontSize: cq(1.5), lineHeight: 1.35, maxWidth: '18ch', paddingBottom: cq(0.6) }}>
              fuera de meta con su tratamiento actual¹
            </span>
          </Aparece>
          <Aparece retraso={300} style={{ marginTop: cq(3.4) }}>
            <BotonRecurso recurso="c-epidemiologia" producto="cardio">
              Ver el registro completo
            </BotonRecurso>
          </Aparece>
        </div>

        <Aparece retraso={200} className="relative rounded-[2.2cqw] bg-sunken" style={{ padding: cq(3) }}>
          <div className="font-semibold text-ink" style={{ fontSize: cq(1.5) }}>
            Pacientes en meta según riesgo
          </div>
          <div className="flex flex-col" style={{ gap: cq(2.2), marginTop: cq(2.6) }}>
            {barras.map((b, i) => (
              <div key={b.etiqueta}>
                <div className="flex justify-between text-ink-2" style={{ fontSize: cq(1.25) }}>
                  <span>{b.etiqueta}</span>
                  <span className="font-mono font-medium text-ink">
                    <Numero valor={b.valor} retraso={450 + i * 130} duracion={900} />%
                  </span>
                </div>
                <Barra valor={b.valor} color={b.destacado ? P.color : '#9aa6b6'} alto={cq(1.5)} margen={cq(0.7)} retraso={450 + i * 130} />
              </div>
            ))}
          </div>
          <PuntoRecurso recurso="c-epidemiologia" etiqueta="Detalle del riesgo muy alto" producto="cardio" style={{ left: '28%', top: '84%' }} />
        </Aparece>
      </div>
    </Marco>
  )
}

export function C3Mecanismo() {
  const { interactivo } = useDiapositiva()
  const [activo, setActivo] = useState<number | null>(null)
  const pasos = [
    { n: 1, t: 'Inhibe la síntesis', d: 'Bloquea la enzima clave de la producción hepática de colesterol.', extra: 'El hepatocito fabrica menos colesterol propio.' },
    { n: 2, t: 'Más receptores', d: 'El hepatocito expone más receptores de LDL en su superficie.', extra: 'Para compensar, capta más LDL desde la sangre.' },
    { n: 3, t: 'Menos LDL en sangre', d: 'Aumenta la captación y baja el LDL circulante.', extra: '−52% de LDL a 52 semanas en DEMO-201.' },
  ]
  const progreso = activo === null ? 1 : activo / (pasos.length - 1)
  const tramo = `((100% - ${cq(4.8)}) * 2 / 3 + ${cq(4.8)})`

  return (
    <Marco producto="cardio" seccion="Mecanismo" numero={3}>
      <div className="flex h-full flex-col">
        <Aparece>
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12, maxWidth: '26ch' }}>
            Actúa donde nace el problema: <span style={{ color: P.color }}>en el hígado</span>
          </h2>
        </Aparece>
        <div className="flex flex-1 items-center" style={{ marginTop: cq(2) }}>
          <ol className="relative grid w-full items-start" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: cq(2.4) }}>
            <div aria-hidden="true" className="absolute" style={{ left: cq(3.5), top: cq(3.38), width: `calc${tramo}`, height: cq(0.25), background: `repeating-linear-gradient(90deg, ${P.color} 0 ${cq(1)}, transparent ${cq(1)} ${cq(1.8)})` }} />
            <div
              aria-hidden="true"
              className="absolute rounded-full"
              style={{ left: cq(3.5), top: cq(3.25), width: `calc(${tramo} * ${progreso})`, height: cq(0.5), background: P.color, transition: 'width 500ms var(--ease-fluid)' }}
            />
            {pasos.map((p, i) => {
              const elegido = activo === i
              const atenuado = activo !== null && !elegido
              const contenido = (
                <>
                  <span
                    className="relative flex items-center justify-center rounded-full font-mono font-medium"
                    style={{
                      width: cq(7),
                      height: cq(7),
                      fontSize: cq(2.6),
                      background: p.n === 3 ? P.acento : P.color,
                      color: p.n === 3 ? P.sobreAcento : '#fff',
                      boxShadow: `0 0 0 ${cq(0.8)} #fff${elegido ? `, 0 0 0 ${cq(1.3)} ${P.color}` : ''}`,
                      transform: elegido ? 'scale(1.06)' : undefined,
                      transition: 'transform 250ms var(--ease-fluid), box-shadow 250ms ease',
                    }}
                  >
                    {p.n}
                  </span>
                  <span className="font-semibold text-ink" style={{ fontSize: cq(1.9), marginTop: cq(2) }}>
                    {p.t}
                  </span>
                  <span className="text-ink-2" style={{ fontSize: cq(1.35), lineHeight: 1.45, marginTop: cq(0.8), maxWidth: '24ch' }}>
                    {p.d}
                  </span>
                  <span
                    className="font-semibold"
                    style={{ fontSize: cq(1.3), lineHeight: 1.4, marginTop: cq(1), maxWidth: '24ch', color: P.colorOscuro, opacity: elegido ? 1 : 0, transition: 'opacity 250ms ease' }}
                  >
                    {p.extra}
                  </span>
                </>
              )
              return (
                <li key={p.n}>
                  <Aparece retraso={220 + i * 150}>
                    {interactivo ? (
                      <button
                        type="button"
                        aria-pressed={elegido}
                        onClick={() => setActivo(elegido ? null : i)}
                        className="press flex w-full cursor-pointer flex-col items-start rounded-[1.4cqw] text-left"
                        style={{ opacity: atenuado ? 0.45 : 1, transition: 'opacity 250ms ease' }}
                      >
                        {contenido}
                      </button>
                    ) : (
                      <div className="flex flex-col items-start">{contenido}</div>
                    )}
                  </Aparece>
                </li>
              )
            })}
          </ol>
        </div>
        <Aparece retraso={700} className="flex flex-wrap items-center" style={{ gap: cq(1) }}>
          <BotonRecurso recurso="c-video" producto="cardio">
            Ver animación del mecanismo
          </BotonRecurso>
          <BotonRecurso recurso="c-3d" producto="cardio" tono="contorno">
            Explorar arteria en 3D
          </BotonRecurso>
          {interactivo && (
            <span className="ml-auto text-ink-3" style={{ fontSize: cq(1.1) }}>
              Tocá cada paso para detallarlo
            </span>
          )}
        </Aparece>
      </div>
    </Marco>
  )
}

export function C4Eficacia() {
  const r = recursos['c-eficacia']
  if (r.tipo !== 'grafico') return null
  return (
    <Marco producto="cardio" seccion="Eficacia" numero={4} referencias="1. Ensayo DEMO-201, doble ciego, 52 semanas, n = 2.140. Datos ilustrativos.">
      <div className="grid h-full" style={{ gridTemplateColumns: '34% 1fr', gap: cq(4) }}>
        <div className="flex flex-col">
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3), lineHeight: 1.12 }}>
              Reducción de LDL <span style={{ color: P.color }}>sostenida hasta la semana 52</span>
            </h2>
          </Aparece>
          <div className="mt-auto">
            <div className="font-mono font-medium" style={{ fontSize: cq(8.6), lineHeight: 0.9, color: P.color, letterSpacing: '-0.05em' }}>
              −<Numero valor={52} retraso={300} />%
            </div>
            <Aparece retraso={450}>
              <p className="text-ink-2" style={{ fontSize: cq(1.45), lineHeight: 1.4, marginTop: cq(1) }}>
                vs. <span className="font-mono">−3%</span> con placebo¹
              </p>
              <div className="inline-flex items-center rounded-[1cqw] font-mono font-medium" style={{ marginTop: cq(1.6), padding: `${cq(0.5)} ${cq(1)}`, fontSize: cq(1.2), background: P.acento, color: P.sobreAcento }}>
                p &lt; 0,001
              </div>
            </Aparece>
          </div>
          <Aparece retraso={600} style={{ marginTop: cq(2.6) }}>
            <BotonRecurso recurso="c-eficacia" producto="cardio">
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
            <LineasPieza semanas={r.semanas} series={r.series} unidad={r.unidad} destacar={4} />
            <PuntoRecurso recurso="c-eficacia" etiqueta="Ver dato de la semana 12" producto="cardio" style={{ left: '61.5%', top: '17%' }} />
          </div>
        </div>
      </div>
    </Marco>
  )
}

export function C5Seguridad() {
  const r = recursos['c-seguridad']
  if (r.tipo !== 'estudio') return null
  return (
    <Marco producto="cardio" seccion="Seguridad" numero={5} referencias="1. Análisis agrupado de 4 ensayos, n = 5.180. Datos ilustrativos.">
      <div className="grid h-full items-start" style={{ gridTemplateColumns: '1fr 1fr', gap: cq(5) }}>
        <div className="flex h-full flex-col">
          <Aparece>
            <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.2), lineHeight: 1.12 }}>
              Perfil de seguridad <span style={{ color: P.color }}>comparable a placebo</span>
            </h2>
          </Aparece>
          <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: cq(1.6), marginTop: cq(3) }}>
            {[
              { v: 2.1, t: 'Demo-molécula', d: true },
              { v: 1.8, t: 'Placebo', d: false },
            ].map((x, i) => (
              <Aparece key={x.t} retraso={180 + i * 120} className="rounded-[1.6cqw] border border-line" style={{ padding: cq(2) }}>
                <div className="font-mono font-medium" style={{ fontSize: cq(4.4), color: x.d ? P.color : '#56617a', lineHeight: 1 }}>
                  <Numero valor={x.v} decimales={1} retraso={300 + i * 120} />%
                </div>
                <div className="text-ink-2" style={{ fontSize: cq(1.25), marginTop: cq(0.8) }}>
                  discontinuó por eventos adversos · {x.t}
                </div>
              </Aparece>
            ))}
          </div>
          <Aparece retraso={500} className="mt-auto rounded-[1.4cqw] bg-warn-soft text-ink-2" style={{ padding: `${cq(1.4)} ${cq(1.8)}`, fontSize: cq(1.25), lineHeight: 1.45 }}>
            <strong className="text-warn">Precaución:</strong> controlar CK ante mialgias persistentes. Ver ficha técnica.
          </Aparece>
        </div>
        <Aparece retraso={220} className="rounded-[2.2cqw] bg-sunken" style={{ padding: cq(3) }}>
          <div className="font-semibold text-ink" style={{ fontSize: cq(1.5) }}>
            {r.grafico.titulo}
          </div>
          <div className="flex flex-col" style={{ gap: cq(2), marginTop: cq(2.4) }}>
            {r.grafico.barras.map((b, i) => (
              <div key={b.etiqueta}>
                <div className="flex justify-between text-ink-2" style={{ fontSize: cq(1.25) }}>
                  <span>{b.etiqueta}</span>
                  <span className="font-mono font-medium text-ink">
                    <Numero valor={b.valor} decimales={1} retraso={450 + i * 110} duracion={900} />%
                  </span>
                </div>
                <Barra valor={b.valor} max={5} color={b.destacado ? P.color : '#9aa6b6'} alto={cq(1.3)} margen={cq(0.7)} retraso={450 + i * 110} />
              </div>
            ))}
          </div>
          <div style={{ marginTop: cq(2.8) }}>
            <BotonRecurso recurso="c-seguridad" producto="cardio" tono="claro">
              Ver análisis de seguridad
            </BotonRecurso>
          </div>
        </Aparece>
      </div>
    </Marco>
  )
}

export function C6Posologia() {
  const { interactivo } = useDiapositiva()
  const [fila, setFila] = useState(1)
  const filas = [
    { etapa: 'Inicio', dosis: '10 mg', detalle: 'Una vez al día, por la noche' },
    { etapa: 'Mantenimiento', dosis: '20 mg', detalle: 'Titular a las 4 semanas según LDL' },
    { etapa: 'Insuficiencia renal grave', dosis: '10 mg', detalle: 'Dosis máxima con depuración < 30 ml/min' },
  ]
  return (
    <Marco producto="cardio" seccion="Posología" numero={6} referencias="Consultar la ficha técnica completa antes de prescribir.">
      <div className="flex h-full flex-col">
        <Aparece>
          <h2 className="font-semibold text-ink" style={{ fontSize: cq(3.3), lineHeight: 1.12 }}>
            Una toma diaria, <span style={{ color: P.color }}>con o sin alimentos</span>
          </h2>
        </Aparece>
        <div className="overflow-hidden rounded-[1.8cqw] border border-line" style={{ marginTop: cq(3) }}>
          {filas.map((f, i) => {
            const elegida = fila === i
            const estilo = { gridTemplateColumns: '32% 16% 1fr', padding: `${cq(1.8)} ${cq(2.4)}`, background: elegida ? P.tinte : '#fff', transition: 'background-color 250ms ease' }
            const celdas = (
              <>
                <span className="font-semibold text-ink" style={{ fontSize: cq(1.6) }}>
                  {f.etapa}
                </span>
                <span className="font-mono font-medium" style={{ fontSize: cq(2.6), color: P.color }}>
                  {f.dosis}
                </span>
                <span className="text-ink-2" style={{ fontSize: cq(1.4) }}>
                  {f.detalle}
                </span>
              </>
            )
            return (
              <Aparece key={f.etapa} retraso={200 + i * 130} className={i > 0 ? 'border-t border-line' : ''}>
                {interactivo ? (
                  <button type="button" aria-pressed={elegida} onClick={() => setFila(i)} className="grid w-full cursor-pointer items-center text-left" style={estilo}>
                    {celdas}
                  </button>
                ) : (
                  <div className="grid items-center" style={estilo}>
                    {celdas}
                  </div>
                )}
              </Aparece>
            )
          })}
        </div>
        <Aparece retraso={650} className="mt-auto flex flex-wrap" style={{ gap: cq(1) }}>
          <BotonRecurso recurso="c-renal" producto="cardio">
            Ajuste en insuficiencia renal
          </BotonRecurso>
          <BotonRecurso recurso="c-ficha" producto="cardio" tono="contorno">
            Abrir ficha técnica
          </BotonRecurso>
        </Aparece>
      </div>
    </Marco>
  )
}
