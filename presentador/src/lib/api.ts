import { visitasDelDia } from '../data/agenda'
import { apmPorId, diasSinVisita, entregasHistoricas, medicos, participacion, variacion } from '../data/crm'
import type { EstadoDemo } from '../state/demo'
import type { TipoOutbox } from '../types'

/*
 * Contrato público de la plataforma (API-first). Cada acción de la app es una llamada
 * a esta misma API: la app móvil no tiene privilegios que un ERP integrado no tenga.
 */

export const operacionOutbox: Record<TipoOutbox, { metodo: 'POST' | 'PATCH'; ruta: string; evento: string }> = {
  checkin: { metodo: 'POST', ruta: '/v1/visits/{id}/check-in', evento: 'visit.checked_in' },
  checkout: { metodo: 'PATCH', ruta: '/v1/visits/{id}', evento: 'visit.closed' },
  pedido: { metodo: 'POST', ruta: '/v1/sample-deliveries', evento: 'sample.delivered' },
  envio: { metodo: 'POST', ruta: '/v1/content-shares', evento: 'content.shared' },
  firma: { metodo: 'POST', ruta: '/v1/signatures', evento: 'signature.captured' },
  voz: { metodo: 'POST', ruta: '/v1/voice-reports', evento: 'voice_report.processed' },
  farmacovigilancia: { metodo: 'POST', ruta: '/v1/adverse-events', evento: 'adverse_event.reported' },
  plan: { metodo: 'POST', ruta: '/v1/visit-plans', evento: 'visit_plan.created' },
  pieza: { metodo: 'PATCH', ruta: '/v1/content/{id}', evento: 'content.published' },
}

export interface Endpoint {
  id: string
  metodo: 'GET' | 'POST' | 'PATCH'
  ruta: string
  resumen: string
  grupo: 'Fichero médico' | 'Visitas' | 'Muestras e inventario' | 'IA' | 'Eventos'
  cuerpo?: unknown
  respuesta: (estado: EstadoDemo) => unknown
}

const iso = (ts: number) => new Date(ts).toISOString()

function hcp(m: (typeof medicos)[number], estado: EstadoDemo) {
  return {
    id: m.id,
    name: m.nombre,
    specialty: m.especialidad,
    license: m.matricula,
    segment: m.categoria,
    institution: m.institucion,
    territory: m.zona,
    rep_id: m.apmId,
    consent: { whatsapp: m.consentimiento.whatsapp, email: m.consentimiento.email },
    metrics: {
      days_since_visit: diasSinVisita(m, estado.registros),
      rx_change_qoq: Number(variacion(m).toFixed(3)),
      market_share: Number(participacion(m).toFixed(3)),
    },
    external_ids: { salesforce: `001Dn00000${m.id.slice(1).padStart(5, '0')}AAA`, sap_bp: `10${m.id.slice(1).padStart(6, '0')}` },
  }
}

export const endpoints: Endpoint[] = [
  {
    id: 'hcps',
    metodo: 'GET',
    ruta: '/v1/hcps?territory=Norte&limit=2',
    resumen: 'Lista paginada del fichero médico, filtrable por territorio, segmento y fecha de cambio',
    grupo: 'Fichero médico',
    respuesta: (e) => ({
      data: medicos.filter((m) => m.zona === 'Norte').slice(0, 2).map((m) => hcp(m, e)),
      next_cursor: 'eyJpZCI6Im0yIn0',
    }),
  },
  {
    id: 'hcp',
    metodo: 'GET',
    ruta: '/v1/hcps/m4',
    resumen: 'Ficha completa de un profesional con métricas de prescripción y consentimientos',
    grupo: 'Fichero médico',
    respuesta: (e) => hcp(medicos.find((m) => m.id === 'm4')!, e),
  },
  {
    id: 'visits',
    metodo: 'GET',
    ruta: '/v1/visits?updated_since=2026-01-01T00:00:00Z',
    resumen: 'Sincronización delta: solo lo que cambió desde la última consulta',
    grupo: 'Visitas',
    respuesta: (e) => ({
      data: visitasDelDia
        .filter((v) => e.registros[v.id])
        .map((v) => {
          const r = e.registros[v.id]
          return {
            id: v.id,
            hcp_id: v.medicoId,
            status: r.estado,
            check_in: r.checkIn ? { at: iso(r.checkIn), distance_m: r.distanciaCheckIn } : null,
            check_out: r.checkOut ? iso(r.checkOut) : null,
            rating: r.calificacion ?? null,
            tags: r.etiquetas ?? [],
            samples_units: r.muestras ?? 0,
            source: r.origen ?? 'manual',
            signature: r.firma ? (r.firma === 'papel' ? 'paper' : 'digital') : null,
          }
        }),
      next_cursor: null,
    }),
  },
  {
    id: 'visit-close',
    metodo: 'PATCH',
    ruta: '/v1/visits/v4',
    resumen: 'Cierra una visita. Idempotente: el mismo Idempotency-Key nunca duplica registros',
    grupo: 'Visitas',
    cuerpo: { status: 'completed', rating: 4, tags: ['Objeción de cobertura'], notes: 'Próximo paso: volver en dos semanas', signature_id: 'sig_8f2c' },
    respuesta: () => ({ id: 'v4', status: 'completed', version: 3, synced_at: new Date().toISOString() }),
  },
  {
    id: 'deliveries',
    metodo: 'POST',
    ruta: '/v1/sample-deliveries',
    resumen: 'Registra una entrega de muestras por lote; descuenta stock y exige firma',
    grupo: 'Muestras e inventario',
    cuerpo: { visit_id: 'v4', hcp_id: 'm4', items: [{ sku: 'DM-MM-7', lot: 'DM2408A', quantity: 6 }], signature_id: 'sig_8f2c' },
    respuesta: (e) => {
      const ultima = e.entregas[0] ?? entregasHistoricas[0]
      return { id: ultima.id, hcp_id: ultima.medicoId, sku: ultima.sku, lot: ultima.lote, expiry: ultima.vencimiento, quantity: ultima.cantidad, signature: ultima.firma, erp_document: '4900012873' }
    },
  },
  {
    id: 'inventory',
    metodo: 'GET',
    ruta: '/v1/inventory?rep_id=apm1',
    resumen: 'Stock asignado al representante, con lote y vencimiento (espejo de SAP MM)',
    grupo: 'Muestras e inventario',
    respuesta: (e) => ({
      rep_id: 'apm1',
      as_of: iso(e.stockActualizado),
      items: e.stock.slice(0, 4).map((s) => ({ sku: s.sku, type: s.tipo, units: s.unidades, lot: s.lote ?? null, expiry: s.vencimiento ?? null })),
    }),
  },
  {
    id: 'voice',
    metodo: 'POST',
    ruta: '/v1/voice-reports',
    resumen: 'Sube el audio de un reporte y devuelve los campos estructurados del CRM',
    grupo: 'IA',
    cuerpo: { visit_id: 'v4', audio_url: 'upload://rep-audio/9d1e.m4a', language: 'es-AR' },
    respuesta: () => ({
      id: 'vr_9d1e',
      status: 'processed',
      extracted: {
        hcp_id: 'm4',
        products: ['cardio'],
        samples: [{ sku: 'DM-MM-7', quantity: 6 }],
        rating: 3,
        tags: ['Objeción de cobertura', 'Pidió estudios', 'Volver en 15 días'],
        next_step: 'Volver en dos semanas con la información de cobertura',
        adverse_event: { detected: true, excerpt: 'un paciente tuvo dolor muscular leve' },
      },
      requires_review: true,
    }),
  },
  {
    id: 'insights',
    metodo: 'POST',
    ruta: '/v1/insights/query',
    resumen: 'Pregunta en lenguaje natural; responde datos, la consulta generada y sus fuentes',
    grupo: 'IA',
    cuerpo: { question: '¿Qué médicos bajaron su prescripción y no fueron visitados?' },
    respuesta: (e) => {
      const filas = medicos.filter((m) => variacion(m) < -0.05 && diasSinVisita(m, e.registros) > 30)
      return {
        answer: `${filas.length} médicos bajaron su prescripción y no reciben visita hace más de 30 días.`,
        rows: filas.slice(0, 3).map((m) => ({ hcp_id: m.id, name: m.nombre, rx_change_qoq: Number(variacion(m).toFixed(3)), days_since_visit: diasSinVisita(m, e.registros), rep: apmPorId(m.apmId).nombre })),
        sources: ['rx_audit', 'visits', 'hcp'],
        sql_hash: 'a41f09',
      }
    },
  },
  {
    id: 'webhooks',
    metodo: 'POST',
    ruta: '/v1/webhooks',
    resumen: 'Suscripción a eventos firmados con HMAC-SHA256 para ERPs y CRMs externos',
    grupo: 'Eventos',
    cuerpo: { url: 'https://erp.laboratorio.com/hooks/iopharma', events: ['visit.closed', 'sample.delivered', 'adverse_event.reported'] },
    respuesta: () => ({ id: 'wh_31c7', secret: 'whsec_••••••••', status: 'active' }),
  },
]
