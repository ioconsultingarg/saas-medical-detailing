import { useId, useRef, useState, type FormEvent } from 'react'
import { ArrowRight, CalendarRange, CloudOff, Eye, EyeOff, KeyRound, Lock, MapPin, ShieldCheck } from 'lucide-react'
import { MonogramaProducto } from '../components/ui'
import { apm, visitasDelDia } from '../data/agenda'
import { productos } from '../data/productos'
import { fechaLarga } from '../lib/formato'
import { useDemo } from '../state/demo'
import { CUENTA_DEMO, useSesion } from '../state/sesion'

function Logo({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="9" fill="#0b1220" />
      <path d="M10 22V10h6.5a4 4 0 0 1 0 8H10" stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="22.5" cy="22.5" r="2.6" fill="#7cc4ee" />
    </svg>
  )
}

/** Panel derecho: anticipa el día de trabajo que se abre al ingresar */
function VistaPreviaDia() {
  const { estado, online } = useDemo()
  const completadas = visitasDelDia.filter((v) => estado.registros[v.id]?.estado === 'completada').length
  const proxima = visitasDelDia.find((v) => !estado.registros[v.id] || estado.registros[v.id].estado === 'pendiente')

  return (
    <aside aria-label="Resumen de tu jornada" className="relative hidden overflow-hidden bg-ink text-white lg:flex lg:flex-col">
      {/* trama de ruta: la metáfora del día del visitador */}
      <svg aria-hidden="true" className="absolute inset-0 h-full w-full opacity-[0.16]" preserveAspectRatio="xMidYMid slice" viewBox="0 0 600 800">
        <path d="M60 690 C 160 600, 120 520, 240 470 S 420 420, 380 300 S 500 160, 560 90" stroke="#7cc4ee" strokeWidth="2" strokeDasharray="3 10" fill="none" strokeLinecap="round" />
        {[
          [60, 690],
          [240, 470],
          [380, 300],
          [560, 90],
        ].map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="9" fill="none" stroke="#fff" strokeWidth="2" />
        ))}
      </svg>

      <div className="relative flex flex-1 flex-col justify-between p-10 xl:p-14">
        <div className="eyebrow text-white/55 first-letter:uppercase">{fechaLarga()}</div>

        <div>
          <p className="max-w-[18ch] text-[40px] leading-[1.04] font-semibold tracking-[-0.03em] text-balance xl:text-[48px]">
            Tu ruta, tu material y tus muestras en un solo lugar.
          </p>

          <div className="mt-10 grid max-w-md grid-cols-2 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <CalendarRange size={18} aria-hidden="true" className="text-white/60" />
              <div className="num mt-3 text-[28px] leading-none">
                {completadas}
                <span className="text-white/40">/{visitasDelDia.length}</span>
              </div>
              <div className="mt-1.5 text-[13px] text-white/60">visitas de hoy</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
              <MapPin size={18} aria-hidden="true" className="text-white/60" />
              <div className="num mt-3 text-[28px] leading-none">{proxima?.hora ?? '—'}</div>
              <div className="mt-1.5 truncate text-[13px] text-white/60">{proxima ? proxima.medico.nombre : 'Día completo'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/65">
          {Object.values(productos).map((p) => (
            <span key={p.id} className="inline-flex items-center gap-2" translate="no">
              <MonogramaProducto id={p.id} size={18} />
              {p.marca}
            </span>
          ))}
          <span className="inline-flex items-center gap-2">
            <CloudOff size={15} aria-hidden="true" />
            {online ? 'Listo para usar sin conexión' : 'Trabajando sin conexión'}
          </span>
        </div>
      </div>
    </aside>
  )
}

export function Login() {
  const { ingresar } = useSesion()
  const { pendientes } = useDemo()
  const idEmail = useId()
  const idClave = useId()
  const refEmail = useRef<HTMLInputElement>(null)
  const refClave = useRef<HTMLInputElement>(null)
  const [email, setEmail] = useState('')
  const [clave, setClave] = useState('')
  const [verClave, setVerClave] = useState(false)
  const [recordar, setRecordar] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<{ campo: 'email' | 'clave'; mensaje: string } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (enviando) return
    if (!email.trim()) {
      setError({ campo: 'email', mensaje: 'Ingresá tu correo corporativo.' })
      return refEmail.current?.focus()
    }
    if (!clave) {
      setError({ campo: 'clave', mensaje: 'Ingresá tu contraseña.' })
      return refClave.current?.focus()
    }
    setError(null)
    setEnviando(true)
    const r = await ingresar(email, clave, recordar)
    if (!r.ok) {
      setEnviando(false)
      setError({ campo: r.campo, mensaje: r.mensaje })
      ;(r.campo === 'email' ? refEmail : refClave).current?.focus()
    }
  }

  function completar() {
    setEmail(CUENTA_DEMO.email)
    setClave(CUENTA_DEMO.clave)
    setError(null)
  }

  return (
    <div className="grid min-h-dvh bg-surface lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <main className="flex min-h-dvh flex-col px-6 pt-[calc(24px+env(safe-area-inset-top))] pb-[calc(24px+env(safe-area-inset-bottom))] sm:px-10">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <div className="leading-tight">
            <div className="text-[16px] font-semibold text-ink">IO-Pharma</div>
            <div className="text-[12px] text-ink-3">e-detailing y CRM para laboratorios</div>
          </div>
        </div>

        <div className="mx-auto my-auto w-full max-w-[400px] py-10">
          <h1 className="text-[32px] leading-[1.08] font-semibold text-ink sm:text-[36px]">Ingresá a tu cuenta</h1>
          <p className="mt-2 text-[15px] text-ink-3">
            {apm.laboratorio} · {apm.zona}
          </p>

          <form className="mt-8 flex flex-col gap-5" onSubmit={onSubmit} noValidate>
            <div>
              <label htmlFor={idEmail} className="mb-1.5 block text-[14px] font-medium text-ink">
                Correo corporativo
              </label>
              <input
                ref={refEmail}
                id={idEmail}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error?.campo === 'email') setError(null)
                }}
                placeholder="nombre@laboratorio.com…"
                aria-invalid={error?.campo === 'email'}
                aria-describedby={error?.campo === 'email' ? `${idEmail}-error` : undefined}
                className={`field min-h-12 ${error?.campo === 'email' ? 'border-bad' : ''}`}
              />
              {error?.campo === 'email' && (
                <p id={`${idEmail}-error`} className="mt-1.5 text-[13px] text-bad">
                  {error.mensaje}
                </p>
              )}
            </div>

            <div>
              <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <label htmlFor={idClave} className="text-[14px] font-medium text-ink">
                  Contraseña
                </label>
                <span className="text-[13px] text-ink-3">¿Olvidaste la clave? Pedila a tu supervisor</span>
              </div>
              <div className="relative">
                <input
                  ref={refClave}
                  id={idClave}
                  name="password"
                  type={verClave ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={clave}
                  onChange={(e) => {
                    setClave(e.target.value)
                    if (error?.campo === 'clave') setError(null)
                  }}
                  aria-invalid={error?.campo === 'clave'}
                  aria-describedby={error?.campo === 'clave' ? `${idClave}-error` : undefined}
                  className={`field min-h-12 pr-12 ${error?.campo === 'clave' ? 'border-bad' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setVerClave((v) => !v)}
                  aria-label={verClave ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  aria-pressed={verClave}
                  className="btn-icon absolute top-1/2 right-0.5 -translate-y-1/2"
                >
                  {verClave ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
                </button>
              </div>
              {error?.campo === 'clave' && (
                <p id={`${idClave}-error`} className="mt-1.5 text-[13px] text-bad">
                  {error.mensaje}
                </p>
              )}
            </div>

            <label className="flex min-h-11 cursor-pointer items-center gap-3 text-[14px] text-ink-2">
              <input type="checkbox" name="recordar" checked={recordar} onChange={(e) => setRecordar(e.target.checked)} className="size-5 cursor-pointer accent-ink" />
              Mantener la sesión en esta tablet
            </label>

            <button type="submit" className="btn-primary min-h-12 w-full text-[16px]" disabled={enviando}>
              {enviando ? (
                <>
                  <span aria-hidden="true" className="spinner size-4 rounded-full border-2 border-white/30 border-t-white" />
                  Ingresando…
                </>
              ) : (
                <>
                  Ingresar
                  <ArrowRight size={18} aria-hidden="true" />
                </>
              )}
            </button>
            <p aria-live="polite" className="sr-only">
              {enviando ? 'Verificando credenciales…' : ''}
            </p>
          </form>

          <section aria-labelledby="titulo-cuenta-demo" className="mt-8 rounded-2xl border border-dashed border-line-2 bg-sunken p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface text-ink-2">
                <KeyRound size={17} aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id="titulo-cuenta-demo" className="text-[14px] font-semibold text-ink">
                  Cuenta de demostración
                </h2>
                <dl className="mt-1.5 grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-0.5 text-[13px]">
                  <dt className="text-ink-3">Correo</dt>
                  <dd className="num truncate text-ink-2" translate="no">
                    {CUENTA_DEMO.email}
                  </dd>
                  <dt className="text-ink-3">Clave</dt>
                  <dd className="num text-ink-2" translate="no">
                    {CUENTA_DEMO.clave}
                  </dd>
                </dl>
              </div>
            </div>
            <button type="button" onClick={completar} className="btn-secondary mt-3 w-full">
              Completar datos
            </button>
          </section>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-[12px] text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck size={14} aria-hidden="true" />
            Demo sin datos reales de pacientes ni médicos
          </span>
          {pendientes > 0 && (
            <span className="inline-flex items-center gap-1.5 text-warn">
              <Lock size={13} aria-hidden="true" />
              <span className="num">{pendientes}</span> movimientos guardados en esta tablet
            </span>
          )}
        </footer>
      </main>

      <VistaPreviaDia />
    </div>
  )
}
