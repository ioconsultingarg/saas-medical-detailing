import { useEffect, useId, useMemo, useState, type ReactNode, type SetStateAction } from 'react'
import {
  closestCenter,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowLeft, Check, GripVertical, Play, Plus, Save, X } from 'lucide-react'
import { ChipProducto, MonogramaProducto, Segmentado } from '../components/ui'
import { visitasDelDia } from '../data/agenda'
import { diapositivaPorId, diapositivas, presentacionesOficiales, presentacionPublicable } from '../data/presentaciones'
import { productos } from '../data/productos'
import { ir } from '../lib/ruta'
import { componentesDiapositiva } from '../slides'
import { Lienzo } from '../slides/SlideKit'
import { nombreCorto, useDemo } from '../state/demo'
import type { ProductoId } from '../types'

function Miniatura({ id }: { id: string }) {
  const C = componentesDiapositiva[id]
  return (
    <div inert className="pointer-events-none overflow-hidden rounded-lg border border-line">
      <Lienzo>
        <C />
      </Lienzo>
    </div>
  )
}

function ItemPaleta({ id, incluida, onAgregar }: { id: string; incluida: boolean; onAgregar: () => void }) {
  const d = diapositivaPorId[id]
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `paleta:${id}`, disabled: incluida })
  return (
    <li className={`card flex flex-col overflow-hidden p-2 transition-opacity duration-200 ${isDragging ? 'opacity-40' : ''}`}>
      <div
        ref={setNodeRef}
        {...listeners}
        {...attributes}
        aria-label={`Arrastrar ${d.titulo} a la presentación`}
        className={`rounded-lg ${incluida ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'}`}
        style={{ touchAction: 'manipulation' }}
      >
        <Miniatura id={id} />
      </div>
      <div className="flex items-center gap-2 px-1 pt-2">
        <span className="min-w-0 flex-1 truncate text-[14px] font-medium text-ink">{d.titulo}</span>
        <button
          type="button"
          onClick={onAgregar}
          disabled={incluida}
          className={`btn-icon size-10 ${incluida ? 'text-ok' : 'bg-sunken'}`}
          aria-label={incluida ? `${d.titulo} ya está en la presentación` : `Agregar ${d.titulo}`}
        >
          {incluida ? <Check size={17} aria-hidden="true" /> : <Plus size={17} aria-hidden="true" />}
        </button>
      </div>
    </li>
  )
}

/** El asa se reordena también con teclado (espacio + flechas), por eso no hacen falta botones subir/bajar */
function FilaSecuencia({ id, posicion, onQuitar }: { id: string; posicion: number; onQuitar: () => void }) {
  const d = diapositivaPorId[id]
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 rounded-xl border bg-surface p-2 ${isDragging ? 'z-10 border-ink opacity-60 shadow-(--shadow-float)' : 'border-line'}`}
    >
      <button
        type="button"
        {...listeners}
        {...attributes}
        aria-label={`Reordenar ${d.titulo}`}
        className="btn-icon cursor-grab text-ink-3 active:cursor-grabbing"
        style={{ touchAction: 'none' }}
      >
        <GripVertical size={18} aria-hidden="true" />
      </button>
      <span className="num w-5 text-center text-[13px] text-ink-3">{posicion + 1}</span>
      <div className="w-20 shrink-0 sm:w-24">
        <Miniatura id={id} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-[14px] font-semibold text-ink">{d.titulo}</div>
        <div className="mt-0.5 flex items-center gap-1.5 truncate text-[12px] text-ink-3" translate="no">
          <MonogramaProducto id={d.productoId} size={12} />
          {productos[d.productoId].marca}
        </div>
      </div>
      <button type="button" className="btn-icon hover:text-bad" onClick={onQuitar} aria-label={`Quitar ${d.titulo}`}>
        <X size={17} aria-hidden="true" />
      </button>
    </li>
  )
}

function ZonaSecuencia({ vacia, children }: { vacia: boolean; children: ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'secuencia' })
  return (
    <div
      ref={setNodeRef}
      className={`min-h-[220px] rounded-2xl border-2 border-dashed p-2 transition-colors duration-150 ${isOver ? 'border-ink bg-sunken' : vacia ? 'border-line-2' : 'border-transparent'}`}
    >
      {vacia ? (
        <div className="flex h-[200px] flex-col items-center justify-center gap-2 px-6 text-center text-ink-3">
          <Plus size={22} aria-hidden="true" />
          <p className="text-[14px]">Arrastrá pantallas acá o tocá + en cada una</p>
        </div>
      ) : (
        children
      )}
    </div>
  )
}

export function Constructor({ baseId }: { baseId?: string }) {
  const { estado, visitaActiva, despachar, avisar } = useDemo()
  const idTitulo = useId()
  const idPara = useId()

  const base = useMemo(() => [...estado.personales, presentacionPublicable, ...presentacionesOficiales].find((p) => p.id === baseId) ?? null, [baseId, estado.personales])
  const [titulo, setTitulo] = useState(() => (base ? (base.tipo === 'oficial' ? `${base.titulo} (a medida)` : base.titulo) : ''))
  const [secuencia, setSecuencia] = useState<string[]>(() => base?.diapositivas ?? [])
  const [paraId, setParaId] = useState(() => visitaActiva?.id ?? '')
  const [tab, setTab] = useState<ProductoId>(() => (base ? diapositivaPorId[base.diapositivas[0]]?.productoId ?? 'cardio' : visitaActiva?.productosInteres[0] ?? 'cardio'))
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [sucio, setSucio] = useState(false)
  const [errorTitulo, setErrorTitulo] = useState(false)

  useEffect(() => {
    if (!sucio) return
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', aviso)
    return () => window.removeEventListener('beforeunload', aviso)
  }, [sucio])

  const sensores = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 160, tolerance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  // actualización funcional: dos toques rápidos seguidos no se pisan entre sí
  function cambiar(nueva: SetStateAction<string[]>) {
    setSecuencia(nueva)
    setSucio(true)
  }

  function onDragStart(e: DragStartEvent) {
    const id = String(e.active.id)
    setArrastrando(id.startsWith('paleta:') ? id.slice(7) : id)
  }

  function onDragEnd(e: DragEndEvent) {
    setArrastrando(null)
    const activo = String(e.active.id)
    const sobre = e.over ? String(e.over.id) : null
    if (!sobre) return
    if (activo.startsWith('paleta:')) {
      const id = activo.slice(7)
      cambiar((s) => {
        if (s.includes(id)) return s
        const pos = sobre === 'secuencia' ? s.length : s.indexOf(sobre)
        const copia = [...s]
        copia.splice(pos < 0 ? copia.length : pos, 0, id)
        return copia
      })
      return
    }
    if (activo !== sobre) {
      cambiar((s) => (s.includes(sobre) ? arrayMove(s, s.indexOf(activo), s.indexOf(sobre)) : s))
    }
  }

  function guardar(presentar: boolean) {
    const limpio = titulo.trim()
    if (!limpio) {
      setErrorTitulo(true)
      document.getElementById(idTitulo)?.focus()
      return
    }
    const para = visitasDelDia.find((v) => v.id === paraId)
    const id = base?.tipo === 'personal' ? base.id : `mia-${Date.now()}`
    despachar({
      tipo: 'guardarPresentacion',
      presentacion: {
        id,
        titulo: limpio,
        descripcion: para ? `Preparada para ${para.medico.nombre} · ${para.nota}` : 'Armada a medida para la visita.',
        diapositivas: secuencia,
        tipo: 'personal',
        creada: Date.now(),
      },
    })
    setSucio(false)
    avisar('Presentación guardada · disponible sin conexión')
    ir(presentar ? `/presentar/${id}` : '/biblioteca')
  }

  const disponibles = diapositivas.filter((d) => d.productoId === tab)

  return (
    <DndContext sensors={sensores} collisionDetection={closestCenter} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setArrastrando(null)}>
      <div className="flex flex-wrap items-center justify-between gap-3 pt-6 pb-5 md:pt-8">
        <div className="min-w-0">
          <a href="#/biblioteca" className="press mb-2 inline-flex min-h-9 items-center gap-1 rounded-lg text-[14px] font-medium text-ink-3 hover:text-ink">
            <ArrowLeft size={16} aria-hidden="true" />
            Biblioteca
          </a>
          <h1 className="text-[28px] leading-tight font-semibold text-ink md:text-[34px]">{base?.tipo === 'personal' ? 'Editar presentación' : 'Armar presentación'}</h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section aria-labelledby="titulo-paleta" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h2 id="titulo-paleta" className="text-[18px] font-semibold text-ink">
              Pantallas aprobadas
            </h2>
            <Segmentado<ProductoId>
              etiqueta="Producto"
              valor={tab}
              onCambio={setTab}
              opciones={[
                { valor: 'cardio', texto: <><MonogramaProducto id="cardio" size={14} />{productos.cardio.marca}</> },
                { valor: 'respira', texto: <><MonogramaProducto id="respira" size={14} />{productos.respira.marca}</> },
              ]}
            />
          </div>
          <ul className="grid grid-cols-2 gap-3 xl:grid-cols-3">
            {disponibles.map((d) => (
              <ItemPaleta key={d.id} id={d.id} incluida={secuencia.includes(d.id)} onAgregar={() => cambiar((s) => (s.includes(d.id) ? s : [...s, d.id]))} />
            ))}
          </ul>
        </section>

        <section aria-labelledby="titulo-secuencia" className="min-w-0 lg:sticky lg:top-24 lg:self-start">
          <div className="card flex flex-col gap-4 p-4 sm:p-5">
            <h2 id="titulo-secuencia" className="text-[18px] font-semibold text-ink">
              Tu presentación
            </h2>

            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label htmlFor={idTitulo} className="mb-1.5 block text-[14px] font-medium text-ink">
                  Nombre
                </label>
                <input
                  id={idTitulo}
                  name="titulo-presentacion"
                  autoComplete="off"
                  value={titulo}
                  onChange={(e) => {
                    setTitulo(e.target.value)
                    setErrorTitulo(false)
                    setSucio(true)
                  }}
                  placeholder="Ej.: Dr. Rossi — seguridad renal…"
                  aria-invalid={errorTitulo}
                  aria-describedby={errorTitulo ? `${idTitulo}-error` : undefined}
                  className={`field ${errorTitulo ? 'border-bad' : ''}`}
                />
                {errorTitulo && (
                  <p id={`${idTitulo}-error`} className="mt-1.5 text-[13px] text-bad">
                    Poné un nombre para encontrarla después en la biblioteca.
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={idPara} className="mb-1.5 block text-[14px] font-medium text-ink">
                  Preparada para
                </label>
                <select
                  id={idPara}
                  name="medico"
                  value={paraId}
                  onChange={(e) => {
                    setParaId(e.target.value)
                    const v = visitasDelDia.find((x) => x.id === e.target.value)
                    if (v && !titulo.trim()) setTitulo(`${nombreCorto(v)} — a medida`)
                    setSucio(true)
                  }}
                  className="field bg-surface text-ink"
                >
                  <option value="">Uso general</option>
                  {visitasDelDia.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.hora} · {v.medico.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <SortableContext items={secuencia} strategy={verticalListSortingStrategy}>
              <ZonaSecuencia vacia={secuencia.length === 0}>
                <ol className="flex flex-col gap-2">
                  {secuencia.map((id, i) => (
                    <FilaSecuencia key={id} id={id} posicion={i} onQuitar={() => cambiar((s) => s.filter((x) => x !== id))} />
                  ))}
                </ol>
              </ZonaSecuencia>
            </SortableContext>

            <div className="flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="mr-auto text-[13px] text-ink-3">
                <span className="num">{secuencia.length}</span> pantallas · ~<span className="num">{Math.max(1, Math.round(secuencia.length * 1.1))}</span> min
                {[...new Set(secuencia.map((id) => diapositivaPorId[id].productoId))].length > 1 && ' · combina 2 productos'}
              </span>
              <button type="button" className="btn-secondary" onClick={() => guardar(false)} disabled={secuencia.length === 0}>
                <Save size={16} aria-hidden="true" />
                Guardar
              </button>
              <button type="button" className="btn-primary" onClick={() => guardar(true)} disabled={secuencia.length === 0}>
                <Play size={16} aria-hidden="true" />
                Guardar y presentar
              </button>
            </div>
            {secuencia.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {[...new Set(secuencia.map((id) => diapositivaPorId[id].productoId))].map((p) => (
                  <ChipProducto key={p} id={p} detalle />
                ))}
              </div>
            )}
          </div>
        </section>
      </div>

      <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}>
        {arrastrando ? (
          <div className="w-48 scale-[1.03] rounded-xl bg-surface p-1.5 shadow-(--shadow-sheet)">
            <Miniatura id={arrastrando} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
