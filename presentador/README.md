# Presentador — Medical Detailing (MVP, Módulo 2)

Visor interactivo de material de detailing, primer entregable del proyecto descripto en [../CONTEXTO.md](../CONTEXTO.md). Implementa las historias de usuario de [../HISTORIAS-USUARIO-MODULO-2.md](../HISTORIAS-USUARIO-MODULO-2.md).

## Qué incluye esta versión

- PWA instalable (manifest + Service Worker vía `vite-plugin-pwa`).
- Visor de árbol de contenido no lineal (imágenes, PDF; video soportado en el modelo de datos, sin asset de demo todavía).
- Hotspots sobre imágenes que disparan popups.
- Descarga explícita de contenido para uso offline (Cache Storage API).
- Métricas de permanencia por pantalla, guardadas primero en IndexedDB (`idb-keyval`) y sincronizadas a Supabase cuando hay conexión y credenciales configuradas.
- Contenido de la demo cargado a mano en [`src/data/mockContent.ts`](src/data/mockContent.ts) — en producción esto se reemplaza por una consulta a Supabase.

## Cómo correrlo

```bash
npm install
npm run dev
```

## Conectar Supabase (opcional para probar sync)

1. Copiar `.env.example` a `.env.local` y completar `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` de un proyecto de Supabase.
2. Crear la tabla `dwell_events` (columnas: `nodo_id text`, `apm_id text`, `timestamp_inicio timestamptz`, `timestamp_fin timestamptz`).
3. Sin estas variables, la app funciona igual: los eventos quedan acumulados en IndexedDB sin sincronizar.

## Siguiente paso sugerido

Ver la sección "Orden de implementación sugerido" en [../HISTORIAS-USUARIO-MODULO-2.md](../HISTORIAS-USUARIO-MODULO-2.md) — con A, B, C y E ya cubiertos por esta versión, sigue reforzar D (sync real contra un proyecto Supabase) y luego decidir si el próximo incremento es el editor no-code o un primer piloto con contenido real de un laboratorio.
