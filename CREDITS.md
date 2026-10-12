# Créditos de terceros

Lo que IO-Pharma usa y no escribimos nosotros. Para las dependencias de npm vale lo que
declara cada paquete en `presentador/package.json`; acá van las piezas que se copiaron o
adaptaron al código del proyecto, que son las que una licencia obliga a reconocer.

## Diseño de interacción adaptado

| Qué | Dónde está en este repo | Fuente | Autor | Licencia |
| --- | --- | --- | --- | --- |
| Constantes de resortes y curvas de easing | `presentador/src/lib/resortes.ts` | [beUI](https://beui.dev) · `starc007/ui-components` | — | MIT |
| Puntaje de búsqueda por tokens y cursor de fila por id | `presentador/src/lib/buscador.ts` | beUI · Command Palette | Saurabh | MIT |
| Estructura y física de la paleta de comandos | `presentador/src/components/Paleta.tsx` | beUI · Command Palette | Saurabh | MIT |

El código fue reescrito en español y adaptado a los tokens del sistema de diseño propio; la
lógica de búsqueda y de navegación por teclado sigue la de la fuente.

## Tipografías

| Fuente | Dónde | Licencia |
| --- | --- | --- |
| Instrument Sans | app (`@fontsource-variable`) y `manual/fuentes/IOSans-*.ttf` | SIL OFL 1.1 — texto en `manual/fuentes/OFL-InstrumentSans.txt` |
| IBM Plex Mono | app (`@fontsource`) y `manual/fuentes/IOMono-*.ttf` | SIL OFL 1.1 — texto en `manual/fuentes/OFL-IBMPlexMono.txt` |

Ver `manual/fuentes/LEEME.md` para el detalle de la conversión y del *Reserved Font Name*.

## Iconografía y mapas

| Qué | Licencia |
| --- | --- |
| [Lucide](https://lucide.dev) | ISC |
| [Leaflet](https://leafletjs.com) | BSD-2-Clause |
| Teselas de [OpenStreetMap](https://www.openstreetmap.org/copyright) | ODbL · atribución visible en el mapa. **Uso comercial sostenido requiere otro proveedor**: ver `11-STACK-TECNICO-OPCIONES.md` |

## Qué no se usó

Se evaluaron y se descartaron Uiverse, Codrops, 21st.dev, Magic UI, React Bits, Kokonut UI,
Animate UI y Origin UI. Nada de esas fuentes está en el código. El motivo está en el documento
de dirección visual: el vocabulario decorativo de esas librerías no encaja con una herramienta
que se usa con una mano, a media luz, frente a un médico.
