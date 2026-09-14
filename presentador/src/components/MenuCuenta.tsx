import { AlertTriangle, CloudOff, LogOut, Mail, MapPin, RefreshCw } from 'lucide-react'
import { hace } from '../lib/formato'
import { ir } from '../lib/ruta'
import { nombreCorto, useDemo } from '../state/demo'
import { useSesion } from '../state/sesion'
import { Sheet } from './Sheet'

export function iniciales(nombre: string) {
  return nombre
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
}

export function MenuCuenta({ abierto, onCerrar }: { abierto: boolean; onCerrar: () => void }) {
  const { sesion, salir } = useSesion()
  const { apm, visitaActiva, pendientes, online, avisar } = useDemo()

  if (!sesion) return null

  function cerrarSesion() {
    onCerrar()
    salir()
    ir('/')
    avisar(pendientes > 0 ? `Sesión cerrada · ${pendientes} movimientos quedan guardados en esta tablet` : 'Sesión cerrada', 'info')
  }

  return (
    <Sheet abierto={abierto} onCerrar={onCerrar} titulo="Tu cuenta" ancho="420px">
      <div className="flex items-center gap-4">
        <span aria-hidden="true" className="flex size-14 shrink-0 items-center justify-center rounded-full bg-ink text-[18px] font-semibold text-white">
          {iniciales(sesion.nombre)}
        </span>
        <div className="min-w-0">
          <div className="truncate text-[18px] font-semibold text-ink">{sesion.nombre}</div>
          <div className="text-[14px] text-ink-3">Visitadora médica · {apm.laboratorio}</div>
        </div>
      </div>

      <dl className="mt-6 flex flex-col divide-y divide-line overflow-hidden rounded-xl border border-line">
        <div className="flex items-center gap-3 px-4 py-3">
          <Mail size={16} aria-hidden="true" className="shrink-0 text-ink-3" />
          <dt className="sr-only">Correo</dt>
          <dd className="num min-w-0 truncate text-[14px] text-ink-2" translate="no">
            {sesion.email}
          </dd>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          <MapPin size={16} aria-hidden="true" className="shrink-0 text-ink-3" />
          <dt className="sr-only">Zona</dt>
          <dd className="text-[14px] text-ink-2">{apm.zona}</dd>
        </div>
        <div className="flex items-center gap-3 px-4 py-3">
          {online ? <RefreshCw size={16} aria-hidden="true" className="shrink-0 text-ink-3" /> : <CloudOff size={16} aria-hidden="true" className="shrink-0 text-warn" />}
          <dt className="sr-only">Sesión</dt>
          <dd className="text-[14px] text-ink-2">Ingresaste {hace(sesion.desde)}</dd>
        </div>
      </dl>

      {visitaActiva ? (
        <div role="note" className="mt-6 rounded-xl bg-warn-soft p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-warn" />
            <div className="min-w-0">
              <p className="text-[14px] font-semibold text-ink">Tenés una visita en curso con {nombreCorto(visitaActiva)}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-2">Cerrala antes de salir para registrar la duración y la firma de las muestras.</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                onCerrar()
                ir('/cierre')
              }}
            >
              Cerrar la visita
            </button>
            <button type="button" className="btn-ghost" onClick={cerrarSesion}>
              Salir igual
            </button>
          </div>
        </div>
      ) : (
        <>
          {pendientes > 0 && (
            <p className="mt-6 flex items-start gap-2 rounded-xl bg-sunken p-4 text-[13px] leading-relaxed text-ink-2">
              <CloudOff size={16} aria-hidden="true" className="mt-0.5 shrink-0 text-ink-3" />
              <span>
                {online ? 'Hay' : 'Sin conexión: hay'} <strong className="num">{pendientes}</strong> movimientos sin sincronizar. Quedan guardados en esta tablet y se envían la próxima vez que ingreses.
              </span>
            </p>
          )}
          <button type="button" className="btn-secondary mt-6 w-full text-bad hover:border-bad/40 hover:bg-bad-soft" onClick={cerrarSesion}>
            <LogOut size={17} aria-hidden="true" />
            Cerrar sesión
          </button>
        </>
      )}
    </Sheet>
  )
}
