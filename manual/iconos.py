"""
Genera los íconos de la app instalable a partir del monograma IO-Pharma.

Uso:  python manual/iconos.py
Sale: icon.svg, icon-192.png, icon-512.png, icon-maskable-512.png y apple-touch-icon.png
      en presentador/public/, más las capturas del manifiesto.
"""

from pathlib import Path

from playwright.sync_api import sync_playwright
from PIL import Image

RAIZ = Path(__file__).resolve().parent.parent
PUBLICO = RAIZ / 'presentador' / 'public'
CAPTURAS = Path(__file__).resolve().parent / 'capturas'

TINTA = '#0b1220'
CELESTE = '#7cc4ee'


def svg(lado=512, escala=1.0):
    """Monograma IO: cuadrado redondeado con las iniciales y el punto de la marca."""
    c = lado / 2
    r = lado * 0.22 * escala
    fuente = lado * 0.38 * escala
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {lado} {lado}" width="{lado}" height="{lado}">
  <rect width="{lado}" height="{lado}" rx="{r}" fill="{TINTA}"/>
  <text x="{c - lado * 0.015 * escala}" y="{c + fuente * 0.36}" text-anchor="middle"
        font-family="Segoe UI, Helvetica, Arial, sans-serif" font-weight="700"
        font-size="{fuente}" fill="#ffffff" letter-spacing="{-fuente * 0.03}">IO</text>
  <circle cx="{c + lado * 0.235 * escala}" cy="{c + lado * 0.1 * escala}" r="{lado * 0.055 * escala}" fill="{CELESTE}"/>
</svg>'''


def png_desde_svg(page, contenido, destino, lado, fondo=None):
    page.set_viewport_size({'width': lado, 'height': lado})
    relleno = f'background:{fondo};' if fondo else 'background:transparent;'
    page.set_content(f'<body style="margin:0;{relleno}">{contenido}</body>')
    page.wait_for_timeout(120)
    page.screenshot(path=str(destino), omit_background=fondo is None)
    print('  ', destino.name)


def captura_manifiesto(origen, destino, ancho, alto):
    if not origen.exists():
        return
    with Image.open(origen) as im:
        copia = im.convert('RGB').resize((ancho, alto), Image.LANCZOS)
        copia.save(destino, 'PNG', optimize=True)
    print('  ', destino.name)


def main():
    (PUBLICO / 'icon.svg').write_text(svg(), encoding='utf-8')
    print('Íconos:')
    with sync_playwright() as p:
        navegador = p.chromium.launch()
        page = navegador.new_page(device_scale_factor=1)
        png_desde_svg(page, svg(512), PUBLICO / 'icon-512.png', 512)
        png_desde_svg(page, svg(512), PUBLICO / 'icon-192.png', 192)
        png_desde_svg(page, svg(512), PUBLICO / 'apple-touch-icon.png', 180, fondo=TINTA)
        # maskable: el contenido entra en el 60 % central para que ningún recorte lo corte
        png_desde_svg(page, svg(512, 0.62).replace(f'rx="{512 * 0.22 * 0.62}"', 'rx="0"'), PUBLICO / 'icon-maskable-512.png', 512, fondo=TINTA)
        navegador.close()

    print('Capturas del instalador:')
    captura_manifiesto(CAPTURAS / 'apm-hoy.png', PUBLICO / 'captura-escritorio.png', 1280, 800)
    captura_manifiesto(CAPTURAS / 'movil-hoy.png', PUBLICO / 'captura-movil.png', 750, 1624)


if __name__ == '__main__':
    main()
