import { useState } from 'react'
import { ArrowLeftRight, CheckCircle2, Copy, FileJson, KeyRound, Play, RefreshCw, Webhook } from 'lucide-react'
import { Sheet } from '../components/Sheet'
import { EncabezadoPantalla } from '../components/ui'
import { endpoints, operacionOutbox, type Endpoint } from '../lib/api'
import { hora } from '../lib/formato'
import { useDemo } from '../state/demo'

interface Conector {
  id: string
  nombre: string
  sistema: string
  iniciales: string
  color: string
  estado: 'conectado' | 'disponible'
  sentido: string
  protocolo: string
  frecuencia: string
  registros: string
  mapeo: [app: string, externo: string, nota?: string][]
}

const conectores: Conector[] = [
  {
    id: 'sap',
    nombre: 'SAP S/4HANA',
    sistema: 'ERP · materiales, stock y lotes',
    iniciales: 'SAP',
    color: '#0a6ed1',
    estado: 'conectado',
    sentido: 'Stock y lotes entran · entregas salen',
    protocolo: 'OData v4 + IDoc MBGMCR',
    frecuencia: 'Stock cada 15 min · entregas en tiempo real',
    registros: '11 SKU · 4 lotes vigentes',
    mapeo: [
      ['sample.sku', 'MARA-MATNR', 'Material'],
      ['sample.lot', 'MCHA-CHARG', 'Lote'],
      ['sample.expiry', 'MCHA-VFDAT', 'Vencimiento'],
      ['inventory.units', 'MARD-LABST', 'Stock libre utilización'],
      ['rep.storage_location', 'MARD-LGORT', 'Almacén del representante'],
      ['delivery.id', 'MKPF-MBLNR', 'Documento de material (mov. 201)'],
    ],
  },
  {
    id: 'sfdc',
    nombre: 'Salesforce',
    sistema: 'Life Sciences Cloud · cuentas y visitas',
    iniciales: 'SF',
    color: '#00a1e0',
    estado: 'conectado',
    sentido: 'Bidireccional',
    protocolo: 'REST + Change Data Capture',
    frecuencia: 'Tiempo real por eventos',
    registros: '36 médicos · 214 visitas',
    mapeo: [
      ['hcp.id', 'Account.External_Id__c'],
      ['hcp.specialty', 'Account.Specialty__c'],
      ['hcp.segment', 'Account.Segment__c', 'Categoría A/B/C'],
      ['visit.status', 'Visit.Status'],
      ['visit.rating', 'Visit.Receptivity__c'],
      ['visit.tags', 'Visit.Feedback__c', 'Selección múltiple'],
      ['voice_report.transcript', 'Visit.Voice_Transcript__c', 'Texto largo'],
    ],
  },
  {
    id: 'audit',
    nombre: 'Auditoría de prescripciones',
    sistema: 'Close-Up / IQVIA · mercado farmacéutico',
    iniciales: 'Rx',
    color: '#5b3fa6',
    estado: 'conectado',
    sentido: 'Entra',
    protocolo: 'SFTP · CSV mensual',
    frecuencia: 'Mensual, día 12',
    registros: '6 meses · 2 clases terapéuticas',
    mapeo: [
      ['rx_audit.hcp_license', 'MATRICULA', 'Cruce por matrícula'],
      ['rx_audit.product_id', 'PRODUCTO_ID'],
      ['rx_audit.month', 'PERIODO', 'AAAAMM'],
      ['rx_audit.units', 'RECETAS'],
    ],
  },
  {
    id: 'entra',
    nombre: 'Microsoft Entra ID',
    sistema: 'Identidad corporativa · SSO',
    iniciales: 'ID',
    color: '#0b1220',
    estado: 'conectado',
    sentido: 'Autenticación',
    protocolo: 'OpenID Connect + SCIM 2.0',
    frecuencia: 'Altas y bajas en tiempo real',
    registros: '4 APM · 1 gerente',
    mapeo: [
      ['user.email', 'userPrincipalName'],
      ['user.role', 'appRoles', 'apm · gerente · admin'],
      ['user.territory', 'extension_territory'],
    ],
  },
  {
    id: 'veeva',
    nombre: 'Veeva CRM',
    sistema: 'Alternativa a Salesforce',
    iniciales: 'V',
    color: '#f7931e',
    estado: 'disponible',
    sentido: 'Bidireccional',
    protocolo: 'Veeva REST API',
    frecuencia: 'Configurable',
    registros: '—',
    mapeo: [
      ['hcp.id', 'Account.Id'],
      ['visit.id', 'Call2_vod__c.Id'],
      ['sample.lot', 'Sample_Lot_vod__c.Name'],
    ],
  },
  {
    id: 'bi',
    nombre: 'Data warehouse',
    sistema: 'Snowflake · BigQuery · Power BI',
    iniciales: 'DW',
    color: '#29b5e8',
    estado: 'disponible',
    sentido: 'Sale',
    protocolo: 'Export incremental Parquet',
    frecuencia: 'Cada hora',
    registros: '—',
    mapeo: [
      ['visits', 'fact_visits'],
      ['sample_deliveries', 'fact_sample_deliveries'],
      ['hcp', 'dim_hcp'],
    ],
  },
]

const colorMetodo = { GET: 'bg-ok-soft text-ok', POST: 'bg-accent-soft text-accent', PATCH: 'bg-warn-soft text-warn' }

function Metodo({ m }: { m: Endpoint['metodo'] }) {
  return <span className={`num inline-flex w-14 shrink-0 justify-center rounded-md py-0.5 text-[11px] font-semibold ${colorMetodo[m]}`}>{m}</span>
}

export function Integraciones() {
  const { estado, avisar } = useDemo()
  const [conector, setConector] = useState<Conector | null>(null)
  const [endpointId, setEndpointId] = useState(endpoints[0].id)
  const [ejecucion, setEjecucion] = useState<{ id: string; ms: number } | null>(null)
  const [probando, setProbando] = useState(false)

  const ep = endpoints.find((e) => e.id === endpointId)!
  const eventos = estado.outbox.filter((o) => o.sincronizado).slice(0, 6)
  const curl = [
    `curl -X ${ep.metodo} https://api.iopharma.app${ep.ruta} \\`,
    `  -H "Authorization: Bearer $TOKEN" \\`,
    ...(ep.metodo !== 'GET' ? [`  -H "Idempotency-Key: $(uuidgen)" \\`, `  -H "Content-Type: application/json" \\`, `  -d '${JSON.stringify(ep.cuerpo)}'`] : [`  -H "Accept: application/json"`]),
  ].join('\n')

  function probar() {
    setProbando(true)
    const ms = 80 + Math.round(Math.random() * 90)
    window.setTimeout(() => {
      setProbando(false)
      setEjecucion({ id: ep.id, ms })
    }, 450)
  }

  return (
    <>
      <EncabezadoPantalla
        eyebrow="API-first"
        titulo="Integraciones"
        descripcion="La app usa la misma API pública que cualquier sistema del laboratorio. Conectar un ERP o un CRM es configurar, no desarrollar."
        acciones={
          <a href={`${import.meta.env.BASE_URL}openapi.json`} target="_blank" rel="noreferrer" className="btn-secondary">
            <FileJson size={16} aria-hidden="true" />
            Especificación OpenAPI 3.1
          </a>
        }
      />

      <section aria-labelledby="titulo-conectores">
        <h2 id="titulo-conectores" className="eyebrow mb-3">
          Conectores
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {conectores.map((c) => (
            <li key={c.id}>
              <button type="button" onClick={() => setConector(c)} className="press card flex h-full w-full cursor-pointer flex-col gap-3 p-4 text-left hover:border-line-2 hover:shadow-(--shadow-float)">
                <span className="flex items-center gap-3">
                  <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center rounded-xl text-[13px] font-bold text-white" style={{ background: c.color }}>
                    {c.iniciales}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-semibold text-ink">{c.nombre}</span>
                    <span className="block truncate text-[13px] text-ink-3">{c.sistema}</span>
                  </span>
                  {c.estado === 'conectado' ? (
                    <span className="chip border-transparent bg-ok-soft text-ok">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Conectado
                    </span>
                  ) : (
                    <span className="chip">Disponible</span>
                  )}
                </span>
                <span className="flex flex-col gap-1 text-[13px] text-ink-2">
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight size={13} aria-hidden="true" className="text-ink-3" />
                    {c.sentido}
                  </span>
                  <span className="num text-[12px] text-ink-3">{c.protocolo}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="titulo-api" className="mt-8">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="titulo-api" className="eyebrow">
            Explorador de la API · datos reales de esta demo
          </h2>
          <span className="flex items-center gap-1.5 text-[12px] text-ink-3">
            <KeyRound size={13} aria-hidden="true" />
            OAuth 2.0 client credentials · versionada en /v1
          </span>
        </div>
        <div className="card grid overflow-hidden lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <ul className="flex max-h-[520px] flex-col overflow-y-auto border-b border-line lg:border-r lg:border-b-0" aria-label="Endpoints">
            {endpoints.map((e, i) => (
              <li key={e.id}>
                {(i === 0 || endpoints[i - 1].grupo !== e.grupo) && <div className="px-4 pt-3 pb-1 text-[11px] font-semibold tracking-wide text-ink-3 uppercase">{e.grupo}</div>}
                <button
                  type="button"
                  aria-pressed={e.id === endpointId}
                  onClick={() => {
                    setEndpointId(e.id)
                    setEjecucion(null)
                  }}
                  className={`press flex w-full cursor-pointer items-center gap-2.5 px-4 py-2.5 text-left ${e.id === endpointId ? 'bg-sunken' : 'hover:bg-sunken/60'}`}
                >
                  <Metodo m={e.metodo} />
                  <span className="num min-w-0 truncate text-[13px] text-ink" translate="no">
                    {e.ruta.split('?')[0]}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          <div className="min-w-0 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <Metodo m={ep.metodo} />
              <code className="num min-w-0 text-[14px] break-all text-ink">{ep.ruta}</code>
            </div>
            <p className="mt-2 text-[14px] text-ink-2">{ep.resumen}</p>

            <div className="mt-4 overflow-hidden rounded-xl bg-stage">
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-[12px] text-white/60">
                Solicitud
                <button
                  type="button"
                  className="press inline-flex min-h-8 cursor-pointer items-center gap-1.5 rounded-md px-2 text-white/75 hover:bg-white/10 hover:text-white"
                  onClick={() => {
                    void navigator.clipboard?.writeText(curl).then(
                      () => avisar('Comando copiado', 'info'),
                      () => undefined,
                    )
                  }}
                >
                  <Copy size={13} aria-hidden="true" />
                  Copiar
                </button>
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-[12px] leading-relaxed text-[#c9d6e3]" translate="no">
                <code>{curl}</code>
              </pre>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button type="button" className="btn-primary" onClick={probar} disabled={probando}>
                {probando ? <RefreshCw size={16} aria-hidden="true" className="spinner" /> : <Play size={16} aria-hidden="true" />}
                Probar
              </button>
              {ejecucion?.id === ep.id && (
                <span className="num inline-flex items-center gap-2 text-[13px]" aria-live="polite">
                  <span className="rounded-md bg-ok-soft px-1.5 py-0.5 font-semibold text-ok">{ep.metodo === 'POST' ? '201 Created' : '200 OK'}</span>
                  <span className="text-ink-3">{ejecucion.ms} ms</span>
                </span>
              )}
            </div>

            {ejecucion?.id === ep.id && (
              <pre className="animate-entrar mt-3 max-h-80 overflow-auto rounded-xl border border-line bg-sunken/60 p-4 font-mono text-[12px] leading-relaxed text-ink-2" translate="no">
                <code>{JSON.stringify(ep.respuesta(estado), null, 2)}</code>
              </pre>
            )}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="titulo-eventos" className="card overflow-hidden">
          <h2 id="titulo-eventos" className="flex items-center gap-2 border-b border-line px-5 py-4 text-[16px] font-semibold text-ink">
            <Webhook size={17} aria-hidden="true" className="text-ink-3" />
            Webhooks emitidos
          </h2>
          {eventos.length === 0 ? (
            <p className="px-5 py-10 text-center text-[14px] text-ink-3">Cuando hagas un check-in o cierres una visita, el evento aparece acá.</p>
          ) : (
            <ul className="divide-y divide-line">
              {eventos.map((o) => (
                <li key={o.id} className="flex items-center gap-3 px-5 py-3">
                  <span className="num w-12 shrink-0 text-[12px] text-ink-3">{hora(o.sincronizado!)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="num block truncate text-[13px] font-medium text-ink" translate="no">
                      {operacionOutbox[o.tipo].evento}
                    </span>
                    <span className="block truncate text-[12px] text-ink-3">{o.resumen}</span>
                  </span>
                  <span className="chip border-transparent bg-ok-soft text-ok">3 destinos · 200</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section aria-labelledby="titulo-principios" className="card p-5">
          <h2 id="titulo-principios" className="text-[16px] font-semibold text-ink">
            Diseñada para integrarse
          </h2>
          <ul className="mt-3 grid gap-3 text-[14px] sm:grid-cols-2">
            {[
              ['Contrato primero', 'OpenAPI 3.1 publicado; la app y los ERPs usan los mismos endpoints.'],
              ['Sincronización delta', 'updated_since y cursores: cada sistema pide solo lo que cambió.'],
              ['Idempotencia', 'Idempotency-Key en cada escritura: los reintentos offline nunca duplican.'],
              ['Eventos firmados', 'Webhooks con HMAC-SHA256, reintentos exponenciales y registro de entregas.'],
              ['IDs externos', 'Cada registro guarda su ID de SAP, Salesforce o Veeva para conciliar.'],
              ['Seguridad', 'OAuth 2.0, scopes por recurso, auditoría completa y datos cifrados.'],
            ].map(([t, d]) => (
              <li key={t}>
                <span className="block font-semibold text-ink">{t}</span>
                <span className="block text-[13px] leading-relaxed text-ink-3">{d}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <Sheet abierto={Boolean(conector)} onCerrar={() => setConector(null)} titulo={conector?.nombre ?? ''} subtitulo={<span className="eyebrow">{conector?.sistema}</span>} ancho="520px">
        {conector && (
          <div className="flex flex-col gap-5">
            <dl className="grid grid-cols-2 gap-3 text-[13px]">
              {[
                ['Estado', conector.estado === 'conectado' ? 'Conectado' : 'Disponible para activar'],
                ['Sentido', conector.sentido],
                ['Protocolo', conector.protocolo],
                ['Frecuencia', conector.frecuencia],
                ['Registros', conector.registros],
              ].map(([t, v]) => (
                <div key={t} className="rounded-xl bg-sunken px-3 py-2.5">
                  <dt className="text-[12px] text-ink-3">{t}</dt>
                  <dd className="mt-0.5 font-medium text-ink">{v}</dd>
                </div>
              ))}
            </dl>
            <div>
              <h3 className="eyebrow mb-2">Mapeo de campos</h3>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-sunken/60 text-[12px] text-ink-3">
                    <tr>
                      <th scope="col" className="px-3 py-2 font-medium">IO-Pharma</th>
                      <th scope="col" className="px-3 py-2 font-medium">{conector.nombre}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {conector.mapeo.map(([a, b, nota]) => (
                      <tr key={a}>
                        <td className="num px-3 py-2 text-ink" translate="no">
                          {a}
                        </td>
                        <td className="px-3 py-2">
                          <span className="num block text-ink" translate="no">
                            {b}
                          </span>
                          {nota && <span className="block text-[12px] text-ink-3">{nota}</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <button
              type="button"
              className="btn-secondary self-start"
              onClick={() => avisar(conector.estado === 'conectado' ? `Conexión con ${conector.nombre} verificada` : `Solicitud de activación de ${conector.nombre} enviada`, conector.estado === 'conectado' ? 'ok' : 'info')}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              {conector.estado === 'conectado' ? 'Probar conexión' : 'Solicitar activación'}
            </button>
          </div>
        )}
      </Sheet>
    </>
  )
}
