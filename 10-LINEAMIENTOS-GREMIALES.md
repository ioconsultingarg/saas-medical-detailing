# 10 · Lineamientos gremiales y laborales (Argentina)

Reglas de diseño que valen para **todo** el desarrollo de IO-Pharma, no para una pantalla en particular.
El usuario final está sindicalizado y el producto se puede caer por una funcionalidad, no por el precio.

## Quién es el interlocutor

| Gremio | Rol |
| --- | --- |
| **AAPM** · Asociación Agentes de Propaganda Médica | El gremio exacto del usuario final. Tiene área jurídica con historial de amparos contra software de monitoreo |
| **ATSA / FATSA** · Sanidad | Cubre al resto de la industria. Mismas herramientas de bloqueo |

Marco legal relevante: la Ley de Contrato de Trabajo (los controles personales deben salvaguardar la
dignidad del trabajador y practicarse con discreción, y la organización del trabajo excluye el abuso del
derecho), las leyes provinciales de ejercicio profesional del APM, la ley de protección de datos
personales y los convenios colectivos vigentes.

---

## Las cinco reglas

### 1. El APM es promotor científico, no vendedor

Las leyes de ejercicio profesional le **prohíben** hacer transacciones comerciales, cobrar o vender. Si la
interfaz parece comercio electrónico, el gremio puede sostener que el laboratorio lo obliga a violar su
ley profesional.

| Nunca decir | Decir |
| --- | --- |
| Carrito, comprar, vender | Solicitud de material médico |
| Ventas, facturación, cliente | Prescripción, dispensa, profesional |
| Pedido de mercadería | Solicitud de muestras y material científico |
| Presentación comercial | Presentación de farmacia |

Tampoco íconos de comercio: nada de changuitos ni bolsas de compras.

### 2. Geolocalización solo en el instante del check-in

- Se capturan latitud y longitud **únicamente** cuando el promotor toca Check-in o Check-out.
- **Nunca** hay rastreo en segundo plano, trazado de recorrido, velocidad ni tiempos entre visitas.
- El gerente ve cobertura de la cartera, no un mapa con personas moviéndose.

Esta es la línea roja más clara: un mapa en vivo con la posición del equipo hace que el gremio indique
apagar el GPS, y sin datos no hay CRM.

### 3. El feedback es del promotor, no un formulario de auditoría

- Receptividad, etiquetas y notas son **opcionales**. La visita se puede cerrar sin completarlas.
- Lo único obligatorio es la firma de recepción cuando se entregan muestras, porque lo exige la normativa
  sanitaria, no la empresa.
- Nunca pedir justificación de demoras, desvíos del plan o resultados por debajo del objetivo. Eso se
  denuncia como acoso laboral o riesgo psicosocial.

### 4. Nada de métricas de persona usadas para evaluar

- Los tiempos por pantalla y el uso del material se leen **en agregado**, para saber qué pieza funciona.
- No armar rankings individuales de productividad ni vincular métricas de uso de la app con comisiones:
  eso altera unilateralmente las condiciones de trabajo del convenio.
- La gamificación de Academia es voluntaria y no se usa para evaluar desempeño.

### 5. Derecho a la desconexión

- Ninguna notificación fuera del horario del promotor.
- Si un médico interactúa con el material a las 21 h, el aviso **queda encolado** y aparece al comenzar el
  día hábil siguiente.
- El horario laboral es configurable por laboratorio y por persona.

---

## Cómo está resuelto hoy en IO-Pharma

| Regla | Dónde se ve |
| --- | --- |
| Lenguaje científico | Stock se llama "Disponibilidad de material"; la solicitud no es un carrito |
| GPS solo en check-in | Es el único momento en que se toma la ubicación; se muestra la distancia al consultorio |
| Feedback opcional | El cierre de visita guarda sin calificación ni etiquetas |
| Transparencia | En Actividad hay un bloque "Qué registra la app y qué no", y un artículo en la Ayuda |
| Sin control de personas | En el portal, Equipo aclara que se mide el plan y no a las personas |
| Academia voluntaria | El texto de puntos aclara que no se usa para evaluar |

## Cómo venderlo

El argumento comercial se da vuelta a favor: **"medimos cobertura, no personas"**. Un laboratorio que
implementa una herramienta que el gremio no resiste ahorra un conflicto y consigue que su equipo
efectivamente la use. Conviene decirlo en la primera reunión, antes de que lo pregunten.

El posicionamiento es **asistente digital de promoción científica**, nunca "CRM para controlar el
territorio".

## Antes de sumar cualquier función nueva

1. ¿Genera un dato de ubicación fuera del check-in? → No va.
2. ¿Obliga al promotor a justificarse ante el sistema? → No va.
3. ¿Produce un ranking individual que pueda afectar su remuneración? → Va solo en agregado.
4. ¿Le habla al promotor en lenguaje de comercio? → Cambiar el texto.
5. ¿Puede generar un aviso fuera de horario? → Encolar hasta el día siguiente.

Ante la duda, consultar con un abogado laboralista antes de implementarlo en un cliente. Este documento
es una guía de diseño, no un dictamen legal.
