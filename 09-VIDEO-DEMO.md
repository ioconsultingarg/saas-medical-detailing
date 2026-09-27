# Video demostrativo de la app (80 segundos)

## Lo primero, para no perder tiempo

**Ninguna IA de video puede generar las pantallas reales de tu app.** Veo, Sora o Kling inventan
interfaces que se parecen pero no son la tuya, con textos deformados. Un video de producto creíble
se arma así:

| Parte | Cómo se hace |
| --- | --- |
| Las pantallas | Grabación de pantalla de la demo real |
| La voz | IA de voz (ElevenLabs y similares) con el guion de abajo |
| Entrada y cierre | IA de video (Nano Banana + Veo) para 2 planos abstractos |
| Música | IA de música (Suno) o una pista libre de derechos |
| Armado | CapCut, Descript o Clipchamp |

Tiempo total: media jornada.

---

## Antes de grabar

1. Abrí la demo en **Chrome, ventana de incógnito**, sin barra de marcadores y con zoom al 100 %.
2. Entrá en **Actividad → Reiniciar demo** para que todo empiece de cero.
3. Ventana de **1920 × 1080**. Para mostrar la versión tablet, activá el modo dispositivo en iPad Pro.
4. Grabá con OBS a 1080p y 60 fps, o con la grabación de pantalla de Windows.
5. Movete **despacio**: el mouse rápido se lee como nervioso. Dejá un segundo quieto después de cada clic.
6. Grabá cada escena por separado y varias veces. Es más fácil elegir la mejor toma que corregir después.

---

## Guion, escena por escena

| Tiempo | Qué se graba | Texto en pantalla | Narración |
| --- | --- | --- | --- |
| 0:00–0:06 | Plano de entrada generado por IA + logo | Presentador · e-detailing para laboratorios | Tu fuerza de ventas trabaja en la calle, muchas veces sin señal. |
| 0:06–0:14 | **Hoy**: mapa con la ruta, tarjeta de la próxima visita, clic en "Hacer check-in" | La ruta del día | La agenda del día con la ruta, y un check-in que registra a qué distancia del consultorio se hizo. |
| 0:14–0:28 | **Presentar**: arrastrar la página para pasarla, tocar el gráfico semana a semana, abrir un recurso | Presentaciones que se exploran | Las presentaciones se pasan como páginas de papel, y cada dato se puede abrir frente al médico. |
| 0:28–0:36 | **Stock**: semáforo, agregar muestras al carrito, solicitar | Stock en tiempo real | El stock es en vivo, y las muestras se piden sin salir de la visita. |
| 0:36–0:54 | **Cerrar visita → Reporte por voz**: botón de grabar, la onda de audio, la transcripción resaltada y los campos completos | El visitador solo habla | Al cerrar, el visitador cuenta cómo le fue. La IA transcribe, reconoce productos y muestras, clasifica el feedback y detecta un posible evento adverso para notificarlo a farmacovigilancia. |
| 0:54–1:02 | Firmar con el mouse y guardar | Firma con trazabilidad | La firma de recepción queda con su lote y su vencimiento. |
| 1:02–1:10 | **Actividad**: activar "Simular sin conexión", hacer algo, desactivar y ver la cola sincronizar | Funciona sin señal | Sin conexión sigue funcionando, y sincroniza solo cuando vuelve la señal. |
| 1:10–1:20 | **Asistente**: escribir la pregunta y mostrar la respuesta con la tabla | La gerencia pregunta en sus palabras | Y la gerencia pregunta con sus palabras: qué médicos bajaron su prescripción y no fueron visitados. |
| 1:20–1:26 | Plano de cierre generado por IA + logo | Pedí una demo · tu-web.com | Presentador. Pedí una demostración. |

**Regla de oro:** si tenés que cortar algo por tiempo, cortá el stock. **Nunca** cortes el reporte por voz:
es lo que nadie más muestra.

---

## Prompt 1 · Voz en off (ElevenLabs, Speechify o similar)

**Configuración:** voz en español rioplatense o latino neutro, tono profesional y cálido, ritmo
pausado. En ElevenLabs: *Stability* 50, *Similarity* 75, *Speed* 0,95. Modelo multilingüe.

**Texto a pegar** (las etiquetas `<break>` funcionan en ElevenLabs; si tu herramienta no las acepta,
borralas y separá en párrafos):

> Tu fuerza de ventas trabaja en la calle, muchas veces sin señal. <break time="0.5s" />
> Esta es su agenda del día, con la ruta y un check-in que registra a qué distancia del consultorio se hizo. <break time="0.4s" />
> Las presentaciones se pasan como páginas de papel, y cada dato se puede abrir frente al médico. <break time="0.4s" />
> El stock es en tiempo real, y las muestras se piden sin salir de la visita. <break time="0.6s" />
> Y al cerrar, el visitador solo habla. <break time="0.3s" />
> La inteligencia artificial transcribe, reconoce los productos y las muestras que dejó, clasifica el feedback del médico, <break time="0.3s" /> y detecta un posible evento adverso para notificarlo a farmacovigilancia. <break time="0.5s" />
> La firma de recepción queda registrada con su lote y su vencimiento. <break time="0.4s" />
> Sin conexión, todo sigue funcionando y se sincroniza solo cuando vuelve la señal. <break time="0.5s" />
> Y la gerencia pregunta con sus palabras: qué médicos bajaron su prescripción y no fueron visitados. <break time="0.6s" />
> Presentador. Pedí una demostración.

---

## Prompt 2 · Plano de entrada (6 s)

**Nano Banana — imagen:**
> Animación 3D corporativa premium, estética clínica y sobria. Una tablet oscura flotando en un
> espacio azul noche muy profundo, vista en ángulo de tres cuartos, con luz de estudio suave y
> reflejos sutiles en el vidrio. Alrededor, partículas celestes muy tenues y líneas de datos
> abstractas que sugieren conexión. Pantalla de la tablet apagada o con luz difusa, **sin interfaz
> visible, sin texto, sin logotipos, sin marcas, sin personas**. Mucho espacio negativo a la
> izquierda para colocar un título. Formato 16:9. Paleta: azul muy oscuro #0b1220, celeste #7cc4ee,
> blancos fríos.

**Veo 3.1 — video de 6 segundos, usando esa imagen como primer fotograma:**
> Acercamiento lento y continuo hacia la tablet, con las partículas celestes desplazándose con
> suavidad hacia la cámara. La luz de la pantalla crece apenas hasta iluminar el borde. Movimiento
> elegante y sin cortes. Sin audio, sin texto en pantalla.

## Prompt 3 · Plano de cierre (5 s)

**Nano Banana — imagen:**
> Mismo estilo y paleta que el plano anterior. Composición abstracta y minimalista: un mapa de
> calles estilizado en líneas celestes muy finas sobre fondo azul noche, con unos pocos puntos
> luminosos conectados entre sí. **Sin texto, sin nombres de calles, sin logotipos, sin personas.**
> Centro del cuadro despejado para superponer un logo. Formato 16:9.

**Veo 3.1 — video de 5 segundos:**
> Los puntos luminosos se encienden uno tras otro y se conectan con líneas de luz que recorren el
> mapa. Cámara casi quieta, con un alejamiento mínimo. Termina en un plano estable y en calma.
> Sin audio.

## Prompt 4 · Música (Suno o similar)

> Instrumental corporativo minimalista, 90 bpm, piano suave con un pulso electrónico sutil y bajo
> cálido. Tono optimista pero tranquilo y profesional, estilo tecnología médica. Sin voces, sin
> percusión fuerte. Estructura: entrada suave, crecimiento leve a la mitad, cierre limpio.
> Duración 90 segundos.

Mezclá la música entre −22 y −18 dB para que no le gane a la voz.

---

## Prompt 5 · Para una IA de edición (Descript, Captions, Clipchamp)

Pegá esto junto con las grabaciones y la voz en off:

> Armá un video de producto de 85 segundos, formato 16:9, 1080p, para un software de visitadores
> médicos. Usá la voz en off adjunta como eje: cada corte de imagen tiene que caer con la frase que
> la nombra. Estilo: cortes limpios, sin transiciones llamativas, un fundido de 0,3 segundos entre
> escenas. Agregá subtítulos siempre visibles, en español, tipografía sans serif, texto blanco con
> fondo oscuro semitransparente, en el tercio inferior. Cuando la voz nombre una función, mostrá un
> cartel breve en la esquina superior izquierda con ese nombre, de 2 segundos, entrando con un
> desplazamiento corto. Acercá la imagen un 15 % sobre el área donde ocurre la acción en las escenas
> del reporte por voz y del asistente. Paleta de gráficos: azul muy oscuro #0b1220 y celeste #7cc4ee.
> Música de fondo a −20 dB. No agregues efectos de sonido ni voces adicionales.

---

## Versiones para sacar del mismo material

| Dónde | Formato | Duración | Qué dejar |
| --- | --- | --- | --- |
| Reunión comercial y web | 16:9 | 85 s | Todo |
| LinkedIn | 1:1 o 4:5 | 45 s | Voz, reporte por voz, asistente y cierre |
| WhatsApp a un contacto | 9:16 | 30 s | Solo el reporte por voz, con subtítulos grandes |

Subilo a YouTube como "no listado" y compartí el enlace: evita mandar archivos pesados por WhatsApp,
que los recomprime y se ven mal.

---

---

## Reel vertical para redes · generado desde la app

Además del video largo, hay una pieza corta pensada para Instagram, TikTok y LinkedIn que **no se edita a
mano**: la genera un script que maneja la app de verdad y graba lo que pasa en pantalla.

```bash
python manual/reel.py
```

Compila la app, la levanta en un servidor local, la recorre en un viewport de celular con Playwright
grabando video, anota en qué segundo ocurre cada momento y compone con ffmpeg una pieza de 1080×1920 sobre
el fondo de la marca, con los rótulos ya puestos. Sale `Reel-IO-Pharma.mp4` en la raíz.

**Por qué importa que sea un script y no una edición:** cada vez que cambia la interfaz, el reel se vuelve a
generar y queda al día. Un video editado a mano envejece con el primer rediseño.

### Qué muestra, en orden

| Tramo | Qué se ve | Rótulo |
| --- | --- | --- |
| 1 | La agenda del día con el mapa y las visitas | La ruta del día |
| 2 | El check-in sobre la próxima visita | Check-in en el consultorio |
| 3 | La presentación, pasando pantallas con el dedo | La presentación, en la tablet |
| 4 | El dictado completando los campos del CRM | El reporte por voz |
| 5 | La firma de recepción de muestras | Muestras con firma |

### Para cambiarlo

- **Los momentos y sus textos** están en `guion()`, en las llamadas a `reloj.marcar(...)`. Los tiempos de
  los rótulos salen solos de ahí: no hay que sincronizar nada a mano.
- **La duración buscada** es la constante `OBJETIVO` (30 s). Si el recorrido sale más largo, el script
  acelera el video para llegar; nunca lo estira.
- **El encuadre** (tamaño del teléfono, márgenes, tipografías) está en `componer()`.

### Texto sugerido para la publicación

> Un visitador médico pierde entre 40 y 60 minutos por día cargando a mano lo que ya hizo.
> Esto es IO-Pharma: la visita se cierra hablando, y el CRM se completa solo.
> Funciona sin señal, porque el consultorio no siempre tiene.
>
> #visitamedica #pharma #healthtech #laboratorios #Argentina

### Antes de publicar

- La música se agrega afuera: el script no le pone audio, justamente para que se pueda elegir una pista con
  licencia.
- Los datos son ficticios y los productos también (Lipvera y Respirel). Conviene que el pie lo aclare.
- Para LinkedIn conviene además una versión cuadrada: se obtiene cambiando `LIENZO` a `(1080, 1080)` y
  bajando `pantalla_w`.

## Cuidados antes de mostrarlo a un laboratorio

- Las marcas de la demo son inventadas (Lipvera y Respirel) y los médicos también.
  **Dejalo así**, y aclará "datos ficticios" en algún momento del video.
- No uses imágenes de personas generadas con IA que puedan leerse como un médico real dando una opinión.
- Si el video muestra el reporte por voz, dejá claro que el visitador revisa y confirma antes de
  guardar. Es la diferencia entre una herramienta que ayuda y una que un área de calidad va a frenar.
