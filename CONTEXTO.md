# SaaS "Medical Detailing" para laboratorios y droguerías (AR)

**Nota de alcance:** esto NO es un demo liviano tipo turnero o menú QR. Es una propuesta de producto SaaS pensada como negocio en sí mismo — separada del "Portfolio de demos — Transformación Digital" de IO Consulting. Este documento es autocontenido para retomarse en una charla dedicada solo a este proyecto.

Idea original trabajada con otra IA; luego reencuadrada a una versión ejecutable en solitario.

## Contexto y objetivo

Plataforma SaaS de "Medical Detailing" e higiene/venta comercial orientada a laboratorios farmacéuticos chicos/medianos (mid-market) y droguerías distribuidoras del sector salud en Argentina. Busca competir de forma indirecta contra jugadores como Veeva, Salesforce, Pitcher o Salestrip (plataformas de e-detailing/sales enablement ya establecidas) ofreciendo algo hiperlocal, ágil, económico y adaptado a la realidad comercial argentina.

Referencias de mercado relevadas: Salestrip (e-detailing pharma, funcionalidad muy similar a la planteada acá, sin precios públicos), Pitcher (sales enablement B2B genérico, útil como referencia de posicionamiento y lenguaje comercial), RX Design Hub (proveedor de diseño/impresión de material de visita médica — no es competencia de plataforma, pero sirve como referencia de qué contenido cargaría un laboratorio).

## Audiencia

1. Agentes de Propaganda Médica (APM) y ejecutivos comerciales en calle — necesitan velocidad y funcionamiento sin fricción, incluso con conexión inestable.
2. Gerentes de Marketing y Ventas — necesitan reportes simples de efectividad en calle y control de qué material se muestra.

## Módulos del producto (visión completa, a largo plazo)

**Módulo 1 — CRM y fichero comercial:** agenda diaria ("Mi Día") por geolocalización, ficha de cliente con historial y control de muestras médicas físicas (descuento automático de stock asignado al APM), botón "Iniciar Visita" que vincula la ficha con el presentador.

**Módulo 2 — Presentador interactivo (e-detailing y catálogo):** árbol de contenidos no lineal navegable a demanda, editor no-code para que el admin suba PDF/imágenes y dibuje hotspots que disparan pop-ups o videos, métricas de fondo (segundos de permanencia por pantalla) para medir interés. **Este es el módulo ancla: el más diferenciado, el más demostrable, y el punto de partida del MVP.**

**Módulo 3 — Omnicanalidad y seguimiento (WhatsApp):** al cerrar la visita se genera un micro-link temporal y rastreable, se envía por WhatsApp con mensaje predeterminado (estudio, folleto, lista de precios), y notifica al APM en tiempo real cuando el cliente lo abre.

## Reencuadre técnico para desarrollo en solitario (clave para avanzar)

El plan original pedía app móvil nativa offline-first (Flutter/React Native), multi-tenant, con 6 meses de desarrollo en equipo. Ese plan **no es viable** para alguien construyendo esto solo, en ratos libres (2-5 hs/semana), dependiendo de asistencia de IA para escribir el código — hay que recortar el alcance técnico, no solo extender el timeline.

Decisiones de reencuadre:

- **PWA en vez de app nativa.** Una web app instalable (ícono en pantalla, modo pantalla completa) corriendo en el navegador de la tablet. Elimina la necesidad de Flutter/React Native, tiendas de aplicaciones, y build nativo por plataforma.
- **Offline acotado, no "total".** En vez de un motor de sincronización bidireccional completo (SQLite/WatermelonDB), alcanza con: Service Worker cacheando el contenido del presentador (PDFs/imágenes/videos) para verlo sin conexión, e IndexedDB guardando localmente las visitas/interacciones hechas offline, sincronizándolas solas cuando vuelve la señal. Cubre el caso real (consultorio sin señal) sin construir un motor de sync genérico.
- **Backend: Supabase** (Postgres + Auth + Storage). Multi-tenancy vía Row Level Security (cada laboratorio ve solo sus datos, sin programar el aislamiento a mano), autenticación lista, storage para los archivos del presentador. Es además el stack más "amigable" para desarrollo asistido por IA, por lo estándar y documentado que es.
- **MVP = solo Módulo 2.** Nada de CRM ni de tracking por WhatsApp en la primera versión. Un visor de contenido navegable (el presentador) es suficiente para tener algo real y demostrable. Los Módulos 1 y 3 quedan para fases posteriores, una vez que haya feedback real de un laboratorio.
- **Dentro del Módulo 2, primero el visor, después el editor.** La primera versión puede tener el contenido cargado a mano (por vos, vía Claude/Cowork) para la demo. El editor no-code para que el laboratorio cargue su propio contenido es una fase posterior, no parte del primer entregable.
- **Ritmo de desarrollo:** incrementos semanales chicos y concretos (una funcionalidad puntual por semana), no "un módulo por mes" — el mismo patrón que ya viene funcionando con el portfolio de demos de IO Consulting (repo por pieza, contenido armado con asistencia de IA, commit local, push manual, verificación en vivo).

## Requisitos de negocio (localizados a Argentina)

- Precios y facturación en pesos argentinos al tipo de cambio oficial, para simplificar onboarding y evitar costos de importación de software.
- Multi-tenant con datos aislados y encriptados por cliente (laboratorio/droguería).
- Borrado remoto/purga de datos locales al desvincular un APM (a resolver una vez que exista almacenamiento local real más allá de la caché de contenido).

## Roadmap original de 4 fases (visión de negocio completa, no el plan de desarrollo solo)

**Fase 1 — Validación (mes 1):** entrevistas de dolor con 3-4 APMs/vendedores y sus gerentes; conseguir un laboratorio/droguería "Alpha" como socio de desarrollo (software gratis un año a cambio de probarlo en calle).

**Fase 2 — Diseño del MVP (mes 2):** prototipo en Figma de app móvil y panel web sin programar nada; diseño del "efecto WhatsApp" (cómo se ve el link de seguimiento para el médico/farmacéutico).

**Fase 3 — Desarrollo técnico base (meses 3-5):** foco en el motor offline y sync de archivos pesados; blindaje legal bajo Ley 25.326 (protección de datos personales) con contratos de confidencialidad y ToS.

**Fase 4 — Lanzamiento comercial (mes 6):** posicionamiento "primera plataforma de medical detailing pesificada al TC oficial, con soporte local"; onboarding express con importación de Excel de médicos/clínicas en menos de 48hs.

*Nota: estos tiempos (6 meses) asumían equipo dedicado. Con desarrollo en solitario a 2-5 hs/semana, conviene tratar esto como la secuencia lógica de hitos, no como un cronograma de meses — el plan semana a semana se arma en la charla dedicada a este proyecto.*

## Decisiones abiertas

1. Si el objetivo inmediato es tener algo demostrable para un laboratorio/droguería concreto que ya esté en el radar, o si todavía no hay un interlocutor y el objetivo es "validar que funciona" primero.
2. Estructura de precios en pesos (plan Base vs Premium) — pendiente de definir.
3. Estrategia de venta B2B para golpear puertas de laboratorios nacionales — pendiente, y probablemente más fácil de definir una vez que exista un demo del presentador para mostrar.
4. Historias de usuario técnicas detalladas para el Módulo 2 (presentador) — es el primer trabajo pendiente concreto una vez que se arranque a construir.

## Consideraciones a tener en cuenta antes de avanzar

- Vender a laboratorios/droguerías es un ciclo B2B más largo que venderle a una PyME de barrio: hay procesos de compra, y probablemente cuestionen la seguridad del fichero médico y pidan referencias — la estrategia de "socio de desarrollo" (Fase 1) tiene sentido para acortar ese ciclo.
- Además de la Ley 25.326 (protección de datos personales), vale la pena revisar si existen códigos de ética de la industria (cámaras del sector farmacéutico) sobre uso y trazabilidad de material promocional entregado a médicos — esto es una herramienta de detailing, no solo un CRM genérico.
- Esta iniciativa compite por el mismo tiempo/energía que el portfolio de demos para PyMEs de IO Consulting — vale la pena decidir conscientemente cuánto foco le das a cada una en paralelo.
- El recorte de alcance (PWA en vez de nativa, offline acotado, un módulo a la vez) es lo que hace viable este proyecto en solitario — cualquier revisión futura del plan debería preservar ese principio antes que sumar alcance de vuelta.

---
Documento de contexto para retomar el proyecto en una charla dedicada. Última actualización de este reencuadre: sept. 2026.
