import type { ContentNode } from '../types'

// Contenido cargado a mano para la demo del MVP (HU-C2: en producción esto vive en Supabase, no en código).
// Dos líneas de producto genéricas, para que el árbol se vea como un catálogo real y no un único ítem suelto.
export const arbolDemo: ContentNode = {
  id: 'root',
  titulo: 'Laboratorio Demo S.A.',
  tipo: 'imagen',
  url: '',
  children: [
    {
      id: 'linea-a',
      titulo: 'Línea Cardio — Demo-molécula',
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
    },
    {
      id: 'linea-b',
      titulo: 'Línea Respiratoria — Respira-mol',
      tipo: 'imagen',
      url: '',
      children: [
        {
          id: 'linea-b-packaging',
          titulo: 'Presentación del producto',
          tipo: 'imagen',
          url: '/content/linea-b-packaging.svg',
          hotspots: [
            {
              id: 'hs-tecnica-uso',
              x: 0.375,
              y: 0.783,
              ancho: 0.25,
              alto: 0.04,
              accion: {
                tipo: 'abrir_popup',
                titulo: 'Técnica de uso',
                texto: '2 inhalaciones cada 12hs. Agitar antes de usar y enjuagar la boca luego de cada aplicación.',
              },
            },
          ],
        },
        {
          id: 'linea-b-eficacia',
          titulo: 'Adherencia al tratamiento',
          tipo: 'imagen',
          url: '/content/linea-b-eficacia.svg',
          hotspots: [
            {
              id: 'hs-video-b',
              x: 0.75,
              y: 0.2,
              ancho: 0.1875,
              alto: 0.1,
              accion: {
                tipo: 'abrir_popup',
                titulo: 'Video del estudio',
                texto: '(demo) Acá se reproduciría el video del estudio de adherencia. La acción "reproducir_video" ya está soportada por el visor; falta cargar un archivo de video real.',
              },
            },
          ],
        },
        {
          id: 'linea-b-ficha',
          titulo: 'Ficha técnica (PDF)',
          tipo: 'pdf',
          url: '/content/linea-b-ficha.pdf',
        },
      ],
    },
  ],
}
