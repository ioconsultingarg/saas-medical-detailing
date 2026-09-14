import { useMemo, useState } from 'react'
import { ArrowRight, Check, Clock, Link2, Lock, Mail, MessageCircle, Smartphone } from 'lucide-react'
import { productos } from '../data/productos'
import { diapositivaPorId } from '../data/presentaciones'
import { recursos } from '../data/recursos'
import { useDemo } from '../state/demo'
import type { ProductoId } from '../types'
import { SinVisita, Pasos } from './Registro'

type Canal = 'WhatsApp' | 'correo' | 'SMS'

const canales: { id: Canal; titulo: string; Icono: typeof Mail; color: string }[] = [
  { id: 'WhatsApp', titulo: 'WhatsApp', Icono: MessageCircle, color: '#128c4a' },
  { id: 'correo', titulo: 'Correo', Icono: Mail, color: '#0369a1' },
  { id: 'SMS', titulo: 'SMS', Icono: Smartphone, color: '#334155' },
]

function tratamiento(nombre: string) {
  const partes = nombre.split(' ')
  return `${partes[0]} ${partes[partes.length - 1]}`
}

export function Compartir() {
  const { estado, visitaActiva, online, despachar, avisar, apm } = useDemo()

  const opciones = useMemo(() => {
    if (!visitaActiva) return []
    const vistos = Object.keys(estado.tiempos)
      .map((d) => diapositivaPorId[d]?.productoId)
      .filter((p): p is ProductoId => Boolean(p))
    const prods: ProductoId[] = vistos.length ? [...new Set(vistos)] : visitaActiva.productosInteres
    const lista: { id: string; texto: string }[] = []
    for (const p of prods) lista.push({ id: `resumen-${p}`, texto: `Resumen de ${productos[p].marca}` })
    for (const r of estado.hotspotsVistos.map((id) => recursos[id]).filter(Boolean)) {
      if (r.tipo === 'estudio' || r.tipo === 'grafico') lista.push({ id: r.id, texto: r.titulo })
    }
    for (const p of prods) lista.push({ id: `ficha-${p}`, texto: `Ficha técnica de ${productos[p].marca}` })
    return lista
  }, [visitaActiva, estado.tiempos, estado.hotspotsVistos])

  const [elegidos, setElegidos] = useState<string[]>(() => opciones.map((o) => o.id))
  const [canal, setCanal] = useState<Canal>('WhatsApp')

  if (!visitaActiva) return <SinVisita />

  const saludo = tratamiento(visitaActiva.medico.nombre)
  const codigo = `${visitaActiva.id.toUpperCase()}${(visitaActiva.hora.replace(':', '') as string).slice(0, 3)}K9`
  const enlace = `https://ioconsultingarg.github.io/saas-medical-detailing/#/m/${codigo}`
  const items = opciones.filter((o) => elegidos.includes(o.id))
  const cuerpo = [
    `${saludo}, gracias por recibirme hoy.`,
    `Tal como conversamos, le comparto el material revisado:`,
    ...items.map((i) => `• ${i.texto}`),
    '',
    `Enlace seguro (vence en 48 h): ${enlace}`,
    '',
    `Quedo a disposición. ${apm.nombre} · ${apm.laboratorio}`,
  ].join('\n')
  const asunto = `Material de la visita · ${apm.laboratorio}`
  const tel = visitaActiva.medico.telefono.replace(/[^\d+]/g, '')
  const href =
    canal === 'WhatsApp'
      ? `https://wa.me/${tel.replace('+', '')}?text=${encodeURIComponent(cuerpo)}`
      : canal === 'correo'
        ? `mailto:${visitaActiva.medico.email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`
        : `sms:${tel}?&body=${encodeURIComponent(cuerpo)}`
  const yaEnviado = estado.enviados.includes(canal)
  const destino = canal === 'correo' ? visitaActiva.medico.email : visitaActiva.medico.telefono

  function registrar() {
    despachar({ tipo: 'envio', canal })
    avisar(online ? `Enviado por ${canal} a ${saludo}` : `Envío por ${canal} en cola · sale al recuperar conexión`, online ? 'ok' : 'warn')
  }

  return (
    <div className="pt-6 md:pt-8">
      <Pasos actual={1} />
      <h1 className="mt-4 text-[28px] leading-tight font-semibold text-ink md:text-[34px]">Compartí el material con {saludo}</h1>
      <p className="mt-2 max-w-[60ch] text-[15px] text-ink-3">El mensaje se arma con lo que viste en la visita. Revisalo antes de enviarlo.</p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-6">
          <fieldset>
            <legend className="mb-3 text-[16px] font-semibold text-ink">Enviar por</legend>
            <div className="grid grid-cols-3 gap-3">
              {canales.map(({ id, titulo, Icono, color }) => {
                const activo = canal === id
                return (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={activo}
                    onClick={() => setCanal(id)}
                    className={`press flex min-h-[104px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 bg-surface px-2 text-[15px] font-semibold ${activo ? 'border-ink text-ink' : 'border-line text-ink-2 hover:border-line-2'}`}
                  >
                    <span className="flex size-12 items-center justify-center rounded-full text-white" style={{ background: color }}>
                      <Icono size={22} aria-hidden="true" />
                    </span>
                    {titulo}
                    {estado.enviados.includes(id) && (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium text-ok">
                        <Check size={12} aria-hidden="true" />
                        Enviado
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-3 text-[16px] font-semibold text-ink">Material incluido</legend>
            <ul className="flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface">
              {opciones.map((o) => {
                const marcado = elegidos.includes(o.id)
                return (
                  <li key={o.id}>
                    <label className="flex min-h-12 cursor-pointer items-center gap-3 px-4 py-2.5 text-[15px] text-ink hover:bg-sunken">
                      <input
                        type="checkbox"
                        name="material"
                        checked={marcado}
                        onChange={() => setElegidos((e) => (marcado ? e.filter((x) => x !== o.id) : [...e, o.id]))}
                        className="size-5 cursor-pointer accent-ink"
                      />
                      {o.texto}
                    </label>
                  </li>
                )
              })}
            </ul>
          </fieldset>
        </div>

        <section aria-labelledby="titulo-vista" className="lg:sticky lg:top-24 lg:self-start">
          <h2 id="titulo-vista" className="mb-3 text-[16px] font-semibold text-ink">
            Vista previa
          </h2>
          <div className="card overflow-hidden">
            <div className="flex items-center gap-3 border-b border-line px-4 py-3">
              <span className="flex size-10 items-center justify-center rounded-full bg-sunken text-[14px] font-semibold text-ink-2" aria-hidden="true">
                {visitaActiva.medico.nombre.split(' ').slice(-2).map((p) => p[0]).join('')}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[15px] font-semibold text-ink">{visitaActiva.medico.nombre}</div>
                <div className="num truncate text-[12px] text-ink-3">{destino}</div>
              </div>
            </div>
            <div className="bg-sunken p-4">
              {canal === 'correo' && <p className="mb-2 text-[13px] text-ink-3">Asunto: <span className="text-ink">{asunto}</span></p>}
              <div className="ml-auto max-w-[92%] rounded-2xl rounded-tr-md bg-surface p-4 shadow-(--shadow-card)">
                <p className="text-[14px] leading-relaxed whitespace-pre-line text-ink">{cuerpo.split(`Enlace seguro`)[0].trimEnd()}</p>
                <div className="mt-3 flex items-center gap-3 rounded-xl border border-line p-3">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-ink text-white">
                    <Lock size={17} aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-semibold text-ink">Material de la visita · {items.length} documentos</div>
                    <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
                      <Link2 size={12} aria-hidden="true" />
                      <span className="truncate">Enlace seguro</span>
                      <Clock size={12} aria-hidden="true" />
                      vence en 48 h
                    </div>
                  </div>
                </div>
                <p className="mt-3 text-[14px] text-ink-2">Quedo a disposición. {apm.nombre} · {apm.laboratorio}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 p-4">
              {online ? (
                <a href={href} target="_blank" rel="noreferrer" onClick={registrar} className={`btn-primary flex-1 ${items.length === 0 ? 'pointer-events-none opacity-45' : ''}`} aria-disabled={items.length === 0}>
                  {yaEnviado ? 'Enviar de nuevo' : `Enviar por ${canal}`}
                </a>
              ) : (
                <button type="button" onClick={registrar} disabled={items.length === 0} className="btn-primary flex-1">
                  Guardar envío en cola
                </button>
              )}
            </div>
          </div>
          <p className="mt-2 text-[12px] text-ink-3">Contactos y enlace de demostración.</p>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap justify-end gap-2 border-t border-line pt-5">
        <a href="#/cierre/registro" className="btn-ghost">
          Omitir
        </a>
        <a href="#/cierre/registro" className="btn-primary">
          Continuar al registro
          <ArrowRight size={17} aria-hidden="true" />
        </a>
      </div>
    </div>
  )
}
