# Dirección aprobada — Presentador (demo app APM)

Registro exigido por la skill `huashu-design` antes de implementar.

## Dirección elegida

**"Clinical Precision con foco en contenido"**, definida en `01-DIRECCION-VISUAL.md` y bajada a
`prototype.html`, ambos trabajados por el usuario en Antigravity.

## Por qué no se volvieron a abrir tres direcciones

Aplica la exención "iteración sobre una dirección ya elegida". Palabras del usuario (2026-09-13):

> "Todo esto lo realicé con la IA Antigravity de Google, llegamos a la idea que me gusta más rápido."

Y el alcance funcional quedó fijado por el usuario el 2026-09-12: dashboard con mapa y check-in,
biblioteca y constructor drag & drop, visor con hotspots y anotación, stock con semáforo y carrito,
compartir, y cierre con calificación y firma. Dos productos distintos.

## Decisiones de implementación (2026-09-13)

- **Principio rector:** la app es un marco neutro; el color pertenece a cada línea terapéutica.
- **Color:** neutros fríos de la spec (`02-SISTEMA-DE-DISENO.md`); Cardio `#0A6B5D` + lima `#CFE94A`,
  Respiratoria `#144F85` + ámbar `#F5A623`; un solo acento de sistema.
- **Tipografía:** Instrument Sans (interfaz y titulares) + IBM Plex Mono (cifras clínicas, dosis,
  horarios). Fuentes empaquetadas localmente para que funcionen sin conexión.
- **Detalle a 120%:** el modo presentación (transición entre pantallas, hotspots y panel clínico).
- **Movimiento:** curvas y duraciones de `emil-design-eng` y `apple-design` (respuesta al presionar,
  paneles que entran y salen por el mismo lado, nada de animaciones en acciones repetidas).
- **Datos:** médicos, marcas y estudios ficticios, marcados como demostración.
