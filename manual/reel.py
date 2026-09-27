"""
Graba el reel vertical de IO-Pharma para redes.

Recorre la app en un viewport de celular con Playwright grabando video, anota en qué
segundo pasa cada momento, y después arma con ffmpeg una pieza 1080x1920 sobre el fondo
de la marca, con el rótulo de cada tramo.

Uso:  python manual/reel.py
Sale: Reel-IO-Pharma.mp4 en la raíz del proyecto.
"""

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
APP = RAIZ / 'presentador'
TEMP = Path(__file__).resolve().parent / 'reel-temp'
SALIDA = RAIZ / 'Reel-IO-Pharma.mp4'
PUERTO = 4321
BASE = f'http://localhost:{PUERTO}/saas-medical-detailing/'

ANCHO, ALTO = 540, 1170          # el viewport que se graba
LIENZO = (1080, 1920)            # la pieza final
OBJETIVO = 30.0                  # duración buscada: un reel se mira entero hasta acá
SESION = {'email': 'lucia.romero@laboratoriodemo.com', 'nombre': 'Lucía Romero', 'rol': 'apm', 'cargo': 'Visitadora médica'}

FUENTE = 'C\\:/Windows/Fonts/segoeuib.ttf'
FUENTE_LIVIANA = 'C\\:/Windows/Fonts/segoeui.ttf'


class Reloj:
    """Anota en qué segundo del video empieza cada momento."""

    def __init__(self):
        self.t0 = time.time()
        self.marcas = []

    def marcar(self, titulo, bajada):
        self.marcas.append({'t': time.time() - self.t0, 'titulo': titulo, 'bajada': bajada})

    def tramos(self, fin):
        """Convierte las marcas en tramos (desde, hasta) sin huecos."""
        salida = []
        for i, m in enumerate(self.marcas):
            hasta = self.marcas[i + 1]['t'] if i + 1 < len(self.marcas) else fin
            salida.append((m['t'], hasta, m['titulo'], m['bajada']))
        return salida


def esperar(page, ms):
    page.wait_for_timeout(ms)


def deslizar(page, hacia=-1):
    """Pasa de pantalla como lo haría un dedo: el gesto se ve mejor que un click."""
    y = ALTO * 0.55
    desde = ANCHO * (0.78 if hacia < 0 else 0.22)
    hasta = ANCHO * (0.16 if hacia < 0 else 0.84)
    page.mouse.move(desde, y)
    page.mouse.down()
    for i in range(1, 15):
        page.mouse.move(desde + (hasta - desde) * i / 14, y)
        page.wait_for_timeout(12)
    page.mouse.up()


def guion(page, reloj):
    """El recorrido que se graba. Los tiempos están pensados para que se pueda leer."""
    page.goto(BASE, wait_until='networkidle')
    page.evaluate(
        "d => { localStorage.removeItem('presentador-demo-v4'); localStorage.setItem('presentador-sesion', JSON.stringify({...d, desde: Date.now()})) }",
        SESION,
    )
    page.reload(wait_until='networkidle')
    esperar(page, 1800)

    # 1. la agenda del día
    reloj.marcar('La ruta del día', 'Ocho consultorios, en orden y con el mapa')
    for _ in range(6):
        page.mouse.wheel(0, 130)
        esperar(page, 110)
    esperar(page, 500)
    page.mouse.wheel(0, -900)
    esperar(page, 700)

    # 2. check-in
    reloj.marcar('Check-in en el consultorio', 'La ubicación se toma acá, y solo acá')
    page.get_by_role('button', name='Hacer check-in').first.click()
    esperar(page, 2400)

    # 3. presentación
    reloj.marcar('La presentación, en la tablet', 'Material aprobado, con o sin señal')
    page.evaluate("location.hash = '#/presentar/p-cardio'")
    esperar(page, 2400)
    for _ in range(3):
        deslizar(page)
        esperar(page, 1400)
    esperar(page, 600)

    # 4. reporte por voz
    reloj.marcar('El reporte por voz', 'Hablás y el CRM se completa solo')
    page.evaluate("location.hash = '#/cierre/registro'")
    esperar(page, 1600)
    page.get_by_role('button', name='audio de ejemplo').first.click()
    page.wait_for_selector('text=Campos del CRM', timeout=45000)
    esperar(page, 2400)
    page.get_by_role('button', name='Aplicar al registro').first.click()
    esperar(page, 1600)

    # 5. muestras y firma
    reloj.marcar('Muestras con firma', 'Lote, vencimiento y trazabilidad')
    page.evaluate('window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" })')
    esperar(page, 1500)
    recuadro = page.locator('canvas[aria-label="Área de firma"]').first
    if recuadro.count():
        caja = recuadro.bounding_box()
        if caja:
            x, y = caja['x'] + 40, caja['y'] + caja['height'] * 0.6
            page.mouse.move(x, y)
            page.mouse.down()
            for i in range(28):
                page.mouse.move(x + i * 9, y - (30 if i % 2 else -18) * (1 - i / 40))
                page.wait_for_timeout(16)
            page.mouse.up()
    esperar(page, 1800)


def grabar():
    if TEMP.exists():
        shutil.rmtree(TEMP)
    TEMP.mkdir(parents=True)

    print('Compilando la app…')
    subprocess.run(['npm', 'run', 'build'], cwd=APP, check=True, shell=True, stdout=subprocess.DEVNULL)
    print('Levantando el servidor…')
    servidor = subprocess.Popen(
        ['npx', 'vite', 'preview', '--port', str(PUERTO), '--strictPort'],
        cwd=APP, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    reloj = Reloj()
    try:
        time.sleep(4)
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            ctx = navegador.new_context(
                viewport={'width': ANCHO, 'height': ALTO}, device_scale_factor=2,
                locale='es-AR', is_mobile=True, has_touch=True,
                record_video_dir=str(TEMP), record_video_size={'width': ANCHO, 'height': ALTO},
            )
            reloj.t0 = time.time()
            page = ctx.new_page()
            print('Grabando el recorrido…')
            guion(page, reloj)
            ctx.close()
            navegador.close()
    finally:
        servidor.terminate()

    videos = sorted(TEMP.glob('*.webm'))
    if not videos:
        raise SystemExit('no se grabó ningún video')
    (TEMP / 'marcas.json').write_text(json.dumps(reloj.marcas, ensure_ascii=False), encoding='utf-8')
    return videos[0], reloj


def duracion(ruta):
    salida = subprocess.run(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'json', str(ruta)],
        capture_output=True, text=True, check=True,
    )
    return float(json.loads(salida.stdout)['format']['duration'])


def normalizar(crudo):
    """El webm de Playwright trae saltos de tiempo: se pasa a cuadros parejos antes de componer."""
    destino = TEMP / 'crudo.mp4'
    subprocess.run(
        ['ffmpeg', '-y', '-fflags', '+genpts', '-i', str(crudo), '-vf', 'fps=30',
         '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '16', '-pix_fmt', 'yuv420p', str(destino)],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    return destino


def escapar(texto):
    """drawtext: los dos puntos y las comillas hay que escaparlos."""
    return texto.replace('\\', r'\\').replace(':', r'\:').replace("'", r"\'")


def rotulo(entrada, salida, desde, hasta, titulo, bajada):
    fundido = f"if(lt(t,{desde}+0.35),(t-{desde})/0.35,if(lt(t,{hasta}-0.35),1,({hasta}-t)/0.35))"
    return [
        f"[{entrada}]drawtext=fontfile='{FUENTE}':text='{escapar(titulo)}':fontcolor=0xe9eef8:fontsize=60:"
        f"x=(w-text_w)/2:y=150:alpha='{fundido}':enable='between(t,{desde},{hasta})'[{salida}a]",
        f"[{salida}a]drawtext=fontfile='{FUENTE_LIVIANA}':text='{escapar(bajada)}':fontcolor=0x8593a6:fontsize=34:"
        f"x=(w-text_w)/2:y=228:alpha='{fundido}':enable='between(t,{desde},{hasta})'[{salida}]",
    ]


SUBTITULOS = Path(__file__).resolve().parent / 'reel-subtitulos.srt'

# OJO: el .srt esta escrito a mano contra ESTE corte. Si se vuelve a grabar y los tiempos
# cambian, hay que re-temporizarlo; los rotulos, en cambio, se re-temporizan solos.
SUB_Y = (1592, 1660)     # dos renglones en la franja libre entre el telefono y la firma
SUB_TAM = 40


def leer_srt(ruta):
    """Devuelve [(desde, hasta, [lineas])] con los tiempos en segundos."""
    def seg(t):
        h, m, resto = t.split(':')
        s_, ms = resto.split(',')
        return int(h) * 3600 + int(m) * 60 + int(s_) + int(ms) / 1000

    bloques = []
    for bruto in ruta.read_text(encoding='utf-8').replace('\r\n', '\n').strip().split('\n\n'):
        lineas = [l for l in bruto.strip().split('\n') if l.strip()]
        if len(lineas) < 3 or '-->' not in lineas[1]:
            continue
        a, b = [x.strip() for x in lineas[1].split('-->')]
        bloques.append((seg(a), seg(b), lineas[2:]))
    return bloques


def componer(crudo, tramos, ritmo, recorte=0.0, subtitulos=False):
    """La pantalla sobre el fondo de la marca, con los rótulos encima."""
    w, h = LIENZO
    pantalla_w = 880
    pantalla_h = round(pantalla_w * ALTO / ANCHO)
    px, py = (w - pantalla_w) // 2, 296
    # queda libre la franja de subtitulos (1600-1740) y la de la firma de marca
    visible_h = 1284

    tramos = [(max(0.0, a - recorte), b - recorte, t, j) for a, b, t, j in tramos]
    filtros = [
        f'color=c=0x0a0f16:s={w}x{h}[fondo]',
        f'[0:v]setpts=PTS/{ritmo:.4f},scale={pantalla_w}:{pantalla_h}:flags=lanczos,'
        f'crop={pantalla_w}:{visible_h}:0:0[app]',
        f'[fondo][app]overlay={px}:{py}:shortest=1[base]',
    ]
    ultimo = 'base'
    for i, (desde, hasta, titulo, bajada) in enumerate(tramos):
        filtros += rotulo(ultimo, f'r{i}', round(desde / ritmo, 2), round(hasta / ritmo, 2), titulo, bajada)
        ultimo = f'r{i}'

    filtros.append(
        f"[{ultimo}]drawtext=fontfile='{FUENTE}':text='IO-Pharma':fontcolor=0xe9eef8:fontsize=40:"
        f"x=(w-text_w)/2:y=h-118[marca]"
    )
    cierre = (
        f"[marca]drawtext=fontfile='{FUENTE_LIVIANA}':text='e-detailing y CRM para laboratorios':"
        f"fontcolor=0x56a9dd:fontsize=29:x=(w-text_w)/2:y=h-64"
    )
    filtros.append(cierre + '[cierre]')

    # los subtitulos tambien son drawtext: asi el tamano y la posicion son pixeles del lienzo
    ultimo = 'cierre'
    if subtitulos and SUBTITULOS.exists():
        for i, (desde, hasta, texto) in enumerate(leer_srt(SUBTITULOS)):
            for j, linea in enumerate(texto[:2]):
                etiqueta = f's{i}_{j}'
                filtros.append(
                    f"[{ultimo}]drawtext=fontfile='{FUENTE}':text='{escapar(linea)}':fontcolor=0xf8fafc:"
                    f"fontsize={SUB_TAM}:x=(w-text_w)/2:y={SUB_Y[j]}:expansion=none:box=1:boxcolor=0x060a11@0.82:"
                    f"boxborderw=14:enable='between(t,{desde},{hasta})'[{etiqueta}]"
                )
                ultimo = etiqueta
    filtros.append(f'[{ultimo}]format=yuv420p[salida]')

    print('Componiendo la pieza…')
    subprocess.run(
        ['ffmpeg', '-y', '-ss', f'{recorte:.2f}', '-i', str(crudo), '-filter_complex', ';'.join(filtros),
         '-map', '[salida]', '-r', '30', '-c:v', 'libx264', '-preset', 'medium', '-crf', '23',
         '-profile:v', 'high', '-level', '4.1', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', str(SALIDA)],
        check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )


def main():
    global SALIDA
    subs = '--subtitulos' in sys.argv
    if subs:
        SALIDA = RAIZ / 'Reel-IO-Pharma-subtitulado.mp4'

    # `python manual/reel.py --recomponer` rearma la pieza sin volver a grabar
    if '--recomponer' in sys.argv and (TEMP / 'crudo.mp4').exists():
        reloj = Reloj()
        reloj.marcas = json.loads((TEMP / 'marcas.json').read_text(encoding='utf-8'))
        cfr = TEMP / 'crudo.mp4'
        real = duracion(cfr)
        recorte = max(0.0, reloj.marcas[0]['t'] - 0.2) if reloj.marcas else 0.0
        componer(cfr, reloj.tramos(real), max(1.0, (real - recorte) / OBJETIVO), recorte, subs)
        print('Listo:', SALIDA, '·', round(duracion(SALIDA), 1), 's')
        return

    crudo, reloj = grabar()
    cfr = normalizar(crudo)
    real = duracion(cfr)
    print('  crudo:', round(real, 1), 's')
    # la carga inicial no se muestra: el reel arranca en la primera pantalla util
    recorte = max(0.0, reloj.marcas[0]['t'] - 0.2) if reloj.marcas else 0.0
    ritmo = max(1.0, (real - recorte) / OBJETIVO)   # solo se acelera, nunca se estira
    componer(cfr, reloj.tramos(real), ritmo, recorte, subs)
    print('Listo:', SALIDA, '·', round(duracion(SALIDA), 1), 's ·',
          round(SALIDA.stat().st_size / 1e6, 1), 'MB')


if __name__ == '__main__':
    sys.exit(main())
