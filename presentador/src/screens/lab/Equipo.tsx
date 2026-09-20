import { useRef, useState } from 'react'
import { BadgeCheck, GraduationCap, MapPin, Upload, UserPlus, Users } from 'lucide-react'
import { Avatar } from '../../components/crm'
import { EncabezadoPantalla, Kpi, MonogramaProducto, NumeroAnimado } from '../../components/ui'
import { cursos } from '../../data/academia'
import { APM_ACTUAL, diasSinVisita, equipo, medicos, umbralDias, visitas90 } from '../../data/crm'
import { useAcademia } from '../../state/academia'
import { useDemo } from '../../state/demo'

export function Equipo() {
  const { estado, avisar } = useDemo()
  const { estado: academia } = useAcademia()
  const archivo = useRef<HTMLInputElement>(null)
  const [importado, setImportado] = useState(false)

  const filas = equipo.map((a) => {
    const cartera = medicos.filter((m) => m.apmId === a.id)
    const alDia = cartera.filter((m) => diasSinVisita(m, estado.registros) <= umbralDias[m.categoria]).length
    // en la demo solo el visitador de la sesión tiene progreso real de capacitación
    const certificados = a.id === APM_ACTUAL ? cursos.filter((c) => academia.progreso[c.id]?.certificado).length : cursos.length - (a.id === 'apm3' ? 1 : 0)
    return {
      apm: a,
      medicos: cartera.length,
      cobertura: cartera.length ? alDia / cartera.length : 0,
      visitas: cartera.reduce((acc, m) => acc + visitas90(m, estado.registros), 0),
      certificados,
    }
  })

  const pendientes = filas.filter((f) => f.certificados < cursos.length).length

  return (
    <>
      <EncabezadoPantalla
        eyebrow="Portal del laboratorio"
        titulo="Equipo y territorios"
        descripcion="Quién está en la calle, qué territorio cubre y si tiene la capacitación al día. Sin el curso aprobado, la app no lo deja presentar ese producto."
        acciones={
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-secondary" onClick={() => archivo.current?.click()}>
              <Upload size={16} aria-hidden="true" />
              Importar padrón médico
            </button>
            <button type="button" className="btn-primary" onClick={() => avisar('En la demo el alta de usuarios está simulada', 'info')}>
              <UserPlus size={17} aria-hidden="true" />
              Invitar visitador
            </button>
          </div>
        }
      />

      <input
        ref={archivo}
        type="file"
        accept=".csv,.xlsx"
        className="sr-only"
        aria-hidden="true"
        tabIndex={-1}
        onChange={() => {
          setImportado(true)
          avisar('Padrón leído · 36 médicos en 4 territorios')
        }}
      />

      {importado && (
        <div role="status" className="animate-entrar mb-5 flex flex-wrap items-center gap-4 rounded-2xl border border-ok/25 bg-ok-soft p-4">
          <BadgeCheck size={20} aria-hidden="true" className="shrink-0 text-ok" />
          <p className="min-w-0 flex-1 text-[14px] leading-relaxed text-ink-2">
            <strong className="font-semibold text-ink">Padrón leído: 36 médicos en 4 territorios.</strong> Se detectaron 3 matrículas repetidas y 1 sin especialidad; en el
            producto real se resuelven antes de confirmar la importación.
          </p>
          <button type="button" className="btn-secondary" onClick={() => setImportado(false)}>
            Cerrar
          </button>
        </div>
      )}

      <dl className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi orden={0} etiqueta="Visitadores activos" Icono={Users} valor={<NumeroAnimado valor={equipo.length} />} detalle="Con licencia asignada" />
        <Kpi orden={1} etiqueta="Médicos en el padrón" valor={<NumeroAnimado valor={medicos.length} />} detalle="Repartidos en 4 territorios" />
        <Kpi
          orden={2}
          etiqueta="Cobertura del equipo"
          Icono={MapPin}
          valor={<NumeroAnimado valor={Math.round((filas.reduce((a, f) => a + f.cobertura, 0) / filas.length) * 100)} />}
          unidad="%"
          detalle="Médicos dentro de su frecuencia"
        />
        <Kpi orden={3} etiqueta="Capacitación pendiente" Icono={GraduationCap} valor={<NumeroAnimado valor={pendientes} />} detalle="Visitadores sin todos los cursos" />
      </dl>

      <section aria-label="Equipo de campo" className="card overflow-hidden">
        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] gap-4 border-b border-line bg-sunken/60 px-5 py-2.5 text-[12px] font-medium text-ink-3 lg:grid">
          <span>Visitador</span>
          <span>Territorio</span>
          <span>Médicos</span>
          <span>Cobertura</span>
          <span>Capacitación</span>
        </div>
        <ul className="divide-y divide-line">
          {filas.map(({ apm, medicos: cartera, cobertura, certificados }, i) => (
            <li
              key={apm.id}
              className="entra-fila grid grid-cols-1 gap-x-4 gap-y-2 px-4 py-3.5 sm:px-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.4fr)] lg:items-center"
              style={{ ['--orden' as string]: i }}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar nombre={apm.nombre} />
                <span className="min-w-0">
                  <span className="block truncate text-[15px] font-semibold text-ink">{apm.nombre}</span>
                  <span className="block truncate text-[13px] text-ink-3">
                    {apm.id === APM_ACTUAL ? 'Sesión de la demo' : 'Visitador médico'}
                  </span>
                </span>
              </span>
              <span className="pl-[52px] text-[14px] text-ink-2 lg:pl-0">Zona {apm.zona}</span>
              <span className="num pl-[52px] text-[14px] text-ink-2 lg:pl-0">{cartera}</span>
              <span className="pl-[52px] lg:pl-0">
                <span className="num text-[14px] font-medium text-ink">{Math.round(cobertura * 100)} %</span>
                <span aria-hidden="true" className="mt-1 block h-1.5 w-full max-w-28 overflow-hidden rounded-full bg-sunken">
                  <span className="block h-full rounded-full bg-ink" style={{ width: `${cobertura * 100}%` }} />
                </span>
              </span>
              <span className="flex flex-wrap items-center gap-1.5 pl-[52px] lg:pl-0">
                {cursos.map((c, idx) => {
                  const ok = idx < certificados
                  return (
                    <span
                      key={c.id}
                      className={`chip ${ok ? 'border-transparent bg-ok-soft text-ok' : 'border-transparent bg-warn-soft text-warn'}`}
                      title={`${c.titulo}: ${ok ? 'certificado' : 'pendiente'}`}
                    >
                      {c.productoId ? <MonogramaProducto id={c.productoId} size={12} /> : <GraduationCap size={12} aria-hidden="true" />}
                      {ok ? 'Certificado' : 'Pendiente'}
                    </span>
                  )
                })}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-4 text-[12px] leading-relaxed text-ink-3">
        En producción los usuarios se crean desde el directorio corporativo del laboratorio: el alta y la baja son automáticas, y al dar de baja a alguien la tablet
        deja de sincronizar en el acto.
      </p>
    </>
  )
}
