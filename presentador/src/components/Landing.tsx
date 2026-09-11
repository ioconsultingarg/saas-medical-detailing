import { useEffect, useState, type ReactNode } from 'react'
import {
  ArrowRight,
  BarChart3,
  CloudOff,
  LayoutGrid,
  Menu,
  MousePointerClick,
  ShieldCheck,
  Tablet,
  Upload,
  X,
} from 'lucide-react'
import { arbolDemo } from '../data/mockContent'
import { useParallax, useReveal, useScrolled } from '../hooks/useScrollFx'
import type { Tema } from '../hooks/useTheme'
import type { ContentNode } from '../types'
import { HeroDevice } from './HeroDevice'
import { ThemeToggle } from './ThemeToggle'
import { TiltCard } from './TiltCard'

interface Props {
  onEntrar: () => void
  tema: Tema
  alternarTema: () => void
}

const enlaces = [
  { href: '#producto', label: 'Producto' },
  { href: '#funcionalidades', label: 'Funcionalidades' },
  { href: '#como-funciona', label: 'Cómo funciona' },
]

const funcionalidades = [
  {
    titulo: 'Presentador no lineal',
    texto:
      'El APM salta a cualquier pieza según cómo va la charla, sin recorrer un PowerPoint de punta a punta.',
    Icono: LayoutGrid,
  },
  {
    titulo: 'Zonas interactivas',
    texto:
      'Puntos sobre el material que amplían posología, estudios o mecanismos en el momento en que el médico pregunta.',
    Icono: MousePointerClick,
  },
  {
    titulo: 'Funciona sin señal',
    texto:
      'El contenido se descarga antes de salir a la calle y la visita corre completa en un consultorio sin wifi.',
    Icono: CloudOff,
  },
  {
    titulo: 'Métricas por pieza',
    texto:
      'Cuántos segundos se detuvo el médico en cada pantalla, para saber qué mensaje realmente generó interés.',
    Icono: BarChart3,
  },
]

const pasos = [
  {
    n: '01',
    titulo: 'Cargás el material',
    texto: 'Las piezas que ya usa tu laboratorio: PDFs, imágenes, videos y sus referencias.',
    Icono: Upload,
  },
  {
    n: '02',
    titulo: 'Marcás las zonas',
    texto: 'Definís qué puntos del material amplían información y qué muestran al tocarlos.',
    Icono: MousePointerClick,
  },
  {
    n: '03',
    titulo: 'El APM sale a la calle',
    texto: 'Presenta desde la tablet, con o sin conexión, y cada interacción queda registrada.',
    Icono: Tablet,
  },
]

/** Piezas reales del demo, para que el hero muestre el producto en vez de un mockup vacío */
function piezasDestacadas() {
  const piezas: { nodo: ContentNode; linea: string; color: string }[] = []
  for (const linea of arbolDemo.children ?? []) {
    for (const hijo of linea.children ?? []) {
      if (hijo.tipo === 'imagen' && hijo.url) {
        piezas.push({ nodo: hijo, linea: linea.titulo, color: linea.color ?? '#0f6e63' })
      }
    }
  }
  return piezas
}

function Seccion({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()

  return (
    <section
      id={id}
      ref={ref}
      className={`scroll-mt-24 transition-all duration-700 ease-out ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
      } ${className}`}
    >
      {children}
    </section>
  )
}

export function Landing({ onEntrar, tema, alternarTema }: Props) {
  const scrolleado = useScrolled(20)
  const desplazamiento = useParallax(0.06)
  const [montado, setMontado] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)

  useEffect(() => {
    const id = requestAnimationFrame(() => setMontado(true))
    return () => cancelAnimationFrame(id)
  }, [])

  return (
    <div className="min-h-svh bg-white font-body text-slate-700 dark:bg-brand-900 dark:text-slate-300">
      {/* ---------------- NAV ---------------- */}
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
          scrolleado || menuAbierto
            ? 'border-b border-black/5 bg-white/80 py-2.5 backdrop-blur-xl dark:border-white/10 dark:bg-brand-900/85'
            : 'border-b border-transparent bg-transparent py-4'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-5">
          <a href="#producto" className="flex items-center gap-2.5 py-1.5">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-8 w-8" />
            <span className="font-display text-[15px] font-bold text-slate-900 dark:text-white">
              Presentador
            </span>
          </a>

          <nav className="mx-auto hidden items-center gap-1 md:flex">
            {enlaces.map((enlace) => (
              <a
                key={enlace.href}
                href={enlace.href}
                className="rounded-full px-4 py-2 text-[13.5px] font-medium text-slate-600 transition-colors hover:bg-black/5 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              >
                {enlace.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2.5 md:ml-0">
            <ThemeToggle tema={tema} alternar={alternarTema} />
            <button
              onClick={onEntrar}
              className="hidden cursor-pointer rounded-full bg-brand-600 px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-lg shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 active:scale-[0.97] sm:block dark:bg-lime-accent dark:text-brand-900 dark:shadow-lime-accent/20 dark:hover:bg-lime-accent/90"
            >
              Abrir demo
            </button>
            <button
              onClick={() => setMenuAbierto((v) => !v)}
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuAbierto}
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/10 text-slate-700 transition-colors hover:bg-black/5 active:scale-[0.95] md:hidden dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/10"
            >
              {menuAbierto ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Menú mobile */}
        {menuAbierto && (
          <nav className="mx-auto mt-2 max-w-6xl px-5 md:hidden">
            <div className="flex flex-col gap-1 border-t border-black/5 pt-3 pb-1 dark:border-white/10">
              {enlaces.map((enlace) => (
                <a
                  key={enlace.href}
                  href={enlace.href}
                  onClick={() => setMenuAbierto(false)}
                  className="rounded-xl px-4 py-3 text-[15px] font-medium text-slate-700 transition-colors hover:bg-black/5 active:bg-black/10 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  {enlace.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setMenuAbierto(false)
                  onEntrar()
                }}
                className="mt-1 cursor-pointer rounded-xl bg-brand-600 px-4 py-3.5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] dark:bg-lime-accent dark:text-brand-900"
              >
                Abrir demo
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ---------------- HERO ---------------- */}
      <section id="producto" className="relative scroll-mt-24 overflow-hidden px-5 pt-32 pb-20 md:pt-40">
        <div
          aria-hidden="true"
          style={{ transform: `translateY(${desplazamiento}px)` }}
          className="pointer-events-none absolute -top-40 -right-32 h-[34rem] w-[34rem] rounded-full bg-brand-400/20 blur-[110px] dark:bg-brand-400/25"
        />
        <div
          aria-hidden="true"
          style={{ transform: `translateY(${-desplazamiento * 0.6}px)` }}
          className="pointer-events-none absolute -bottom-48 -left-40 h-[30rem] w-[30rem] rounded-full bg-lime-accent/20 blur-[110px] dark:bg-lime-accent/10"
        />

        <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div
            className={`transition-all duration-700 ease-out ${
              montado ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <span className="inline-flex items-center gap-2 rounded-full border border-brand-600/20 bg-brand-50 px-4 py-1.5 font-mono text-[10.5px] tracking-[0.14em] text-brand-700 uppercase dark:border-lime-accent/25 dark:bg-lime-accent/10 dark:text-lime-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500 dark:bg-lime-accent" />
              e-Detailing para laboratorios
            </span>

            <h1 className="mt-6 font-display text-[clamp(2.2rem,5vw,3.6rem)] leading-[1.05] font-extrabold tracking-tight text-slate-900 dark:text-white">
              El material de tu laboratorio,{' '}
              <span className="bg-gradient-to-r from-brand-500 to-brand-700 bg-clip-text text-transparent dark:from-lime-accent dark:to-brand-400">
                vivo en la tablet del APM
              </span>
            </h1>

            <p className="mt-6 max-w-[46ch] text-[17px] leading-relaxed text-slate-600 dark:text-slate-400">
              Navegación libre por producto, zonas interactivas que amplían la información en el momento justo,
              y todo el contenido disponible sin conexión adentro del consultorio.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                onClick={onEntrar}
                className="group inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-brand-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-brand-600/25 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-500 active:scale-[0.97] dark:bg-lime-accent dark:text-brand-900 dark:shadow-lime-accent/20"
              >
                Ver la demo en vivo
                <ArrowRight size={17} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
              <a
                href="#como-funciona"
                className="rounded-full border border-black/10 px-7 py-3.5 text-[15px] font-semibold text-slate-700 transition-all duration-200 hover:border-brand-500/50 hover:text-brand-700 active:scale-[0.97] dark:border-white/15 dark:text-slate-300 dark:hover:border-lime-accent/50 dark:hover:text-lime-accent"
              >
                Cómo funciona
              </a>
            </div>
          </div>

          <div
            className={`transition-all delay-150 duration-1000 ease-out ${
              montado ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}
          >
            <HeroDevice piezas={piezasDestacadas()} />
          </div>
        </div>
      </section>

      {/* ---------------- PRUEBA / CREDIBILIDAD ---------------- */}
      <Seccion className="px-5 pb-24">
        <div className="mx-auto max-w-6xl rounded-3xl border border-black/8 bg-white/60 px-6 py-8 backdrop-blur-xl md:px-10 dark:border-white/10 dark:bg-white/[0.04]">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { v: '3 seg', l: 'para abrir una pieza' },
              { v: 'Sin señal', l: 'la visita corre igual' },
              { v: '100%', l: 'del material medido' },
              { v: 'Tablet', l: 'pensado para iPad y Android' },
            ].map((s) => (
              <div key={s.l}>
                <div className="font-display text-[26px] font-bold text-slate-900 dark:text-white">{s.v}</div>
                <div className="mt-1.5 font-mono text-[10px] tracking-[0.1em] text-slate-500 uppercase dark:text-slate-500">
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-black/8 pt-6 dark:border-white/10">
            <span className="inline-flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400">
              <ShieldCheck size={16} className="text-brand-600 dark:text-lime-accent" />
              Pensado para material aprobado por asuntos regulatorios
            </span>
            <span className="inline-flex items-center gap-2 text-[13px] text-slate-600 dark:text-slate-400">
              <BarChart3 size={16} className="text-brand-600 dark:text-lime-accent" />
              Cada visita queda registrada para el reporte
            </span>
          </div>
        </div>
      </Seccion>

      {/* ---------------- FUNCIONALIDADES ---------------- */}
      <Seccion id="funcionalidades" className="px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <p className="font-mono text-[10.5px] tracking-[0.14em] text-brand-600 uppercase dark:text-lime-accent">
            Qué resuelve
          </p>
          <h2 className="mt-3 max-w-[20ch] font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
            Pensado para la visita real, no para la demo
          </h2>

          <div className="mt-12 grid gap-5 sm:grid-cols-2">
            {funcionalidades.map(({ titulo, texto, Icono }) => (
              <TiltCard key={titulo} className="rounded-3xl">
                <div className="h-full rounded-3xl border border-black/8 bg-white/70 p-7 backdrop-blur-xl transition-colors hover:border-brand-500/30 dark:border-white/10 dark:bg-white/[0.04] dark:hover:border-lime-accent/25">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 dark:bg-lime-accent/10 dark:text-lime-accent">
                    <Icono size={20} />
                  </span>
                  <h3 className="mt-5 font-display text-[17px] font-bold text-slate-900 dark:text-white">
                    {titulo}
                  </h3>
                  <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                    {texto}
                  </p>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </Seccion>

      {/* ---------------- CÓMO FUNCIONA ---------------- */}
      <Seccion id="como-funciona" className="px-5 py-24">
        <div className="mx-auto max-w-6xl rounded-[32px] border border-black/8 bg-gradient-to-b from-brand-50/60 to-transparent p-8 md:p-14 dark:border-white/10 dark:from-white/[0.05] dark:to-transparent">
          <p className="font-mono text-[10.5px] tracking-[0.14em] text-brand-600 uppercase dark:text-lime-accent">
            Puesta en marcha
          </p>
          <h2 className="mt-3 font-display text-[clamp(1.7rem,3.4vw,2.5rem)] leading-tight font-bold tracking-tight text-slate-900 dark:text-white">
            Tres pasos, sin proyecto de meses
          </h2>

          <ol className="mt-12 grid gap-8 md:grid-cols-3">
            {pasos.map(({ n, titulo, texto, Icono }) => (
              <li key={n} className="relative">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white dark:bg-lime-accent dark:text-brand-900">
                    <Icono size={18} />
                  </span>
                  <span className="font-mono text-[26px] font-medium text-brand-600/25 dark:text-lime-accent/25">
                    {n}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-[17px] font-bold text-slate-900 dark:text-white">
                  {titulo}
                </h3>
                <p className="mt-2.5 text-[14.5px] leading-relaxed text-slate-600 dark:text-slate-400">
                  {texto}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Seccion>

      {/* ---------------- CTA ---------------- */}
      <Seccion className="px-5 pt-8 pb-28">
        <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[32px] bg-gradient-to-br from-brand-700 to-brand-900 p-10 text-center md:p-16">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-lime-accent/20 blur-[90px]"
          />
          <div className="relative">
            <h2 className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] leading-tight font-bold text-white">
              Mirala como la vería un médico
            </h2>
            <p className="mx-auto mt-4 max-w-[44ch] text-[15.5px] leading-relaxed text-white/70">
              Abrí el presentador con contenido de ejemplo de dos líneas de producto y probá las zonas
              interactivas.
            </p>
            <button
              onClick={onEntrar}
              className="group mt-8 inline-flex cursor-pointer items-center gap-2.5 rounded-full bg-lime-accent px-8 py-4 font-semibold text-brand-900 shadow-xl shadow-lime-accent/25 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
            >
              Abrir el presentador
              <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </Seccion>

      {/* ---------------- FOOTER ---------------- */}
      <footer className="border-t border-black/8 px-5 py-10 dark:border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={`${import.meta.env.BASE_URL}icon.svg`} alt="" className="h-6 w-6" />
            <span className="font-display text-[13.5px] font-bold text-slate-900 dark:text-white">
              Presentador
            </span>
          </div>
          <p className="font-mono text-[10.5px] tracking-[0.08em] text-slate-500 uppercase dark:text-slate-500">
            Demo de producto · Medical e-Detailing
          </p>
        </div>
      </footer>
    </div>
  )
}
