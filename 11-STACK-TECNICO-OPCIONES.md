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

---

## Proveedor evaluado · DonWeb Cloud Server

Datos tomados de la página el 27/09/2026. Precios en pesos, IVA incluido. La columna "promo" es un
**55 % OFF de captación**: la que hay que usar para planificar es la de lista, que es a la que
renueva. La conversión a dólares es al oficial de ese día (≈ $1.545).

| vCPU | RAM | NVMe | Transferencia | Promo | Lista | Lista en USD |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | 1 GB | 10 GB | 1 TB | $5.164 | $11.477 | ≈ 7 |
| 2 | 2 GB | 20 GB | 1 TB | $9.708 | $21.574 | ≈ 14 |
| 2 | 8 GB | 20 GB | 1 TB | $12.698 | $28.218 | ≈ 18 |
| **4** | **8 GB** | **30 GB** | **2 TB** | **$15.673** | **$34.830** | **≈ 23** |
| 8 | 8 GB | 40 GB | 3 TB | $20.671 | $45.937 | ≈ 30 |
| 8 | 16 GB | 60 GB | 4 TB | $26.039 | $57.865 | ≈ 37 |

### La comparación que casi nadie hace bien

Contra un proveedor del exterior no se compara al dólar oficial: se compara al **dólar tarjeta**
(≈ $2.008 el mismo día), que es lo que termina costando pagar un servicio en dólares desde
Argentina con percepciones incluidas.

| | Costo real mensual |
| --- | --- |
| Supabase Pro · US$ 25 | ≈ $50.200 |
| DigitalOcean 4 vCPU / 8 GB · US$ 48 | ≈ $96.400 |
| **DonWeb 4 vCPU / 8 GB (lista)** | **$34.830** |
| Hetzner CPX31 4 vCPU / 8 GB · ≈ US$ 16 | ≈ $32.100 |

Queda al nivel de Hetzner, que es el piso del mercado, y encima **con los datos en Argentina**.
Eso no es un detalle de costos: es un argumento de venta ante un laboratorio que pregunta dónde
quedan los datos de sus médicos.

### Lo que resuelve bien

- **Datacenters propios en Argentina** y facturación en pesos. Residencia de datos sin asteriscos
  y sin exposición al tipo de cambio.
- **El marketplace tiene exactamente el stack de la columna Recomendado**: Docker, PostgreSQL,
  Coolify, Supabase y n8n en un clic. La opción que este documento recomendaba —"un VPS con Docker
  administrado con Coolify"— acá se despliega en minutos.
- **300 Mb/s dedicados y simétricos**, y el tráfico entre servidores por la red interna no consume
  la cuota. Importa cuando la API y la base se separan en dos máquinas.
- **Escalado vertical prorrateado**: se amplía y se paga solo la diferencia por los días restantes;
  si se reduce, se acredita. Un reinicio de 3 a 5 minutos.
- **Firewall aguas arriba** del servidor (no consume sus recursos) y anti-DDoS a nivel de carrier.
- **Volúmenes Cloud** de hasta 1 TB, hasta diez por servidor, conectables en caliente.
- Soporte 24x7 con tiempo de respuesta declarado de 20 minutos.

### Lo que hay que mirar de cerca

1. **El backup automático es semanal.** En esta aplicación eso significa poder perder **hasta siete
   días de visitas**, firmas y entregas de muestras. Los backups diarios con 30 retenciones son un
   cargo aparte. Y sobre todo: **no hay recuperación a un punto en el tiempo (PITR) de Postgres**,
   que este documento pone como condición de no negociable. Hay que armarlo uno: `pgBackRest` o
   `WAL-G` archivando el WAL a un bucket externo. Es media jornada de trabajo y resuelve el punto.
2. **"Administrado" quiere decir menos de lo que parece.** Monitorean la red y el estado del nodo,
   y aplican parches solo si usás el panel Ferozo. Tu Postgres, tu Docker y las actualizaciones de
   seguridad de Ubuntu corren por tu cuenta. No es una crítica: es la diferencia real contra
   Supabase, y se paga en horas, que según este mismo documento es lo caro.
3. **La IP puede quedar en Estados Unidos.** La respuesta oficial dice "nodos en Argentina […] con
   IP localizada en Argentina o los EEUU". Si el argumento es residencia de datos, hay que pedir
   por escrito nodo **e** IP en Argentina.
4. **El almacenamiento se amplía pero no se reduce.** Conviene arrancar corto y crecer, nunca al
   revés.
5. **No hay almacenamiento de objetos tipo S3.** El material aprobado, las firmas y los audios no
   deberían vivir en el disco del servidor: van a **Cloudflare R2**, que además no cobra egreso y
   resuelve el problema de abanico que describe la sección de escalabilidad.
6. **El 55 % es promocional.** Preguntar explícitamente a qué precio renueva y con qué frecuencia
   se ajusta por inflación. Un precio en pesos protege del dólar pero no del índice.

### Cómo lo armaría

**Arranque, un cliente (hasta 25 visitadores):** un solo Cloud Server de **4 vCPU / 8 GB / 30 GB**
($34.830 de lista) con Coolify del marketplace. Adentro: la API, Postgres con **PgBouncer en modo
transacción** y el worker de colas. Afuera: el material y los archivos en **Cloudflare R2**, el WAL
de Postgres archivado también a R2, y la app del visitador donde está hoy, en Pages. Sumar los
**backups diarios** pagos: es la diferencia entre perder un día y perder una semana.

**Segundo o tercer cliente:** separar la base a su propio servidor de **8 vCPU / 16 GB**
($57.865) y dejar la API en el de 4. La red interna entre los dos no consume transferencia.

**Entorno de prueba:** el plan de **2 vCPU / 2 GB** ($21.574). No se puede apagar para no pagar, así
que si el presupuesto aprieta, la alternativa es levantarlo con un snapshot solo cuando hay una
migración que ensayar y darlo de baja después, aprovechando que el cobro se prorratea por día.

**Total realista del arranque:** unos **$40.000 a $45.000 por mes** con backups diarios, más R2
(centavos de dólar al principio). Contra los $50.200 de Supabase Pro solo, con la base en otro país.

### Qué preguntarles antes de firmar

1. ¿Nodo **e** IP quedan en Argentina? ¿Lo pueden poner por escrito?
2. ¿Cuánto cuesta el backup diario con retención de 30 copias?
3. ¿Los snapshots consumen del almacenamiento contratado o van aparte?
4. ¿Precio por GB de los Volúmenes Cloud y cómo se factura?
5. ¿A qué precio renueva después del 55 % y con qué criterio se ajusta?
6. ¿El 99,9 % de disponibilidad tiene crédito por incumplimiento o es declarativo?
7. ¿Firman acuerdo de tratamiento de datos y detallan subprocesadores?
8. ¿Puedo restaurar un backup a un servidor nuevo para probarlo, sin tocar el de producción?

### Lo que falta, ¿se puede pagar en pesos?

Relevado el 27/09/2026.

| Falta | Opción argentina, en pesos | Veredicto |
| --- | --- | --- |
| **Email transaccional** | **DonWeb · EnvíaloSimple Transaccional**: API y SMTP relay, misma factura. Básico $10.500/mes por 2.000 envíos, IVA incluido. Prueba de 1.000 envíos | ✅ Existe y es bueno, pero **sobredimensionado** para este volumen |
| **Almacenamiento de objetos S3** | **Nubi (nubi2go)**: S3-compatible, pero factura **en dólares** y a **US$ 0,40 por GB al mes**. **ARSAT Nube**: Tier III en Benavídez, factura en pesos, pero no publica object storage ni precios: hay que pedir cotización | ⚠️ Técnicamente sí, económicamente no |
| **PITR de la base** | Nadie lo vende como servicio acá | Se arma con `pgBackRest`, va contra el bucket que elijas |
| **Transcripción de voz** | No hay proveedor argentino | Ver abajo: hay un camino sin dólares |
| **LLM** | No hay proveedor argentino a nivel útil | Dólares, sin vuelta |
| **Monitoreo de errores** | Sentry autohospedado o GlitchTip, en tu propio Cloud Server | ✅ Gratis, y los datos quedan en Argentina |

### La cuenta que da vuelta la conclusión

Pagar todo en pesos sale **más caro** que la mezcla, y por bastante:

| | En pesos, con proveedor argentino | Alternativa | Diferencia |
| --- | --- | --- | --- |
| Email (≈ 500 envíos/mes reales) | $10.500 · DonWeb Básico | **$0** · Resend regala 3.000/mes | $10.500 |
| Objetos, 50 GB | ≈ $40.000 · Nubi a US$ 0,40/GB | **$0** · Cloudflare R2 regala 10 GB y no cobra egreso | ≈ $40.000 |

Los planes gratuitos **no requieren tarjeta**, así que no hay pago en dólares ni percepciones. El
objetivo "todo en pesos" tiene sentido para lo que es grande y recurrente —el servidor— y deja de
tenerlo para lo chico, donde la versión gratuita del proveedor del exterior cuesta cero.

### Y la IA, que es lo único inevitable

También tiene un camino sin dólares, al menos hasta el primer cliente que pague:

- **La transcripción ya funciona sin servidor.** La app usa la Web Speech API del navegador: gratis,
  sin API key, sin cuenta. Limitación real: necesita conexión y anda bien en Chrome y Edge. Para la
  demo y el primer cliente alcanza.
- **La extracción del reporte ya es local.** Las reglas que tiene hoy la demo corren en el
  dispositivo y no llaman a ningún modelo.

Recién cuando un cliente exija que el dictado ande sin señal, o que el asistente responda preguntas
abiertas de verdad, aparece el gasto en dólares. Y para entonces ya hay una factura que lo paga.

### Dónde guardar cada cosa, que no es lo mismo

Esto importa más que el precio, porque toca el argumento de venta:

- **El material aprobado** (presentaciones, estudios, fichas) no es dato personal. Puede vivir en
  **Cloudflare R2** sin problema, y encima resuelve el egreso.
- **Las firmas de recepción de muestras sí son dato personal de un profesional de la salud.** Esas
  van en Postgres o en el volumen del servidor, que está **en Argentina**. Son imágenes chicas: no
  justifican un bucket.

Así se cumplen las dos cosas: el material pesado sale por un CDN que no cobra egreso, y el dato
sensible nunca se va del país.

### Total mensual del arranque

| Concepto | Pesos |
| --- | --- |
| Cloud Server 4 vCPU / 8 GB (lista) | $34.830 |
| Backups diarios | a cotizar |
| Dominio | incluido el primer año |
| Email transaccional | $0 (Resend) o $10.500 (DonWeb, misma factura) |
| Objetos y CDN | $0 hasta 10 GB (R2) |
| Monitoreo de errores | $0 |
| IA | $0 hasta que un cliente la exija de verdad |
| **Total** | **≈ $35.000 – $45.000** |

### Veredicto

**Sirve, y es la mejor opción local que vimos hasta ahora** para las columnas Mínimo y Recomendado.
El precio de lista compite con Hetzner, la residencia de datos en Argentina es un argumento
comercial real frente a un laboratorio, y el marketplace despliega el stack que este documento ya
recomendaba.

Lo que **no** resuelve es la parte gestionada de la base: PITR, réplica y actualizaciones son
trabajo propio. Si el objetivo es validar con uno o dos clientes, eso es un fin de semana de setup
y vale la pena. Si el objetivo fuera crecer a diez clientes sin sumar a nadie de infraestructura,
ahí sí conviene pagar un Postgres gestionado, aunque salga en dólares.

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
