import type { ContentNode } from '../types'

const contentUrl = (archivo: string) => `${import.meta.env.BASE_URL}content/${archivo}`

// Contenido cargado a mano para la demo del MVP (HU-C2: en producción esto vive en Supabase, no en código).
// Dos líneas de producto genéricas, cada una con su propia identidad de marca (color de tabs/acentos).
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
      color: '#0a6b5d',
      children: [
        {
          id: 'packaging',
          titulo: 'Presentación',
          tipo: 'imagen',
          url: contentUrl('packaging.svg'),
          hotspots: [
            {
              id: 'hs-posologia',
              x: 0.5375,
              y: 0.5,
              ancho: 0.275,
              alto: 0.0767,
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
          titulo: 'Eficacia',
          tipo: 'imagen',
          url: contentUrl('eficacia.svg'),
          hotspots: [
            {
              id: 'hs-video',
              x: 0.7,
              y: 0.0667,
              ancho: 0.2125,
              alto: 0.07,
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
          titulo: 'Ficha técnica',
          tipo: 'pdf',
          url: contentUrl('ficha-tecnica.pdf'),
        },
      ],
    },
    {
      id: 'linea-b',
      titulo: 'Línea Respiratoria — Respira-mol',
      tipo: 'imagen',
      url: '',
      color: '#144f85',
      children: [
        {
          id: 'linea-b-packaging',
          titulo: 'Presentación',
          tipo: 'imagen',
          url: contentUrl('linea-b-packaging.svg'),
          hotspots: [
            {
              id: 'hs-tecnica-uso',
              x: 0.5375,
              y: 0.5,
              ancho: 0.2875,
              alto: 0.0767,
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
          titulo: 'Adherencia',
          tipo: 'imagen',
          url: contentUrl('linea-b-eficacia.svg'),
          hotspots: [
            {
              id: 'hs-video-b',
              x: 0.7,
              y: 0.0667,
              ancho: 0.2125,
              alto: 0.07,
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
          titulo: 'Ficha técnica',
          tipo: 'pdf',
          url: contentUrl('linea-b-ficha.pdf'),
        },
      ],
    },
  ],
}
