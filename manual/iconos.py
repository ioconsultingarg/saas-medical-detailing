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


def marca(color='#ffffff', acento=CELESTE, escala=1.0):
    """Conector de datos: barra y anillo arman el monograma IO y leen como dos nodos unidos."""
    e = escala
    return f'''
  <g transform="translate({32 - 32 * e} {32 - 32 * e}) scale({e})" fill="none" stroke="{color}" stroke-linecap="round">
    <path d="M13.5 19 L13.5 45" stroke-width="7.5"/>
    <path d="M13.5 32 L33 32" stroke-width="5"/>
    <circle cx="45.5" cy="32" r="12.5" stroke-width="7.5"/>
  </g>
  <circle cx="{32 - 32 * e + 25 * e}" cy="32" r="{4.8 * e}" fill="{acento}"/>'''


def svg(lado=512, escala=1.0, redondeo=0.22):
    """Baldosa con la marca; escala < 1 deja el margen que pide un icono recortable."""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="{lado}" height="{lado}">
  <rect width="64" height="64" rx="{64 * redondeo}" fill="{TINTA}"/>{marca(escala=escala)}
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
        png_desde_svg(page, svg(192), PUBLICO / 'icon-192.png', 192)
        png_desde_svg(page, svg(180), PUBLICO / 'apple-touch-icon.png', 180, fondo=TINTA)
        # maskable: el contenido entra en el 60 % central para que ningún recorte lo corte
        png_desde_svg(page, svg(512, 0.66, redondeo=0), PUBLICO / 'icon-maskable-512.png', 512, fondo=TINTA)
        navegador.close()

    print('Capturas del instalador:')
    captura_manifiesto(CAPTURAS / 'apm-hoy.png', PUBLICO / 'captura-escritorio.png', 1280, 800)
    captura_manifiesto(CAPTURAS / 'movil-hoy.png', PUBLICO / 'captura-movil.png', 750, 1624)


if __name__ == '__main__':
    main()
