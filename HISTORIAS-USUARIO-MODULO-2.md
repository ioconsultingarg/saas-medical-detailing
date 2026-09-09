# Historias de usuario técnicas — Módulo 2 (Presentador) — MVP

Alcance: solo el **visor** del presentador. Sin editor no-code, sin CRM (Módulo 1), sin WhatsApp (Módulo 3). Contenido cargado a mano por el desarrollador para la demo. Ver [CONTEXTO.md](CONTEXTO.md) para el marco completo del proyecto.

Stack: PWA (Vite + React + TypeScript + vite-plugin-pwa), Supabase (Postgres + Storage + Auth), Service Worker + IndexedDB para offline acotado.

## Épica A — Instalación y arranque de la PWA

**HU-A1.** Como APM, quiero poder instalar la app en la pantalla de inicio de mi tablet, para abrirla como si fuera una app nativa sin pasar por el navegador.
- Criterios de aceptación: `manifest.json` con íconos, `display: standalone`, `start_url`; prompt de instalación disponible en Chrome/Android; funciona en modo pantalla completa una vez instalada.

**HU-A2.** Como APM, quiero que la app cargue aunque no tenga señal en el momento de abrirla, para no depender de la conexión del consultorio.
- Criterios de aceptación: Service Worker precachea el shell de la app (JS/CSS/HTML) con estrategia cache-first; la app abre sin red mostrando al menos la pantalla de selección de laboratorio/contenido ya visitado previamente.

## Épica B — Navegación del árbol de contenidos

**HU-B1.** Como APM, quiero ver un menú/árbol con los productos o líneas del laboratorio, para elegir a demanda qué mostrarle al médico según cómo vaya la charla (no un slide fijo).
- Criterios de aceptación: estructura de contenido representada como árbol JSON (nodo = pantalla, con `children` opcionales); UI de navegación no lineal (breadcrumb o menú lateral) que permite saltar entre ramas sin recorrer todo linealmente; volver atrás sin perder el punto de partida.

**HU-B2.** Como APM, quiero que cada nodo del árbol pueda ser un PDF, una imagen o un video, para reutilizar el material que el laboratorio ya usa en papel/digital.
- Criterios de aceptación: el modelo de datos de un nodo define `tipo: 'pdf' | 'imagen' | 'video'` y una `url` de Supabase Storage; el visor renderiza cada tipo correctamente (PDF con paginación básica, imagen a pantalla completa, video con controles).

## Épica C — Hotspots interactivos

**HU-C1.** Como APM, quiero tocar zonas específicas de un PDF/imagen para disparar un pop-up o un video relacionado, para profundizar un dato sin salir de la pantalla principal.
- Criterios de aceptación: cada nodo puede tener una lista de hotspots (`x, y, ancho, alto` normalizados 0–1 para ser responsive) asociados a una acción (`abrir_popup` con texto/imagen, o `reproducir_video`); overlay de hotspots posicionado sobre el contenido; tap dentro del área dispara la acción sin recargar la pantalla.

**HU-C2.** Como laboratorio (carga manual, no UI todavía), quiero definir estos hotspots como datos estructurados, para que cargar contenido nuevo no requiera tocar código de la UI.
- Criterios de aceptación: los hotspots viven en una tabla Supabase (`hotspots`) referenciando el nodo, no hardcodeados en componentes React; agregar un nodo/hotspot nuevo es un INSERT de datos, no un deploy.

## Épica D — Métricas de fondo

**HU-D1.** Como Gerente de Marketing, quiero saber cuánto tiempo se detuvo el médico en cada pantalla, para inferir qué producto/mensaje generó más interés.
- Criterios de aceptación: al entrar/salir de un nodo se registra `{ nodo_id, apm_id, timestamp_inicio, timestamp_fin }`; el cálculo de duración se hace en el cliente y se guarda como evento local.

**HU-D2.** Como APM, quiero que estas métricas se guarden aunque esté sin señal en el momento de la visita, para no perder el dato de una visita en un consultorio sin wifi.
- Criterios de aceptación: eventos de permanencia se escriben primero en IndexedDB; un proceso de sync (al detectar `navigator.onLine` o evento `online`) empuja los eventos pendientes a Supabase y los marca como sincronizados; reintentos simples si falla el push.

## Épica E — Contenido offline

**HU-E1.** Como APM, quiero haber "descargado" el contenido de un laboratorio antes de salir a la calle, para poder mostrarlo sin conexión durante toda la visita.
- Criterios de aceptación: acción explícita ("Descargar para uso offline") que dispara el cacheo de todos los assets (PDFs/imágenes/videos) de un árbol de contenido vía Service Worker (Cache Storage API); indicador de qué contenido está disponible offline vs. requiere red.

## Fuera de alcance del MVP (explícito)

- Editor no-code para que el laboratorio cargue su propio contenido (fase posterior).
- Ficha de cliente, agenda por geolocalización, descuento de stock de muestras (Módulo 1).
- Generación de micro-links y notificaciones por WhatsApp (Módulo 3).
- Multi-tenant real con onboarding de múltiples laboratorios — el MVP puede arrancar con un único tenant hardcodeado; RLS multi-tenant se implementa cuando haya un segundo cliente real.

## Orden de implementación sugerido

1. HU-A1, HU-A2 (esqueleto PWA instalable)
2. HU-B1, HU-B2 (visor navegando contenido estático de prueba)
3. HU-C1, HU-C2 (hotspots)
4. HU-E1 (offline de assets)
5. HU-D1, HU-D2 (métricas + sync)
