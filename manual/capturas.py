"""
Toma las capturas reales de la app para el manual.

Levanta la versión compilada con `vite preview`, recorre las pantallas clave
y guarda cada imagen en manual/capturas/.

Uso:  python manual/capturas.py
"""

import subprocess
import sys
import time
from pathlib import Path

from playwright.sync_api import sync_playwright

RAIZ = Path(__file__).resolve().parent.parent
APP = RAIZ / 'presentador'
DESTINO = Path(__file__).resolve().parent / 'capturas'
PUERTO = 4319
BASE = f'http://localhost:{PUERTO}/saas-medical-detailing/'

SESION_APM = {'email': 'lucia.romero@laboratoriodemo.com', 'nombre': 'Lucía Romero', 'rol': 'apm', 'cargo': 'Visitadora médica'}
SESION_LAB = {'email': 'martin.sosa@laboratoriodemo.com', 'nombre': 'Martín Sosa', 'rol': 'lab', 'cargo': 'Gerente de producto'}

# sin animaciones de entrada las capturas salen siempre iguales
SIN_MOVIMIENTO = """
  *, *::before, *::after {
    animation-duration: 0s !important;
    animation-delay: 0s !important;
    transition-duration: 0s !important;
  }
  ::-webkit-scrollbar { width: 0 !important; height: 0 !important; }
"""


def esperar(page, ms=900):
    page.wait_for_timeout(ms)


def sesion(page, datos):
    page.evaluate(
        "d => localStorage.setItem('presentador-sesion', JSON.stringify({ ...d, desde: Date.now() }))",
        datos,
    )


def ir(page, hash_ruta, ms=1200):
    page.evaluate('h => { location.hash = h }', hash_ruta)
    esperar(page, ms)


def guardar(page, nombre, selector=None):
    DESTINO.mkdir(exist_ok=True)
    destino = DESTINO / f'{nombre}.png'
    if selector:
        page.locator(selector).first.screenshot(path=str(destino))
    else:
        page.screenshot(path=str(destino))
    print('  capturada', destino.name)


def capturar(page, movil):
    # ---------------- app del visitador
    page.goto(BASE, wait_until='networkidle')
    page.evaluate("localStorage.removeItem('presentador-demo-v4')")
    sesion(page, SESION_APM)
    page.reload(wait_until='networkidle')
    esperar(page, 1500)
    page.add_style_tag(content=SIN_MOVIMIENTO)

    guardar(page, 'apm-hoy')

    ir(page, '#/medicos')
    guardar(page, 'apm-medicos')

    ir(page, '#/medicos/m4', 1500)
    guardar(page, 'apm-ficha-medico')

    ir(page, '#/biblioteca', 1500)
    guardar(page, 'apm-biblioteca')

    ir(page, '#/stock')
    guardar(page, 'apm-stock')

    # presentación: portada con sus recursos
    ir(page, '#/presentar/p-cardio', 1800)
    guardar(page, 'apm-presentar')

    # un recurso abierto sobre la presentación
    page.get_by_role('button', name='Ficha técnica').first.click()
    esperar(page, 1000)
    guardar(page, 'apm-recurso-ficha')
    page.keyboard.press('Escape')
    esperar(page, 600)

    # check-in y cierre de visita con el reporte por voz
    ir(page, '#/')
    page.get_by_role('button', name='Hacer check-in').first.click()
    esperar(page, 1200)
    ir(page, '#/cierre/registro', 1500)
    page.get_by_role('button', name='audio de ejemplo').first.click()
    page.wait_for_selector('text=Campos del CRM', timeout=45000)
    esperar(page, 1200)
    guardar(page, 'apm-voz')

    page.get_by_role('button', name='Aplicar al registro').first.click()
    esperar(page, 1400)
    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
    esperar(page, 800)
    guardar(page, 'apm-firma')

    ir(page, '#/actividad', 1400)
    guardar(page, 'apm-actividad')

    ir(page, '#/academia', 1400)
    guardar(page, 'apm-academia')

    # ---------------- portal del laboratorio
    sesion(page, SESION_LAB)
    page.evaluate("location.hash = '#/lab'")
    page.reload(wait_until='networkidle')
    esperar(page, 1800)
    page.add_style_tag(content=SIN_MOVIMIENTO)
    guardar(page, 'lab-material')

    page.get_by_role('button', name='Nueva evidencia').first.click()
    esperar(page, 1100)
    guardar(page, 'lab-pieza')
    page.keyboard.press('Escape')
    esperar(page, 700)

    ir(page, '#/lab/catalogo', 1400)
    guardar(page, 'lab-catalogo')

    ir(page, '#/lab/equipo', 1400)
    guardar(page, 'lab-equipo')

    ir(page, '#/lab/farmacovigilancia', 1400)
    guardar(page, 'lab-farmacovigilancia')

    ir(page, '#/asistente', 1400)
    page.get_by_role('button', name='bajaron su prescripción').first.click()
    page.wait_for_selector('text=Cómo lo calculé', timeout=30000)
    esperar(page, 1500)
    guardar(page, 'lab-asistente')

    # ---------------- la misma app en celular
    movil.goto(BASE, wait_until='networkidle')
    sesion(movil, SESION_APM)
    movil.reload(wait_until='networkidle')
    esperar(movil, 1600)
    movil.add_style_tag(content=SIN_MOVIMIENTO)
    guardar(movil, 'movil-hoy')


def main():
    print('Compilando la app…')
    subprocess.run(['npm', 'run', 'build'], cwd=APP, check=True, shell=True, stdout=subprocess.DEVNULL)

    print('Levantando el servidor…')
    servidor = subprocess.Popen(
        ['npx', 'vite', 'preview', '--port', str(PUERTO), '--strictPort'],
        cwd=APP, shell=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    try:
        time.sleep(4)
        with sync_playwright() as p:
            navegador = p.chromium.launch()
            escritorio = navegador.new_context(viewport={'width': 1440, 'height': 900}, device_scale_factor=2, locale='es-AR')
            celular = navegador.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=3, locale='es-AR', is_mobile=True, has_touch=True)
            try:
                capturar(escritorio.new_page(), celular.new_page())
            finally:
                navegador.close()
    finally:
        servidor.terminate()
    print('Listo. Capturas en', DESTINO)


if __name__ == '__main__':
    sys.exit(main())
