export type NodeTipo = 'pdf' | 'imagen' | 'video'

export interface Hotspot {
  id: string
  // coordenadas normalizadas 0-1 relativas al contenido, para ser responsive
  x: number
  y: number
  ancho: number
  alto: number
  accion:
    | { tipo: 'abrir_popup'; titulo: string; texto: string }
    | { tipo: 'reproducir_video'; url: string }
}

export interface ContentNode {
  id: string
  titulo: string
  tipo: NodeTipo
  url: string
  hotspots?: Hotspot[]
  children?: ContentNode[]
  /** color de marca de la línea de producto, usado en la barra de tabs y acentos (solo en nodos con children) */
  color?: string
}

export interface DwellEvent {
  nodoId: string
  apmId: string
  timestampInicio: number
  timestampFin: number
  sincronizado: boolean
}
