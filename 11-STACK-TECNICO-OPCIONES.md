# 11 · Stack técnico · tres opciones

Documento para cotizar o comparar con terceros. Se puede compartir tal cual: incluye el contexto
necesario para que alguien que no conoce el proyecto entienda qué hay que construir.

---

## El producto en dos párrafos

**IO-Pharma** es un SaaS B2B para laboratorios farmacéuticos medianos y chicos de Argentina y la región.
Tiene dos frentes sobre la misma plataforma y la misma API:

1. **App del visitador médico (APM)**, en tablet o celular, que funciona **sin conexión**: agenda y ruta del
   día, check-in con geolocalización puntual, presentaciones interactivas (CLM) con estudios, videos y
   modelos 3D, stock y entrega de muestras con firma del profesional, cierre de visita con reporte por voz
   asistido por IA, y academia con certificación obligatoria por producto.
2. **Portal del laboratorio**, en navegador de escritorio: aprobación y versionado del material (circuito
   médico-legal), catálogo y cupos de muestras, cuentas institucionales (droguerías, cadenas), licitaciones,
   lanzamientos, segmentación RFM de médicos, equipo y territorios, farmacovigilancia con plazo de 24 horas,
   y un asistente que responde preguntas en lenguaje natural sobre los datos.

Hoy existe una **demo funcional completa** (React 19 + Vite + TypeScript + Tailwind 4, PWA, estado local)
que sirve de especificación viva: todas las pantallas, flujos y textos están definidos y probados. Lo que
falta es el backend real.

## Restricciones que condicionan el stack

| Restricción | Impacto técnico |
| --- | --- |
| **Offline real**, no "modo consulta" | Base local en el dispositivo + motor de sincronización bidireccional con resolución de conflictos e idempotencia |
| **Multi-tenant desde el día uno** | Aislamiento por laboratorio a nivel de fila o de esquema, desde la primera línea |
| **Cumplimiento farmacéutico** | Trazabilidad de muestras por lote, firma electrónica con sello de tiempo, versionado de material aprobado, evento adverso con SLA de 24 h, auditoría de quién hizo qué |
| **Lineamientos gremiales (AAPM)** | Sin rastreo GPS continuo: la ubicación se captura solo en el check-in. Sin métricas individuales de control |
| **Residencia de datos** | Algunos clientes pedirán datos en Argentina; conviene que la arquitectura permita mudarse sin reescribir |
| **Datos sensibles** | Datos de profesionales de la salud (no de pacientes, salvo el relato de un evento adverso) |

---

## Comparación por capa

| Capa | MÍNIMO · validar con un cliente | RECOMENDADO · 2 a 5 clientes | IDEAL · escala y auditoría |
| --- | --- | --- | --- |
| **App de campo** | PWA instalable (React + Vite + Tailwind), Service Worker con Workbox | PWA + app nativa con Expo / React Native, monorepo con dominio compartido | Expo con EAS Build, distribución por MDM (Intune, Jamf), actualizaciones OTA controladas |
| **Base local** | IndexedDB (idb-keyval / Dexie) | SQLite en el dispositivo (op-sqlite o expo-sqlite; wa-sqlite en web) | Igual, con cifrado en reposo del archivo local |
| **Sincronización** | Cola propia de operaciones con clave de idempotencia y reintentos | **PowerSync** o **ElectricSQL** sobre Postgres: replicación bidireccional y conflictos resueltos | Igual, con reglas de sincronización por rol y por territorio, y auditoría del delta |
| **Backend** | Supabase (Postgres + Auth + Storage + Edge Functions) | API propia en **NestJS** o **Fastify** (TypeScript), contrato OpenAPI 3.1, validación con Zod | Igual, con separación de servicios: API, workers, motor de sincronización y jobs de datos |
| **Base de datos** | Postgres gestionado (Supabase) | Postgres gestionado con réplica de lectura y PITR (Supabase Pro, Neon, RDS) | Aurora o RDS Multi-AZ, cifrado con KMS, `pgvector` para el asistente, réplica analítica |
| **Multi-tenant** | Row Level Security por `tenant_id` | RLS + claims en el token + pruebas automáticas de aislamiento | Esquema por cliente o base por cliente para los que lo exijan por contrato |
| **Identidad** | Correo y contraseña + invitaciones | SSO con OIDC (Microsoft Entra ID), roles y permisos por recurso | SAML + **SCIM** para altas y bajas automáticas, MFA obligatorio, sesiones y dispositivos administrados |
| **Archivos y CDN** | Supabase Storage | **Cloudflare R2** + URLs firmadas + CDN | R2 o S3 con versionado, retención legal y antivirus en la carga |
| **Trabajos en segundo plano** | `pg_cron` y funciones | **BullMQ** sobre Redis (sincronización con ERP, importaciones, avisos) | **Temporal** o equivalente para flujos largos con reintentos y trazabilidad |
| **Transcripción de voz** | La del navegador (Web Speech API), gratis pero solo con conexión | API de transcripción (Whisper o equivalente) con acuerdo de tratamiento de datos | Transcripción propia en GPU o proveedor con residencia, más modelo chico en el dispositivo para trabajar sin señal |
| **Extracción del reporte** | Reglas locales (lo que hoy tiene la demo) | **LLM con salida estructurada** validada contra JSON Schema y contra el CRM | Igual + evaluaciones automáticas de calidad, versionado de prompts y registro de cada inferencia |
| **Asistente de datos** | Consultas predefinidas | LLM que genera SQL sobre una **capa semántica** (dbt o Cube), usuario de solo lectura, validación previa de la consulta | Igual + RAG sobre documentación y tickets, caché de respuestas, auditoría y control de costos por consulta |
| **Integraciones** | Importación y exportación por planilla (CSV/XLSX) | Conectores a SAP (OData), Salesforce (REST + CDC) y SFTP para la auditoría de prescripciones | Bus de eventos (SQS/SNS o Kafka), *outbox pattern*, webhooks firmados con HMAC y reintentos |
| **Analítica** | Consultas sobre la misma base | Réplica de lectura + dbt para las métricas del negocio | Data warehouse (BigQuery o Snowflake) + dbt + atribución de impacto |
| **Infraestructura** | Cloudflare Pages + Supabase | Un VPS con Docker administrado con **Coolify**, o PaaS (Fly.io, Railway, Render) | AWS o Azure con **Terraform**, contenedores en ECS/Fargate o Kubernetes gestionado, autoescalado |
| **Observabilidad** | Sentry (plan gratuito) | Sentry + métricas y logs (Grafana Cloud o Better Stack) + monitoreo de disponibilidad | Trazas distribuidas (OpenTelemetry), SLO por endpoint, alertas y guardia |
| **CI/CD** | Despliegue desde GitHub al hacer merge | GitHub Actions con entornos de desarrollo, prueba y producción; migraciones versionadas (Drizzle o Prisma) | Igual + despliegue por etapas, reversión automática y aprobación para producción |
| **Respaldos** | Los del proveedor | Diarios + **PITR** + copia fuera del proveedor + restauración probada cada mes | Igual + plan de recuperación documentado con objetivos de tiempo y de punto de recuperación |
| **Seguridad** | HTTPS, secretos en variables de entorno, RLS | WAF, secretos en gestor dedicado, dependencias auditadas, registro de auditoría | Pentest anual, gestión de vulnerabilidades, camino a SOC 2, DPA con cada subprocesador |
| **Cumplimiento** | Términos, privacidad y trazabilidad básica | Firma con sello de tiempo, versionado de material, auditoría completa | Validación del sistema (IQ/OQ/PQ) y controles equivalentes a 21 CFR Part 11 si el cliente lo pide |

---

## Costos mensuales estimados

Valores orientativos en dólares, sin contar horas de desarrollo.

| Concepto | Mínimo | Recomendado | Ideal |
| --- | --- | --- | --- |
| Base de datos y backend | 25 – 30 | 60 – 150 | 400 – 1.200 |
| Hosting de la web | 0 | 0 – 20 | 50 – 150 |
| Archivos y CDN | incluido | 5 – 25 | 50 – 200 |
| Colas y caché | 0 | 10 – 30 | 80 – 250 |
| Observabilidad | 0 | 30 – 80 | 150 – 500 |
| IA (por visitador y por mes) | 0 | 1 – 4 | 3 – 8 |
| Data warehouse | — | — | 200 – 800 |
| **Total con 1 cliente de 15 APM** | **30 – 60** | **150 – 350** | no aplica |
| **Total con 5 clientes, 100 APM** | no escala | **250 – 500** | **1.500 – 4.000** |

La factura de infraestructura no es el problema del negocio: con 15 visitadores a 25 dólares por mes el
margen cubre de sobra cualquiera de las dos primeras columnas. Lo caro son las horas.

## Esfuerzo y equipo

| | Mínimo | Recomendado | Ideal |
| --- | --- | --- | --- |
| Hasta el primer cliente productivo | 2 a 3 meses | 4 a 6 meses | 9 a 12 meses |
| Equipo | 1 full-stack con apoyo | 1 líder técnico + 1 full-stack + 1 móvil, medio tiempo de QA | Lo anterior + datos, DevOps y un responsable de cumplimiento |
| Meses-persona | 3 a 5 | 10 a 16 | 30 a 50 |

---

---

## Escalabilidad · qué escala y qué no

La intuición engaña: este producto **no tiene un problema de volumen de tráfico**. Cien visitadores
haciendo veinte visitas por día generan unas 2.000 escrituras diarias. Un solo Postgres bien indexado
aguanta eso multiplicado por cien sin despeinarse. Lo que sí escala mal son otras cuatro cosas.

| Qué crece | Cómo crece | Cuándo duele | Cómo se resuelve |
| --- | --- | --- | --- |
| **Abanico de sincronización** | Una pieza publicada × N dispositivos. Publicar una presentación para 200 tablets son 200 deltas y 200 descargas | Al tercer o cuarto cliente | Motor de sincronización con reglas por territorio: cada dispositivo se baja **solo lo suyo**, no todo el catálogo |
| **Egreso de archivos** | Un PPT de 40 MB × 200 tablets = 8 GB por publicación | Desde el primer cliente con material pesado | CDN con caché larga, piezas versionadas por hash, y conversión del material a formatos livianos al subirlo |
| **Costo de IA** | Lineal con el uso, a diferencia de todo lo demás | Siempre: es el único renglón que no se diluye | Tope por usuario y por mes, caché de respuestas repetidas, modelo chico para lo fácil y grande solo para lo difícil |
| **Consultas del asistente** | SQL generado sobre las tablas operativas | Cuando la gerencia empieza a usarlo en serio | **Réplica de lectura**: el asistente nunca toca la base que usan las tablets |

### Los cuellos de botella reales, en orden de aparición

1. **Conexiones a la base, no CPU.** Es el error clásico: funciones sin estado + Postgres = agotamiento de
   conexiones mucho antes de que el procesador se entere. **PgBouncer en modo transacción** desde el día uno,
   no cuando explote.
2. **Consultas sin índice sobre `tenant_id`.** Con Row Level Security, cada consulta lleva un filtro por
   laboratorio. Si ese filtro no está en el índice, la base escanea la tabla entera de todos los clientes.
   Todo índice arranca con `tenant_id`.
3. **El vecino ruidoso.** Un laboratorio que importa 80.000 recetas del auditor no puede frenar a los otros.
   Las importaciones van a una cola con límite por cliente, nunca al pedido HTTP.
4. **Crecimiento del almacenamiento.** Entre material, firmas y audios, calculá **1 a 3 GB por laboratorio
   por año**. No es un problema de plata, es un problema de respaldos: restaurar 300 GB tarda distinto
   que restaurar 3 GB.

### Capacidad por opción

| | Mínimo | Recomendado | Ideal |
| --- | --- | --- | --- |
| Laboratorios | 1 | 5 a 15 | sin techo práctico |
| Visitadores activos | hasta 25 | hasta 300 | miles |
| Estrategia de crecimiento | crecer la instancia | instancia grande + réplica de lectura + colas | partición por cliente, autoescalado, warehouse aparte |
| Qué se rompe primero | conexiones y egreso | abanico de sincronización | costo de IA y analítica |

La regla de orden: **primero vertical** (una instancia más grande cuesta 40 dólares y una tarde),
**después réplica de lectura**, y **recién al final** partir por cliente. Repartir la base antes de
necesitarlo es la forma más cara de resolver un problema que todavía no existe.

### Qué medir desde el primer día

- p95 del delta de sincronización, y **antigüedad del dato más viejo sin sincronizar** (es la métrica que
  le importa al visitador: cuánto hace que no sube lo que hizo).
- Profundidad de la cola y cantidad de reintentos.
- Conexiones activas contra el tope.
- Egreso de CDN por laboratorio y por mes.
- Costo de IA por visitador y por mes, con alerta al doble del promedio.

---

## Entornos · desarrollo, prueba y producción

Sí hacen falta, y en este producto más que en otros: **los errores que importan no se ven en el navegador
del desarrollador**, aparecen en una tablet sin señal, con el reloj corrido y una operación duplicada.

| Entorno | Para qué | Datos | Costo |
| --- | --- | --- | --- |
| **Local** | El día a día | Semilla sintética, la misma que usa la demo | 0 |
| **Vista previa por rama** | Cada cambio tiene su URL para mostrarle al cliente antes de mezclarlo | Copia de la semilla, efímera | Casi 0: se crea y se borra con la rama |
| **Prueba (staging)** | Ensayo general: migraciones, integraciones y carga | **Datos sintéticos o anonimizados, nunca una copia de producción** | 30 a 40 % de producción |
| **Producción** | Los clientes | Reales | La tabla de costos |

Tres reglas que valen más que el diagrama:

1. **La migración se prueba en staging con el volumen de producción**, no con tres filas. Una migración que
   tarda 40 segundos en la notebook puede bloquear una tabla ocho minutos con datos reales.
2. **Nunca copiar producción a staging.** Son datos de profesionales de la salud. Se genera un volumen
   equivalente con datos falsos, o se anonimiza con un proceso auditado.
3. **Staging tiene que poder portarse mal.** Un modo de caos que corte la red, atrase el reloj del
   dispositivo y repita operaciones: es la única manera de encontrar los errores de sincronización antes
   que el cliente.

### Depurar lo que no se puede reproducir

El visitador dice "se me perdió una visita". Pasó hace tres días, en un consultorio, sin señal. No hay forma
de reproducirlo pidiéndole pasos. Lo que sí se puede:

- **Bitácora de operaciones en el dispositivo**, exportable desde la pantalla de Actividad, que se adjunta
  al ticket. La app ya muestra la cola; falta que se pueda exportar.
- **Sentry con grabación de sesión** en la parte web del portal, y trazas con el identificador del
  dispositivo y del laboratorio en cada operación.
- **Modo soporte en el portal**: el administrador del laboratorio ve el estado de sincronización de cada
  dispositivo de su equipo —última conexión, pendientes, versión instalada—, sin ver el contenido.
- **Identificador de correlación** que viaje desde el dispositivo hasta el registro del backend: sin eso,
  cruzar un error del campo con un log del servidor es adivinar.

### Qué agrega al costo

Staging con un Postgres chico y un contenedor de API: entre 25 y 60 dólares por mes en la opción
Recomendado. Las vistas previas por rama, si se apagan solas, son casi gratis. Es el gasto de
infraestructura con mejor relación costo-beneficio de toda la tabla: cuesta menos que una hora de
desarrollo y evita el despliegue que rompe la sincronización de un cliente en plena jornada.

## Qué preguntarle a cada proveedor que cotices

1. ¿Dónde quedan físicamente los datos y puedo elegir la región?
2. ¿Hay recuperación a un punto en el tiempo (PITR) y cuántos días de retención?
3. ¿Cómo se restaura un respaldo y cuánto tarda? ¿Lo puedo probar?
4. ¿Firman acuerdo de tratamiento de datos y detallan sus subprocesadores?
5. Si la base crece a 50 GB y 200 usuarios concurrentes, ¿qué cambia en la factura?
6. ¿Qué compromiso de disponibilidad ofrecen y qué pasa si no lo cumplen?
7. ¿Puedo exportar todo y migrar sin quedar atado?
8. Para la IA: ¿los datos se usan para entrenar? ¿Hay retención cero?
9. ¿Puedo levantar un entorno de prueba idéntico y apagarlo cuando no lo uso?
10. ¿Hay agrupador de conexiones (PgBouncer o equivalente) y cuál es el tope real?

## Qué no aceptar

- Un proveedor sin recuperación a un punto en el tiempo para la base de datos.
- Respaldos que nunca se probaron restaurando.
- Un motor de sincronización hecho a medida: parece dos semanas y son seis meses de errores raros.
- Modelos de IA sin acuerdo de tratamiento de datos, con datos de profesionales de la salud.
- Quedar atado a servicios propietarios en la capa de datos; el resto se puede migrar, la base no.

## Mi recomendación

Arrancar en **Mínimo** con la arquitectura pensada para **Recomendado**: Postgres desde el día uno,
multi-tenant desde la primera tabla, contrato OpenAPI como fuente de verdad y el motor de sincronización
resuelto con una herramienta existente. Con eso, pasar de una columna a la otra es cambiar de
infraestructura, no reescribir el producto.

**Ideal** recién tiene sentido cuando un cliente lo exija por contrato y lo pague.
