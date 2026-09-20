import { useEffect, useState } from 'react'
import { BadgeCheck, Clock, Copy, Film, GraduationCap, Layers, Pencil, Play, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useMedioDisponible, VideoPortada } from '../components/Medio'
import { cursos } from '../data/academia'
import { piezasVideo, type PiezaVideo } from '../data/piezasVideo'
import { useAcademia } from '../state/academia'
import { ChipProducto, EncabezadoPantalla, MonogramaProducto, Segmentado } from '../components/ui'
import { visitasDelDia } from '../data/agenda'
import { minutosEstimados, presentacionesOficiales, productosDe } from '../data/presentaciones'
import { productos } from '../data/productos'
import { hace } from '../lib/formato'
import { componentesDiapositiva } from '../slides'
import { Lienzo } from '../slides/SlideKit'
import { useDemo } from '../state/demo'
import type { Presentacion, ProductoId } from '../types'
import { presentacionSugerida } from './Hoy'

type Filtro = 'todas' | ProductoId | 'mias'

function Portada({ id, medio }: { id: string; medio?: string }) {
  const Componente = componentesDiapositiva[id]
  if (!Componente) return <div className="lienzo bg-sunken" />
  return (
    <VideoPortada nombre={medio} modo="hover">
      <div inert className="pointer-events-none">
        <Lienzo>
          <Componente />
        </Lienzo>
      </div>
    </VideoPortada>
  )
}

/** Vincula cada presentación con la certificación del visitador en ese producto */
function EstadoCapacitacion({ productosIds }: { productosIds: ProductoId[] }) {
  const { estado } = useAcademia()
  return (
    <>
      {productosIds.map((id) => {
        const curso = cursos.find((c) => c.productoId === id)
        if (!curso) return null
        return estado.progreso[curso.id]?.certificado ? (
          <span key={id} className="chip border-transparent bg-ok-soft text-ok">
            <BadgeCheck size={12} aria-hidden="true" />
            Certificada
          </span>
        ) : (
          <a key={id} href={`#/academia/curso/${curso.id}`} className="chip press border-transparent bg-warn-soft text-warn hover:brightness-95">
            <GraduationCap size={12} aria-hidden="true" />
            Capacitación pendiente
          </a>
        )
      })}
    </>
  )
}

/** Pieza en video: solo aparece cuando el archivo está en public/media */
function TarjetaVideo({ pieza }: { pieza: PiezaVideo }) {
  const disponible = useMedioDisponible(pieza.medio)
  if (!disponible) return null
  const producto = productos[pieza.productoId]

  return (
    <article className="card group flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-(--shadow-float)">
      <a href={`#/video/${pieza.id}`} className="relative block overflow-hidden border-b border-line" aria-label={`Reproducir ${pieza.titulo}`}>
        <VideoPortada nombre={pieza.medio} modo="hover" className="lienzo relative block">
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${producto.colorOscuro}, ${producto.color})` }} />
        </VideoPortada>
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-white/90 text-ink transition-transform duration-200 group-hover:scale-105">
            <Play size={22} className="ml-0.5 fill-ink" />
          </span>
        </span>
        <span className="material absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-ink">
          <Film size={12} aria-hidden="true" />
          Pieza en video
        </span>
      </a>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] leading-snug font-semibold text-ink">{pieza.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-3">{pieza.descripcion}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          <ChipProducto id={pieza.productoId} />
          <span className="chip">
            <Clock size={12} aria-hidden="true" />
            <span className="num">{pieza.duracion}</span> s
          </span>
        </div>
        <div className="mt-auto pt-4">
          <a href={`#/video/${pieza.id}`} className="btn-primary w-full">
            <Play size={16} aria-hidden="true" />
            Reproducir para el médico
          </a>
        </div>
      </div>
    </article>
  )
}

function TarjetaPresentacion({ p, destacada }: { p: Presentacion; destacada?: boolean }) {
  const { despachar, avisar } = useDemo()
  const [confirmando, setConfirmando] = useState(false)

  useEffect(() => {
    if (!confirmando) return
    const t = window.setTimeout(() => setConfirmando(false), 4000)
    return () => window.clearTimeout(t)
  }, [confirmando])

  const productosP = productosDe(p)

  return (
    <article className={`card group flex flex-col overflow-hidden transition-shadow duration-200 hover:shadow-(--shadow-float) ${destacada ? 'ring-2 ring-ink' : ''}`}>
      <a href={`#/presentar/${p.id}`} className="relative block overflow-hidden border-b border-line" aria-label={`Presentar ${p.titulo}`} tabIndex={-1}>
        <div className="transition-transform duration-300 ease-(--ease-fluid) group-hover:scale-[1.015]">
          <Portada id={p.diapositivas[0]} medio={p.medio} />
        </div>
        <span className="material absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[12px] font-medium text-ink">
          {p.tipo === 'oficial' ? 'Oficial · aprobada' : 'Mi presentación'}
        </span>
      </a>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-[17px] leading-snug font-semibold text-ink">{p.titulo}</h3>
        <p className="mt-1 line-clamp-2 text-[14px] leading-relaxed text-ink-3">{p.descripcion}</p>
        <div className="mt-3 flex flex-wrap items-center gap-1.5">
          {productosP.map((id) => (
            <ChipProducto key={id} id={id} />
          ))}
          <span className="chip">
            <Layers size={12} aria-hidden="true" />
            <span className="num">{p.diapositivas.length}</span> pantallas
          </span>
          <span className="chip">
            <Clock size={12} aria-hidden="true" />
            <span className="num">~{minutosEstimados(p)}</span> min
          </span>
          <EstadoCapacitacion productosIds={productosP} />
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-4">
          <a href={`#/presentar/${p.id}`} className="btn-primary flex-1">
            <Play size={16} aria-hidden="true" />
            Presentar
          </a>
          <a href={`#/biblioteca/constructor?base=${encodeURIComponent(p.id)}`} className="btn-secondary" aria-label={p.tipo === 'oficial' ? `Duplicar y editar ${p.titulo}` : `Editar ${p.titulo}`}>
            {p.tipo === 'oficial' ? <Copy size={16} aria-hidden="true" /> : <Pencil size={16} aria-hidden="true" />}
            <span className="hidden sm:inline">{p.tipo === 'oficial' ? 'Duplicar' : 'Editar'}</span>
          </a>
          {p.tipo === 'personal' && (
            <button
              type="button"
              className={confirmando ? 'btn bg-bad text-white hover:bg-bad/90' : 'btn-icon'}
              aria-label={confirmando ? `Confirmar borrado de ${p.titulo}` : `Borrar ${p.titulo}`}
              onClick={() => {
                if (!confirmando) return setConfirmando(true)
                despachar({ tipo: 'borrarPresentacion', id: p.id })
                avisar('Presentación borrada', 'info')
              }}
            >
              <Trash2 size={16} aria-hidden="true" />
              {confirmando && 'Borrar'}
            </button>
          )}
        </div>
        {p.tipo === 'personal' && p.creada && <p className="mt-2 text-[12px] text-ink-3">Creada {hace(p.creada)}</p>}
      </div>
    </article>
  )
}

export function Biblioteca() {
  const { estado, visitaActiva } = useDemo()
  const [filtro, setFiltro] = useState<Filtro>('todas')

  const para = visitaActiva ?? visitasDelDia.find((v) => !estado.registros[v.id] || estado.registros[v.id].estado === 'pendiente') ?? null
  const sugeridaId = para ? presentacionSugerida(para) : null

  const piezas = piezasVideo.filter((pv) => (filtro === 'cardio' || filtro === 'respira' ? pv.productoId === filtro : filtro === 'todas'))
  const todas = [...estado.personales, ...presentacionesOficiales]
  const visibles = todas.filter((p) => {
    if (filtro === 'mias') return p.tipo === 'personal'
    if (filtro === 'cardio' || filtro === 'respira') return productosDe(p).includes(filtro)
    return true
  })

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Presentaciones interactivas"
        titulo="Biblioteca"
        descripcion="Material aprobado por Asuntos Médicos, listo para usar sin conexión. Duplicá una presentación o armá la tuya para cada médico."
        acciones={
          <a href="#/biblioteca/constructor" className="btn-primary">
            <Plus size={17} aria-hidden="true" />
            Armar presentación
          </a>
        }
      />

      {para && sugeridaId && (
        <a
          href={`#/presentar/${sugeridaId}`}
          className="press mb-6 flex flex-wrap items-center gap-4 rounded-2xl bg-ink p-4 text-white hover:bg-[#1c2536] sm:p-5"
        >
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white/10">
            <Sparkles size={20} aria-hidden="true" />
          </span>
          <span className="min-w-0 flex-1 basis-60">
            <span className="block text-[13px] text-white/65">
              {visitaActiva ? 'Para la visita en curso' : `Para tu próxima visita · ${para.hora}`}
            </span>
            <span className="block text-[16px] leading-snug font-semibold">
              {para.medico.nombre}: {presentacionesOficiales.find((x) => x.id === sugeridaId)?.titulo}
            </span>
            <span className="block truncate text-[13px] text-white/65">{para.nota}</span>
          </span>
          <span className="btn w-full bg-white text-ink sm:w-auto">
            <Play size={16} aria-hidden="true" />
            Presentar
          </span>
        </a>
      )}

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Segmentado<Filtro>
          etiqueta="Filtrar presentaciones"
          valor={filtro}
          onCambio={setFiltro}
          opciones={[
            { valor: 'todas', texto: 'Todas' },
            { valor: 'cardio', texto: <><MonogramaProducto id="cardio" size={14} />{productos.cardio.marca}</> },
            { valor: 'respira', texto: <><MonogramaProducto id="respira" size={14} />{productos.respira.marca}</> },
            { valor: 'mias', texto: `Mías (${estado.personales.length})` },
          ]}
        />
        <span className="text-[13px] text-ink-3">
          <span className="num">{visibles.length}</span> {visibles.length === 1 ? 'presentación' : 'presentaciones'}
        </span>
      </div>

      {visibles.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <Layers size={28} aria-hidden="true" className="text-ink-3" />
          <p className="text-[16px] font-semibold text-ink">Todavía no armaste presentaciones propias</p>
          <p className="max-w-[44ch] text-[14px] text-ink-3">Elegí pantallas de cualquier producto y ordenalas según el interés de cada médico.</p>
          <a href="#/biblioteca/constructor" className="btn-primary mt-2">
            <Plus size={17} aria-hidden="true" />
            Armar la primera
          </a>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {piezas.map((pieza) => (
            <TarjetaVideo key={pieza.id} pieza={pieza} />
          ))}
          {visibles.map((p) => (
            <TarjetaPresentacion key={p.id} p={p} destacada={p.id === sugeridaId} />
          ))}
        </div>
      )}
    </>
  )
}
