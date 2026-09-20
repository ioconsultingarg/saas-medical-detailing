import { useState } from 'react'
import { AlertTriangle, CheckCircle2, ChevronRight, Clock, FileCheck, FileText, Film, Layers, Plus, Send, Upload, XCircle } from 'lucide-react'
import { Sheet } from '../../components/Sheet'
import { ChipProducto, EncabezadoPantalla, Kpi, MonogramaProducto, NumeroAnimado, Segmentado } from '../../components/ui'
import { etiquetaEstado, etiquetaTipo, piezas, type EstadoPieza, type Pieza, type TipoPieza } from '../../data/portal'
import { fechaCorta } from '../../lib/formato'
import { useDemo } from '../../state/demo'

const estiloEstado: Record<EstadoPieza, string> = {
  borrador: 'bg-sunken text-ink-3',
  revision: 'bg-warn-soft text-warn',
  aprobada: 'bg-accent-soft text-accent',
  publicada: 'bg-ok-soft text-ok',
  vencida: 'bg-bad-soft text-bad',
}

const iconoTipo: Record<TipoPieza, typeof FileText> = {
  presentacion: Layers,
  estudio: FileText,
  video: Film,
  ficha: FileCheck,
  folleto: FileText,
}

type Filtro = 'todas' | 'pendientes' | 'publicada'

function ChipEstado({ estado }: { estado: EstadoPieza }) {
  return <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[12px] font-semibold whitespace-nowrap ${estiloEstado[estado]}`}>{etiquetaEstado[estado]}</span>
}

export function Material() {
  const { estado, despachar, avisar } = useDemo()
  const [filtro, setFiltro] = useState<Filtro>('todas')
  const [abierta, setAbierta] = useState<Pieza | null>(null)

  const estadoDe = (p: Pieza) => estado.piezas[p.id] ?? p.estadoInicial
  const conteo = (e: EstadoPieza) => piezas.filter((p) => estadoDe(p) === e).length

  const visibles = piezas.filter((p) => {
    const e = estadoDe(p)
    if (filtro === 'pendientes') return e === 'borrador' || e === 'revision' || e === 'aprobada'
    if (filtro === 'publicada') return e === 'publicada'
    return true
  })

  function cambiar(p: Pieza, nuevo: EstadoPieza, mensaje: string, tono: 'ok' | 'info' | 'warn' = 'ok') {
    despachar({ tipo: 'pieza', id: p.id, estado: nuevo })
    avisar(mensaje, tono)
    setAbierta(null)
  }

  const activa = abierta ? { pieza: abierta, estado: estadoDe(abierta) } : null

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Material y aprobaciones"
        descripcion="Todo lo que ve el médico pasa por acá. Nada llega a una tablet sin la aprobación de Asuntos Médicos, y cada pieza tiene su versión y su vigencia."
        acciones={
          <button type="button" className="btn-primary" onClick={() => avisar('En la demo la carga de archivos está simulada', 'info')}>
            <Upload size={17} aria-hidden="true" />
            Subir material
          </button>
        }
      />

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Publicadas" Icono={CheckCircle2} valor={<NumeroAnimado valor={conteo('publicada')} />} detalle="Disponibles en las tablets" />
        <Kpi orden={1} etiqueta="Esperando revisión" Icono={Clock} valor={<NumeroAnimado valor={conteo('revision')} />} detalle="Asuntos Médicos las tiene que aprobar" />
        <Kpi orden={2} etiqueta="Listas para publicar" Icono={Send} valor={<NumeroAnimado valor={conteo('aprobada')} />} detalle="Aprobadas pero sin enviar" />
        <Kpi orden={3} etiqueta="Vencidas" Icono={AlertTriangle} valor={<NumeroAnimado valor={conteo('vencida')} />} detalle="Se retiran solas del campo" />
      </dl>

      <div className="mb-4">
        <Segmentado<Filtro>
          etiqueta="Filtrar material"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todas', texto: 'Todo el material' },
            { valor: 'pendientes', texto: `Pendientes (${conteo('borrador') + conteo('revision') + conteo('aprobada')})` },
            { valor: 'publicada', texto: 'Publicadas' },
          ]}
        />
      </div>

      <section aria-label="Material del laboratorio" className="card overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_24px] gap-4 border-b border-line bg-sunken/60 px-5 py-2.5 text-[12px] font-medium text-ink-3 lg:grid">
          <span>Pieza</span>
          <span>Versión</span>
          <span>Estado</span>
          <span>Vigencia</span>
          <span />
        </div>
        <ul className="divide-y divide-line">
          {visibles.map((p, i) => {
            const e = estadoDe(p)
            const Icono = iconoTipo[p.tipo]
            return (
              <li key={p.id} className="entra-fila" style={{ ['--orden' as string]: Math.min(i, 8) }}>
                <button
                  type="button"
                  onClick={() => setAbierta(p)}
                  className="press grid w-full cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-4 py-3.5 text-left hover:bg-sunken/60 sm:px-5 lg:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)_minmax(0,1.3fr)_minmax(0,1fr)_24px]"
                >
                  <span className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-sunken text-ink-2">
                      <Icono size={18} aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-[15px] font-semibold text-ink">{p.titulo}</span>
                      <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-ink-3">
                        <MonogramaProducto id={p.productoId} size={13} />
                        <span className="truncate">
                          {etiquetaTipo[p.tipo]} · {p.peso} · {p.autor}
                        </span>
                      </span>
                    </span>
                  </span>
                  <ChevronRight size={18} aria-hidden="true" className="text-ink-3 lg:order-last" />
                  <span className="col-span-2 flex flex-wrap items-center gap-x-5 gap-y-1.5 pl-[52px] text-[13px] lg:contents">
                    <span className="num text-ink-2">v{p.version}</span>
                    <ChipEstado estado={e} />
                    <span className={`num ${e === 'vencida' ? 'text-bad' : 'text-ink-2'}`}>{p.vigencia}</span>
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      </section>

      <Sheet
        abierto={Boolean(activa)}
        onCerrar={() => setAbierta(null)}
        titulo={activa?.pieza.titulo ?? ''}
        subtitulo={activa && <span className="eyebrow">{etiquetaTipo[activa.pieza.tipo]} · versión {activa.pieza.version}</span>}
        ancho="520px"
        pie={
          activa && (
            <div className="flex flex-wrap justify-end gap-2">
              {activa.estado === 'borrador' && (
                <button type="button" className="btn-primary" onClick={() => cambiar(activa.pieza, 'revision', 'Enviada a Asuntos Médicos para su revisión', 'info')}>
                  <Send size={16} aria-hidden="true" />
                  Enviar a revisión
                </button>
              )}
              {activa.estado === 'revision' && (
                <>
                  <button type="button" className="btn-ghost text-bad" onClick={() => cambiar(activa.pieza, 'borrador', 'Devuelta al autor con observaciones', 'warn')}>
                    <XCircle size={16} aria-hidden="true" />
                    Devolver
                  </button>
                  <button type="button" className="btn-primary" onClick={() => cambiar(activa.pieza, 'aprobada', 'Aprobada por Asuntos Médicos')}>
                    <CheckCircle2 size={16} aria-hidden="true" />
                    Aprobar
                  </button>
                </>
              )}
              {activa.estado === 'aprobada' && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => cambiar(activa.pieza, 'publicada', 'Publicada · las tablets la descargan en la próxima sincronización')}
                >
                  <Upload size={16} aria-hidden="true" />
                  Publicar en las tablets
                </button>
              )}
              {activa.estado === 'publicada' && (
                <button type="button" className="btn-secondary text-bad hover:border-bad/40 hover:bg-bad-soft" onClick={() => cambiar(activa.pieza, 'vencida', 'Retirada: deja de estar disponible en el campo', 'warn')}>
                  <AlertTriangle size={16} aria-hidden="true" />
                  Retirar del campo
                </button>
              )}
              {activa.estado === 'vencida' && (
                <button type="button" className="btn-secondary" onClick={() => cambiar(activa.pieza, 'borrador', 'Vuelve a borrador para actualizarla', 'info')}>
                  <Plus size={16} aria-hidden="true" />
                  Crear una versión nueva
                </button>
              )}
            </div>
          )
        }
      >
        {activa && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <ChipEstado estado={activa.estado} />
              <ChipProducto id={activa.pieza.productoId} />
              {activa.pieza.compartible ? (
                <span className="chip border-transparent bg-ok-soft text-ok">Se puede enviar al médico</span>
              ) : (
                <span className="chip">Solo para mostrar en la visita</span>
              )}
            </div>

            {activa.pieza.nota && <p className="rounded-xl bg-sunken p-4 text-[14px] leading-relaxed text-ink-2">{activa.pieza.nota}</p>}

            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                ['Autor', activa.pieza.autor],
                ['Última edición', fechaCorta(activa.pieza.actualizada)],
                ['Vigencia', activa.pieza.vigencia],
                ['Peso', activa.pieza.peso],
              ].map(([t, v]) => (
                <div key={t} className="rounded-xl bg-sunken px-3 py-2.5">
                  <dt className="text-[12px] text-ink-3">{t}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>

            <div>
              <h3 className="eyebrow mb-2">Circuito de aprobación</h3>
              <ol className="flex flex-col gap-2.5">
                {(['borrador', 'revision', 'aprobada', 'publicada'] as EstadoPieza[]).map((paso) => {
                  const orden = ['borrador', 'revision', 'aprobada', 'publicada']
                  const actual = orden.indexOf(activa.estado)
                  const idx = orden.indexOf(paso)
                  const hecho = activa.estado === 'vencida' ? true : idx < actual
                  const enCurso = idx === actual
                  return (
                    <li key={paso} className={`flex items-center gap-3 text-[14px] ${hecho || enCurso ? 'text-ink' : 'text-ink-3'}`}>
                      <span className={`flex size-6 shrink-0 items-center justify-center rounded-full ${hecho ? 'bg-ok text-white' : enCurso ? 'bg-ink text-white' : 'bg-sunken'}`}>
                        {hecho ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
                      </span>
                      {etiquetaEstado[paso]}
                    </li>
                  )
                })}
              </ol>
            </div>

            {activa.pieza.habilitaPresentacion && (
              <p className="rounded-xl border border-accent/20 bg-accent-soft p-4 text-[13px] leading-relaxed text-ink-2">
                Al publicarla, esta presentación aparece en la Biblioteca de los 4 visitadores de la zona y queda disponible sin conexión.
              </p>
            )}
          </div>
        )}
      </Sheet>
    </>
  )
}
