import { useEffect, useState } from 'react'
import { AudioLines, CalendarPlus, CheckCircle2, CloudOff, Database, FileText, LogIn, LogOut, Package, PenLine, RefreshCw, RotateCcw, Send, ShieldAlert, Wifi } from 'lucide-react'
import { operacionOutbox } from '../lib/api'
import { EncabezadoPantalla } from '../components/ui'
import { presentacionesOficiales } from '../data/presentaciones'
import { hace, hora } from '../lib/formato'
import { useAhora } from '../lib/tiempo'
import { useAcademia } from '../state/academia'
import { useDemo } from '../state/demo'
import type { TipoOutbox } from '../types'

const iconos: Record<TipoOutbox, typeof LogIn> = {
  checkin: LogIn,
  checkout: LogOut,
  pedido: Package,
  envio: Send,
  firma: PenLine,
  voz: AudioLines,
  farmacovigilancia: ShieldAlert,
  plan: CalendarPlus,
}

export function Actividad() {
  const { estado, online, pendientes, despachar, avisar } = useDemo()
  const { reiniciar: reiniciarAcademia } = useAcademia()
  const ahora = useAhora(10000)
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!confirmando) return
    const t = window.setTimeout(() => setConfirmando(false), 4000)
    return () => window.clearTimeout(t)
  }, [confirmando])

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Offline first"
        titulo="Actividad y sincronización"
        descripcion="Todo lo que hacés en la calle queda guardado en la tablet y se envía solo cuando vuelve la conexión."
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section aria-labelledby="titulo-cola" className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 id="titulo-cola" className="text-[16px] font-semibold text-ink">
              Registro de hoy
            </h2>
            <button type="button" className="btn-secondary" disabled={!online || pendientes === 0} onClick={() => despachar({ tipo: 'sincronizar' })}>
              <RefreshCw size={16} aria-hidden="true" />
              Sincronizar ahora
            </button>
          </div>
          {estado.outbox.length === 0 ? (
            <p className="px-5 py-12 text-center text-[14px] text-ink-3">Todavía no hay movimientos. Hacé check-in en tu próxima visita.</p>
          ) : (
            <ol className="divide-y divide-line">
              {estado.outbox.map((o) => {
                const Icono = iconos[o.tipo]
                return (
                  <li key={o.id} className="flex items-center gap-3 px-5 py-3.5">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sunken text-ink-2">
                      <Icono size={17} aria-hidden="true" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[15px] font-medium text-ink">{o.resumen}</div>
                      <div className="flex min-w-0 flex-wrap items-center gap-x-2 text-[12px] text-ink-3">
                        <span className="num">{hora(o.creado)}</span>
                        <span className="num truncate" translate="no">
                          {operacionOutbox[o.tipo].metodo} {operacionOutbox[o.tipo].ruta}
                        </span>
                      </div>
                    </div>
                    {o.sincronizado ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap text-ok">
                        <CheckCircle2 size={14} aria-hidden="true" />
                        Enviado {hace(o.sincronizado, ahora)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[12px] font-medium whitespace-nowrap text-warn">
                        {online ? <RefreshCw size={13} aria-hidden="true" className="spinner" /> : <CloudOff size={14} aria-hidden="true" />}
                        {online ? 'Enviando…' : 'En cola'}
                      </span>
                    )}
                  </li>
                )
              })}
            </ol>
          )}
        </section>

        <aside className="flex flex-col gap-4">
          <section aria-labelledby="titulo-conexion" className="card p-5">
            <div className="flex items-center gap-3">
              <span className={`flex size-11 items-center justify-center rounded-full ${online ? 'bg-ok-soft text-ok' : 'bg-warn-soft text-warn'}`}>
                {online ? <Wifi size={20} aria-hidden="true" /> : <CloudOff size={20} aria-hidden="true" />}
              </span>
              <div>
                <h2 id="titulo-conexion" className="text-[16px] font-semibold text-ink">
                  {online ? 'Con conexión' : 'Sin conexión'}
                </h2>
                <p className="text-[13px] text-ink-3">
                  <span className="num">{pendientes}</span> {pendientes === 1 ? 'movimiento pendiente' : 'movimientos pendientes'}
                </p>
              </div>
            </div>
            <label className="mt-5 flex min-h-11 cursor-pointer items-center justify-between gap-4 rounded-xl bg-sunken px-4 py-3">
              <span>
                <span className="block text-[14px] font-medium text-ink">Simular sin conexión</span>
                <span className="block text-[12px] text-ink-3">Para mostrar en la demo cómo trabaja en un consultorio sin señal.</span>
              </span>
              <input
                type="checkbox"
                role="switch"
                name="simular-offline"
                checked={estado.forzarOffline}
                onChange={(e) => {
                  despachar({ tipo: 'offline', valor: e.target.checked })
                  avisar(e.target.checked ? 'Modo sin conexión activado' : 'Conexión restablecida · sincronizando', e.target.checked ? 'warn' : 'ok')
                }}
                className="peer sr-only"
              />
              <span aria-hidden="true" className="relative h-7 w-12 shrink-0 rounded-full bg-line-2 transition-colors duration-200 peer-checked:bg-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent after:absolute after:top-1 after:left-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:after:translate-x-5" />
            </label>
          </section>

          <section aria-labelledby="titulo-local" className="card p-5">
            <h2 id="titulo-local" className="flex items-center gap-2 text-[16px] font-semibold text-ink">
              <Database size={17} aria-hidden="true" className="text-ink-3" />
              Guardado en esta tablet
            </h2>
            <dl className="mt-3 grid grid-cols-2 gap-2">
              {[
                { t: 'Visitas de hoy', v: Object.keys(estado.registros).length },
                { t: 'Firmas', v: Object.values(estado.registros).filter((r) => r.firma).length },
                { t: 'Entregas por lote', v: estado.entregas.length },
                { t: 'Reportes por voz', v: estado.outbox.filter((o) => o.tipo === 'voz').length },
              ].map((x) => (
                <div key={x.t} className="rounded-xl bg-sunken px-3 py-2.5">
                  <dt className="text-[12px] text-ink-3">{x.t}</dt>
                  <dd className="num text-[20px] font-medium text-ink">{x.v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-3">
              Cada movimiento se guarda primero en la base local y se envía en segundo plano con una clave de idempotencia: si la señal se corta a mitad de camino, nunca se duplica.
            </p>
          </section>

          <section aria-labelledby="titulo-offline" className="card p-5">
            <h2 id="titulo-offline" className="text-[16px] font-semibold text-ink">
              Disponible sin conexión
            </h2>
            <ul className="mt-3 flex flex-col gap-2 text-[14px] text-ink-2">
              {presentacionesOficiales.map((p) => (
                <li key={p.id} className="flex items-center gap-2">
                  <CheckCircle2 size={15} aria-hidden="true" className="shrink-0 text-ok" />
                  <span className="truncate">{p.titulo}</span>
                </li>
              ))}
              <li className="flex items-center gap-2">
                <FileText size={15} aria-hidden="true" className="shrink-0 text-ok" />
                Fichas técnicas, videos y modelos 3D
              </li>
            </ul>
            <p className="mt-3 text-[12px] leading-relaxed text-ink-3">El mapa guarda las zonas que ya recorriste.</p>
          </section>

          <button
            type="button"
            className={confirmando ? 'btn bg-bad text-white hover:bg-bad/90' : 'btn-ghost self-start'}
            onClick={() => {
              if (!confirmando) return setConfirmando(true)
              despachar({ tipo: 'reiniciar' })
              reiniciarAcademia()
              setConfirmando(false)
              avisar('Demo reiniciada', 'info')
            }}
          >
            <RotateCcw size={16} aria-hidden="true" />
            {confirmando ? 'Confirmar: borrar datos de la demo' : 'Reiniciar demo'}
          </button>
        </aside>
      </div>
    </>
  )
}
