import type { ContentNode } from '../types'

// Contenido cargado a mano para la demo del MVP (HU-C2: en producción esto vive en Supabase, no en código).
export const arbolDemo: ContentNode = {
  id: 'root',
  titulo: 'Demo-molécula 20mg',
  tipo: 'imagen',
  url: '',
  children: [
    {
      id: 'packaging',
      titulo: 'Presentación del producto',
      tipo: 'imagen',
      url: '/content/packaging.svg',
      hotspots: [
        {
          id: 'hs-posologia',
          x: 0.375,
          y: 0.783,
          ancho: 0.25,
          alto: 0.04,
          accion: {
            tipo: 'abrir_popup',
            titulo: 'Posología',
            texto: '1 comprimido cada 12hs, con o sin alimentos. Consultar ficha técnica completa para dosis en pacientes con insuficiencia renal.',
          },
        },
      ],
    },
    {
      id: 'eficacia',
      titulo: 'Estudio de eficacia',
      tipo: 'imagen',
      url: '/content/eficacia.svg',
      hotspots: [
        {
          id: 'hs-video',
          x: 0.75,
          y: 0.2,
          ancho: 0.1875,
          alto: 0.1,
          accion: {
            tipo: 'abrir_popup',
            titulo: 'Video del estudio',
            texto: '(demo) Acá se reproduciría el video del estudio clínico. La acción "reproducir_video" ya está soportada por el visor; falta cargar un archivo de video real.',
          },
        },
      ],
    },
    {
      id: 'ficha-tecnica',
      titulo: 'Ficha técnica (PDF)',
      tipo: 'pdf',
      url: '/content/ficha-tecnica.pdf',
    },
  ],
}
