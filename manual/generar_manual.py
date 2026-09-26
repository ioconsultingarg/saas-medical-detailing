"""
Genera el manual oficial de IO-Pharma en PDF.

Uso:  python manual/generar_manual.py
Sale: Manual-IO-Pharma.pdf en la raíz del proyecto.
"""

from datetime import date
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_JUSTIFY, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    BaseDocTemplate,
    Image,
    Frame,
    KeepTogether,
    NextPageTemplate,
    PageBreak,
    PageTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.platypus.tableofcontents import TableOfContents

# ---------------------------------------------------------------- identidad

TINTA = colors.HexColor('#0b1220')
TINTA2 = colors.HexColor('#334155')
TINTA3 = colors.HexColor('#56617a')
LINEA = colors.HexColor('#e2e6ec')
FONDO = colors.HexColor('#f7f8fa')
ACENTO = colors.HexColor('#0369a1')
ACENTO_SUAVE = colors.HexColor('#e3f1f9')
IA = colors.HexColor('#5b3fd6')
CARDIO = colors.HexColor('#0a6b5d')
CELESTE = colors.HexColor('#7cc4ee')
OK = colors.HexColor('#047857')

VERSION = '1.0'
FECHA = date.today().strftime('%m/%Y')

MARGEN = 20 * mm
ANCHO_UTIL = A4[0] - 2 * MARGEN

# ---------------------------------------------------------------- estilos

base = getSampleStyleSheet()


def estilo(nombre, **kw):
    return ParagraphStyle(nombre, parent=base['Normal'], **kw)


E = {
    'h1': estilo('h1', fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=TINTA, spaceBefore=0, spaceAfter=4),
    'h2': estilo('h2', fontName='Helvetica-Bold', fontSize=13.5, leading=17, textColor=TINTA, spaceBefore=16, spaceAfter=5),
    'h3': estilo('h3', fontName='Helvetica-Bold', fontSize=11, leading=14, textColor=TINTA2, spaceBefore=11, spaceAfter=3),
    'p': estilo('p', fontSize=9.6, leading=14.4, textColor=TINTA2, alignment=TA_JUSTIFY, spaceAfter=7),
    'lead': estilo('lead', fontSize=10.6, leading=16, textColor=TINTA3, spaceAfter=10),
    'li': estilo('li', fontSize=9.6, leading=14, textColor=TINTA2, leftIndent=10, bulletIndent=1, spaceAfter=3),
    'celda': estilo('celda', fontSize=9, leading=12.6, textColor=TINTA2),
    'celda_b': estilo('celda_b', fontName='Helvetica-Bold', fontSize=9, leading=12.6, textColor=TINTA),
    'cab': estilo('cab', fontName='Helvetica-Bold', fontSize=8, leading=11, textColor=colors.white),
    'nota': estilo('nota', fontSize=9.2, leading=13.4, textColor=TINTA2),
    'pie': estilo('pie', fontSize=7.6, leading=10, textColor=TINTA3),
    'h1_simple': estilo('h1_simple', fontName='Helvetica-Bold', fontSize=20, leading=24, textColor=TINTA, spaceAfter=4),
    'toc1': estilo('toc1', fontName='Helvetica-Bold', fontSize=10.5, leading=15, spaceBefore=5, textColor=TINTA),
    'toc2': estilo('toc2', fontSize=9.2, leading=12.6, textColor=TINTA2, leftIndent=14),
}


def P(texto, e='p'):
    return Paragraph(texto, E[e])


def vinetas(items, color=ACENTO):
    return [Paragraph(f'<font color="{color.hexval()}">▪</font>&nbsp;&nbsp;{t}', E['li']) for t in items]


def pasos(items):
    """Lista numerada con el número en un círculo de color."""
    filas = [[Paragraph(f'<b><font color="{ACENTO.hexval()}">{i + 1}</font></b>', E['celda']), P(t, 'celda')] for i, t in enumerate(items)]
    t = Table(filas, colWidths=[9 * mm, ANCHO_UTIL - 9 * mm])
    t.setStyle(TableStyle([
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (0, -1), 2),
    ]))
    return t


def tabla(cabeceras, filas, anchos=None):
    datos = [[Paragraph(c, E['cab']) for c in cabeceras]]
    for f in filas:
        datos.append([Paragraph(c, E['celda_b'] if i == 0 else E['celda']) for i, c in enumerate(f)])
    if anchos is None:
        anchos = [ANCHO_UTIL / len(cabeceras)] * len(cabeceras)
    t = Table(datos, colWidths=anchos, repeatRows=1)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TINTA),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, FONDO]),
        ('LINEBELOW', (0, 1), (-1, -1), 0.4, LINEA),
        ('BOX', (0, 0), (-1, -1), 0.4, LINEA),
    ]))
    return t


CAPTURAS = Path(__file__).resolve().parent / 'capturas'
_figuras = [0]


def figura(nombre, pie, ancho_mm=150):
    """Captura real de la app, con marco y epígrafe numerado."""
    ruta = CAPTURAS / f'{nombre}.png'
    if not ruta.exists():
        return Spacer(1, 0)
    from PIL import Image as PILImage
    # las capturas vienen al doble de resolución: se achican para que el PDF no pese de más
    liviana = CAPTURAS / 'opt' / f'{nombre}.jpg'
    with PILImage.open(ruta) as im:
        proporcion = im.height / im.width
        if not liviana.exists() or liviana.stat().st_mtime < ruta.stat().st_mtime:
            liviana.parent.mkdir(exist_ok=True)
            objetivo = min(im.width, int(ancho_mm / 25.4 * 240))
            copia = im.convert('RGB').resize((objetivo, int(objetivo * proporcion)), PILImage.LANCZOS)
            copia.save(liviana, 'JPEG', quality=88, optimize=True)
    ruta = liviana
    ancho = ancho_mm * mm
    _figuras[0] += 1
    marco = Table([[Image(str(ruta), width=ancho, height=ancho * proporcion)]], colWidths=[ancho])
    marco.setStyle(TableStyle([
        ('BOX', (0, 0), (-1, -1), 0.5, LINEA),
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
    ]))
    epigrafe = Paragraph(
        f'<font color="{TINTA.hexval()}"><b>Figura {_figuras[0]}</b></font> \u00b7 {pie}',
        estilo(f'pie{_figuras[0]}', fontSize=8.4, leading=11.6, textColor=TINTA3, spaceBefore=4, spaceAfter=12),
    )
    contenedor = Table([[marco], [epigrafe]], colWidths=[ancho])
    contenedor.setStyle(TableStyle([
        ('LEFTPADDING', (0, 0), (-1, -1), 0),
        ('RIGHTPADDING', (0, 0), (-1, -1), 0),
        ('TOPPADDING', (0, 0), (-1, -1), 0),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 0),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
    ]))
    return KeepTogether([Spacer(1, 6), contenedor])


def aviso(titulo, texto, color=ACENTO, fondo=ACENTO_SUAVE):
    inner = [
        Paragraph(f'<b><font color="{color.hexval()}">{titulo}</font></b>', E['nota']),
        Spacer(1, 2),
        P(texto, 'nota'),
    ]
    t = Table([[inner]], colWidths=[ANCHO_UTIL])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), fondo),
        ('LEFTPADDING', (0, 0), (-1, -1), 10),
        ('RIGHTPADDING', (0, 0), (-1, -1), 10),
        ('TOPPADDING', (0, 0), (-1, -1), 8),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
        ('LINEBEFORE', (0, 0), (0, -1), 2.2, color),
    ]))
    return t


# ---------------------------------------------------------------- portada y páginas

def logo(c, x, y, lado=16 * mm, sobre_oscuro=False):
    """Monograma IO: fondo claro sobre tinta, fondo tinta sobre claro."""
    c.saveState()
    c.setFillColor(colors.white if sobre_oscuro else TINTA)
    c.roundRect(x, y, lado, lado, lado * 0.28, stroke=0, fill=1)
    c.setFillColor(TINTA if sobre_oscuro else colors.white)
    c.setFont('Helvetica-Bold', lado * 0.42)
    c.drawCentredString(x + lado * 0.46, y + lado * 0.33, 'IO')
    c.setFillColor(CELESTE)
    c.circle(x + lado * 0.8, y + lado * 0.26, lado * 0.075, stroke=0, fill=1)
    c.restoreState()


def portada(c, doc):
    ancho, alto = A4
    c.saveState()
    c.setFillColor(TINTA)
    c.rect(0, alto * 0.42, ancho, alto * 0.58, stroke=0, fill=1)

    # trama de ruta, la metáfora del día del visitador
    c.setStrokeColor(CELESTE)
    c.setLineWidth(1)
    c.setDash(2, 7)
    c.setFillColor(TINTA)
    p = c.beginPath()
    p.moveTo(ancho * 0.1, alto * 0.655)
    p.curveTo(ancho * 0.34, alto * 0.7, ancho * 0.4, alto * 0.79, ancho * 0.63, alto * 0.83)
    p.curveTo(ancho * 0.86, alto * 0.87, ancho * 0.82, alto * 0.92, ancho * 0.94, alto * 0.955)
    c.drawPath(p)
    c.setDash()
    for fx, fy in [(0.1, 0.655), (0.63, 0.83), (0.94, 0.955)]:
        c.setStrokeColor(colors.white)
        c.setLineWidth(1.4)
        c.circle(ancho * fx, alto * fy, 4.5, stroke=1, fill=0)

    logo(c, MARGEN, alto - 40 * mm, 18 * mm, sobre_oscuro=True)

    c.setFillColor(colors.white)
    c.setFont('Helvetica-Bold', 34)
    c.drawString(MARGEN, alto * 0.53, 'Manual de uso')
    c.setFont('Helvetica', 15)
    c.setFillColor(colors.HexColor('#c9d6e3'))
    c.drawString(MARGEN, alto * 0.485, 'IO-Pharma · e-detailing y CRM para laboratorios')

    c.setFillColor(TINTA)
    c.setFont('Helvetica-Bold', 11)
    c.drawString(MARGEN, alto * 0.33, 'Qué se puede hacer, de punta a punta')
    c.setFont('Helvetica', 10)
    c.setFillColor(TINTA3)
    c.drawString(MARGEN, alto * 0.30, 'Parte 1: la app del visitador médico.')
    c.drawString(MARGEN, alto * 0.272, 'Parte 2: el portal del laboratorio.')

    c.setFont('Helvetica', 9)
    c.drawString(MARGEN, 28 * mm, f'Versión {VERSION} · {FECHA}')
    c.drawString(MARGEN, 23 * mm, 'IO Consulting')
    c.setFillColor(LINEA)
    c.rect(MARGEN, 34 * mm, ANCHO_UTIL, 0.8, stroke=0, fill=1)
    c.restoreState()


def pagina(c, doc):
    ancho, alto = A4
    c.saveState()
    c.setFillColor(TINTA3)
    c.setFont('Helvetica', 7.6)
    c.drawString(MARGEN, alto - 13 * mm, 'IO-Pharma · Manual de uso')
    c.drawRightString(ancho - MARGEN, alto - 13 * mm, f'Versión {VERSION}')
    c.setFillColor(LINEA)
    c.rect(MARGEN, alto - 15 * mm, ANCHO_UTIL, 0.5, stroke=0, fill=1)
    c.rect(MARGEN, 15 * mm, ANCHO_UTIL, 0.5, stroke=0, fill=1)
    c.setFillColor(TINTA3)
    c.setFont('Helvetica', 7.6)
    c.drawString(MARGEN, 11 * mm, 'Documento de demostración · marcas y datos ficticios')
    c.setFont('Helvetica-Bold', 8.4)
    c.setFillColor(TINTA)
    c.drawRightString(ancho - MARGEN, 11 * mm, str(doc.page - 1))
    c.restoreState()


class Manual(BaseDocTemplate):
    """Documento con portada propia, encabezado en el resto y índice con páginas reales."""

    def __init__(self, ruta):
        super().__init__(
            str(ruta), pagesize=A4, leftMargin=MARGEN, rightMargin=MARGEN,
            topMargin=22 * mm, bottomMargin=20 * mm,
            title='IO-Pharma · Manual de uso', author='IO Consulting',
            subject='Manual de la plataforma de e-detailing y CRM',
        )
        marco = Frame(MARGEN, 20 * mm, ANCHO_UTIL, A4[1] - 42 * mm, id='cuerpo')
        self.addPageTemplates([
            PageTemplate(id='portada', frames=[marco], onPage=portada),
            PageTemplate(id='cuerpo', frames=[marco], onPage=pagina),
        ])

    def afterFlowable(self, flowable):
        if not isinstance(flowable, Paragraph):
            return
        estilo_nombre = flowable.style.name
        if estilo_nombre == 'h1':
            self.notify('TOCEntry', (0, flowable.getPlainText(), self.page - 1))
        elif estilo_nombre == 'h2':
            self.notify('TOCEntry', (1, flowable.getPlainText(), self.page - 1))


# ---------------------------------------------------------------- contenido

def seccion(titulo, bajada=None):
    fl = [P(titulo, 'h1')]
    if bajada:
        fl.append(P(bajada, 'lead'))
    return fl


def construir():
    _figuras[0] = 0
    f = []  # flowables

    # el marco de portada consume una página en blanco: el contenido arranca después
    f += [NextPageTemplate('cuerpo'), PageBreak()]

    # --- índice
    toc = TableOfContents()
    toc.levelStyles = [E['toc1'], E['toc2']]
    f += [P('Contenido', 'h1_simple'), Spacer(1, 6), toc, PageBreak()]

    # --- 1. Antes de empezar
    f += seccion('1 · Antes de empezar', 'Qué es IO-Pharma, quién entra a cada parte y qué hace falta para usarla.')
    f += [P('Una plataforma, dos puertas', 'h2')]
    f += [P(
        'IO-Pharma resuelve el trabajo de la visita médica de punta a punta. El <b>visitador</b> usa la app en su tablet o '
        'celular, incluso sin señal. El <b>laboratorio</b> usa un portal en el navegador para controlar el material, el '
        'catálogo, el equipo y la seguridad del paciente. Las dos partes son la misma plataforma y comparten los mismos datos: '
        'lo que el laboratorio publica aparece en las tablets, y lo que el visitador registra llega al portal.')]
    f += [Spacer(1, 4), tabla(
        ['Perfil', 'Dónde trabaja', 'Para qué'],
        [
            ['Visitador médico', 'Tablet o celular, con o sin conexión', 'Agenda del día, presentaciones, muestras, cierre de la visita y capacitación'],
            ['Laboratorio', 'Navegador de escritorio', 'Material aprobado, catálogo y cupos, equipo, farmacovigilancia y datos'],
        ], anchos=[38 * mm, 48 * mm, ANCHO_UTIL - 86 * mm])]

    f += [P('Qué hace falta', 'h2')]
    f += vinetas([
        'Un navegador actualizado: Chrome, Edge o Safari.',
        'Para el visitador, una tablet de 10 pulgadas o más, en horizontal. También funciona en celular.',
        'Se puede instalar como aplicación desde el navegador y queda con su propio ícono.',
        'La primera vez hay que entrar con conexión. Después funciona sin señal.',
    ])

    f += [P('Ingresar y salir', 'h2')]
    f += [pasos([
        'Abrí la dirección que te dio el laboratorio.',
        'Elegí tu perfil e ingresá con tu correo corporativo y tu contraseña.',
        'Dejá marcado "Mantener la sesión" solo si la tablet es de uso personal.',
        'Para salir, tocá tu inicial arriba a la derecha y elegí "Cerrar sesión".',
    ])]
    f += [Spacer(1, 6), aviso(
        'Si cerrás sesión con trabajo sin sincronizar',
        'Lo que hiciste queda guardado en esa tablet y se envía la próxima vez que alguien ingrese con conexión. No se pierde nada.')]

    f += [P('Instalarla en el dispositivo', 'h2')]
    f += [P(
        'IO-Pharma es una aplicación web: no se descarga de ninguna tienda. Se entra por su dirección y el propio navegador '
        'ofrece instalarla, con lo que queda con su ícono, se abre a pantalla completa y funciona sin conexión.')]
    f += [pasos([
        'Abrí la dirección en Chrome, Edge o Safari.',
        'En Android y en computadora, tocá "Instalar" cuando el navegador lo ofrezca, o el botón que aparece al ingresar.',
        'En iPhone y iPad: Compartir y después "Agregar a inicio".',
        'Desde tu cuenta podés instalarla en cualquier momento.',
    ])]
    f += [Spacer(1, 6), aviso(
        'Por qué conviene instalarla',
        'En iPhone, una aplicación web que no está instalada pierde sus datos guardados a los pocos días de no usarse. '
        'Instalada, no: queda lista para trabajar sin señal.', TINTA3, FONDO)]

    f += [P('Modo claro y oscuro', 'h2')]
    f += [P(
        'Desde tu cuenta se elige entre claro, oscuro o automático, que sigue la configuración del dispositivo. '
        'Las presentaciones se ven siempre en claro, porque son el material que mira el médico.')]
    f += [figura('apm-hoy-oscuro', 'La misma pantalla en modo oscuro, pensada para un consultorio con poca luz.', 160)]

    f += [P('La ayuda, siempre a mano', 'h2')]
    f += [P(
        'El botón con el signo de pregunta, arriba a la derecha, abre la ayuda. También se abre con la tecla <b>?</b> desde '
        'cualquier pantalla. La ayuda sabe dónde estás: arriba muestra los temas de esa pantalla, y abajo podés escribir tu '
        'consulta con tus palabras. Si no encuentra la respuesta, ofrece el contacto de soporte.')]
    f += [PageBreak()]

    # --- 2. App del visitador
    f += seccion('2 · La app del visitador', 'Todo lo que un visitador puede hacer en un día de trabajo, pantalla por pantalla.')

    f += [P('2.1 Hoy: la ruta del día', 'h2')]
    f += [P(
        'Es la pantalla de inicio. Arriba, los indicadores del día: visitas hechas sobre el total, duración promedio, muestras '
        'entregadas y receptividad promedio. A la derecha, el mapa con la ruta y las visitas numeradas.')]
    f += [P('Qué se puede hacer', 'h3')]
    f += vinetas([
        'Ver la próxima visita destacada, con la nota de la visita anterior.',
        'Hacer <b>check-in</b>: abre la visita y registra a qué distancia del consultorio estabas.',
        'Abrir "Cómo llegar" para navegar hasta el consultorio.',
        'Filtrar la agenda entre todas, pendientes y hechas.',
        'Tocar un médico para verlo en el mapa, o entrar a su ficha completa.',
        'Con la visita abierta: presentar, pedir muestras o cerrarla.',
    ])
    f += [figura('apm-hoy', 'La pantalla Hoy: indicadores del día, próxima visita y la ruta en el mapa.', 160)]
    f += [Spacer(1, 4), aviso(
        'Una visita por vez',
        'La app no deja abrir una visita nueva si hay otra en curso. Es a propósito: evita que se mezclen las muestras y los '
        'tiempos de dos médicos distintos.', TINTA3, FONDO)]

    f += [P('2.2 Médicos: el fichero', 'h2')]
    f += [P(
        'La cartera del visitador, ordenada por a quién conviene ver primero. La prioridad cruza dos datos: si el médico bajó '
        'su prescripción en el último trimestre y hace cuánto que no se lo visita, según la frecuencia que le corresponde a su '
        'categoría.')]
    f += [Spacer(1, 2), tabla(
        ['Categoría', 'Frecuencia esperada', 'Visitas cada 90 días'],
        [['A', 'Al menos una visita cada 30 días', '6'], ['B', 'Cada 45 días', '3'], ['C', 'Cada 60 días', '2']],
        anchos=[30 * mm, 70 * mm, ANCHO_UTIL - 100 * mm])]
    f += [figura('apm-medicos', 'El fichero ordenado por prioridad: quién bajó su prescripción y hace cuánto que no se lo visita.', 160)]
    f += [Spacer(1, 8), P('En la ficha de cada médico', 'h3')]
    f += vinetas([
        'Datos de contacto, matrícula, institución y territorio.',
        'Consentimientos: si no dio permiso para WhatsApp o correo, ese botón queda deshabilitado.',
        'Indicadores: recetas del último trimestre con su variación, participación en su clase, visitas hechas contra el objetivo y última visita.',
        'Gráfico de prescripción de los últimos seis meses, producto por producto.',
        'Historial de visitas con receptividad, feedback y notas; las que se cargaron por voz quedan marcadas.',
        'Trazabilidad de muestras: qué se entregó, de qué lote, con qué vencimiento y con qué firma.',
    ])

    f += [figura('apm-ficha-medico', 'Ficha del médico: indicadores, curva de prescripción, historial de visitas y trazabilidad de muestras.', 160)]
    f += [P('2.3 Biblioteca y constructor', 'h2')]
    f += [P(
        'Reúne el material aprobado por el laboratorio y las presentaciones propias del visitador. Arriba aparece la sugerida '
        'para la próxima visita, elegida según el interés del médico.')]
    f += vinetas([
        'Filtrar por producto o ver solo las propias.',
        'Presentar cualquier pieza, con o sin conexión.',
        'Duplicar una oficial para adaptarla, o armar una desde cero.',
        'En el constructor: elegir pantallas, ordenarlas arrastrando y guardarlas con nombre propio.',
        'Si falta la capacitación de ese producto, la tarjeta lo avisa y lleva al curso.',
    ])

    f += [figura('apm-biblioteca', 'Biblioteca: material aprobado, presentaciones propias y la sugerida para la próxima visita.', 150)]
    f += [P('2.4 Presentar: la visita cara a cara', 'h2')]
    f += [P(
        'La presentación ocupa toda la pantalla. Las páginas se pasan arrastrando con el dedo, como si fueran de papel, y '
        'también con las flechas del teclado o desde el índice.')]
    f += [figura('apm-presentar', 'La presentación a pantalla completa, con el índice de pantallas abajo.', 160)]
    f += [P('Qué puede abrir el visitador durante la charla', 'h3')]
    f += [Spacer(1, 2), tabla(
        ['Recurso', 'Qué muestra'],
        [
            ['Estudio clínico', 'Diseño del estudio, hallazgos principales y gráfico comparativo'],
            ['Gráfico interactivo', 'Evolución semana a semana, que el médico puede explorar con el dedo'],
            ['Video', 'Animación del mecanismo de acción o de la técnica, con capítulos'],
            ['Modelo 3D', 'Arteria o bronquio que se gira y cambia de estado'],
            ['Ficha técnica', 'Composición, indicaciones, posología, contraindicaciones y advertencias'],
        ], anchos=[42 * mm, ANCHO_UTIL - 42 * mm])]
    f += [Spacer(1, 8)]
    f += vinetas([
        'Dibujar sobre la pantalla con el lápiz, para señalar un dato mientras se explica.',
        'Abrir el stock sin salir de la presentación y cargar muestras para ese médico.',
        'Entrar y salir de pantalla completa.',
        'Terminar: lleva directo al cierre de la visita.',
    ])
    f += [figura('apm-recurso-ficha', 'Un recurso abierto sobre la presentación: la ficha técnica, navegable por secciones.', 160)]
    f += [Spacer(1, 4), aviso(
        'Lo que queda registrado',
        'La app anota cuánto tiempo estuvo abierta cada pantalla y qué recursos se abrieron. Esa información alimenta el '
        'informe del laboratorio sobre qué material funciona.', TINTA3, FONDO)]

    f += [P('2.5 Material y muestras', 'h2')]
    f += [P(
        'La disponibilidad del material que lleva el visitador, con semáforo: disponible, poca cantidad o sin unidades. Cada '
        'ítem muestra su lote y su vencimiento. Las presentaciones de farmacia se dispensan por droguería: no se venden desde '
        'la app.')]
    f += vinetas([
        'Buscar por nombre o código, y filtrar por producto o material.',
        'Cargar cantidades y solicitar la entrega; si hay una visita abierta, queda asociada a ese médico.',
        'El cupo mensual por médico lo define el laboratorio: la app no deja pasarse.',
        'En la pestaña <b>Trazabilidad</b>, el libro de entregas de los últimos 90 días con firma y estado de sincronización.',
    ])

    f += [figura('apm-stock', 'Stock con semáforo, lotes y vencimientos; las muestras se piden desde acá o desde la visita.', 150)]
    f += [P('2.6 Cerrar la visita', 'h2')]
    f += [P('El cierre tiene dos pasos: compartir material y registrar la visita.')]
    f += [P('Paso 1 · Compartir material', 'h3')]
    f += vinetas([
        'Elegir las piezas que el médico pidió.',
        'Elegir el canal: WhatsApp, correo o SMS.',
        'Ver el mensaje antes de enviarlo.',
        'Si el profesional no dio consentimiento para ese canal, la opción aparece deshabilitada.',
    ])
    f += [P('Paso 2 · Registrar la visita', 'h3')]
    f += [pasos([
        'Contar cómo fue: se puede escribir, o dictarlo y que la IA complete los campos.',
        'Si querés, elegir la receptividad del médico con las estrellas.',
        'Marcar las etiquetas del feedback que correspondan.',
        'Dejar la nota para la próxima visita, que es tu ayuda memoria.',
        'Si se entregaron muestras, pedirle la firma al profesional en la pantalla, o marcar que firmó el remito en papel.',
        'Guardar y hacer check-out.',
    ])]
    f += [Spacer(1, 6), aviso(
        'El feedback es opcional',
        'La visita se puede cerrar sin calificar, sin etiquetas y sin nota. Lo único obligatorio es la firma cuando se '
        'entregan muestras, porque lo exige la normativa sanitaria.', TINTA3, FONDO)]

    f += [P('2.7 El reporte por voz', 'h2')]
    f += [P(
        'Es la función que más tiempo ahorra. El visitador cuenta la visita hablando y la app completa el registro por él.')]
    f += [figura('apm-voz', 'El reporte por voz: a la izquierda la transcripción con lo reconocido resaltado, a la derecha los campos del CRM ya completos.', 165)]
    f += [Spacer(1, 2), tabla(
        ['Qué reconoce', 'De dónde lo saca'],
        [
            ['El médico', 'Lo compara con la visita en curso y avisa si no coincide'],
            ['Los productos', 'Por su nombre o por lo que se habló: LDL, inhalador, colesterol'],
            ['Las muestras', 'Cantidad y producto, validados contra el stock disponible'],
            ['La receptividad', 'Por el tono de lo que se cuenta'],
            ['El feedback', 'Objeciones, pedidos de estudios y compromisos'],
            ['El próximo paso', 'La frase donde se define cuándo volver y con qué'],
            ['Un posible evento adverso', 'Cualquier mención a un efecto en un paciente'],
        ], anchos=[48 * mm, ANCHO_UTIL - 48 * mm])]
    f += [Spacer(1, 8), aviso(
        'La IA nunca guarda sola',
        'El visitador ve la transcripción con lo reconocido resaltado y los campos ya completos. Recién cuando toca '
        '"Aplicar al registro" se cargan, y todavía puede corregir cualquiera antes de guardar.', IA, colors.HexColor('#efe9fb'))]
    f += [Spacer(1, 6), aviso(
        'Si aparece un posible evento adverso',
        'La app lo marca en rojo y pide notificarlo a Farmacovigilancia. El plazo regulatorio es de 24 horas. Sin conexión, el '
        'aviso queda en la cola con prioridad y sale apenas vuelve la señal.', colors.HexColor('#b42318'), colors.HexColor('#fcebea'))]

    f += [figura('apm-firma', 'Con las muestras cargadas, el cierre pide la firma de recepción del profesional.', 160)]
    f += [P('2.8 Academia', 'h2')]
    f += vinetas([
        'Cursos por producto y de cumplimiento, con lecciones cortas.',
        'Evaluación al terminar; se puede repetir si no se aprueba.',
        'La certificación habilita a presentar ese producto.',
        'Puntos, insignias, ranking del equipo y desafío semanal.',
    ])

    f += [P('2.9 Actividad y trabajo sin señal', 'h2')]
    f += [P(
        'Muestra la cola de todo lo que está esperando enviarse y lo que ya se envió, con la hora y la operación exacta que '
        'corresponde a cada movimiento.')]
    f += vinetas([
        'Forzar la sincronización cuando hay conexión.',
        'Activar "Simular sin conexión" para mostrar en una demostración cómo trabaja la app en un consultorio sin señal.',
        'Ver qué hay guardado en esa tablet: visitas, firmas, entregas por lote y reportes por voz.',
        'Reiniciar la demostración y dejar todo como recién instalado.',
    ])
    f += [figura('apm-actividad', 'La cola de sincronización, con la operación que corresponde a cada movimiento.', 160)]
    f += [figura('movil-hoy', 'La misma app en el celular: la navegación pasa abajo y el contenido se apila.', 62)]
    f += [PageBreak()]

    # --- 3. Portal del laboratorio
    f += seccion('3 · El portal del laboratorio', 'Cómo el laboratorio controla lo que llega a cada tablet.')

    f += [P('3.1 Material y aprobaciones', 'h2')]
    f += [P(
        'Es el corazón del portal. Ninguna pieza llega a una tablet sin pasar por acá, y cada una tiene su versión, su vigencia '
        'y su responsable.')]
    f += [Spacer(1, 2), tabla(
        ['Estado', 'Qué significa', 'Qué se puede hacer'],
        [
            ['Borrador', 'Se está preparando; no la ve nadie del campo', 'Editarla y enviarla a revisión'],
            ['En revisión médica', 'Asuntos Médicos la tiene que aprobar', 'Aprobarla o devolverla con observaciones'],
            ['Aprobada', 'Tiene el visto bueno pero todavía no salió', 'Publicarla en las tablets'],
            ['Publicada', 'Disponible en el campo, sin conexión', 'Retirarla si hace falta'],
            ['Vencida', 'Se retiró sola al vencer o al reemplazarse', 'Crear una versión nueva'],
        ], anchos=[34 * mm, 62 * mm, ANCHO_UTIL - 96 * mm])]
    f += [figura('lab-material', 'Material y aprobaciones: cada pieza con su versión, su estado y su vigencia.', 165)]
    f += [Spacer(1, 8), P('Qué se define en cada pieza', 'h3')]
    f += vinetas([
        'A qué producto pertenece y hasta cuándo está vigente.',
        'Si el visitador puede solo mostrarla o además enviársela al médico.',
        'Quién la subió y quién la aprobó, con fecha.',
    ])
    f += [Spacer(1, 4), aviso(
        'Qué pasa al publicar',
        'Las tablets la descargan en la próxima sincronización y queda disponible sin conexión. La versión anterior se retira '
        'sola: nadie puede mostrar material vencido, ni siquiera sin señal.', OK, colors.HexColor('#e3f4ec'))]

    f += [figura('lab-pieza', 'El detalle de una pieza, con el circuito de aprobación y las acciones según su estado.', 150)]
    f += [P('3.2 Catálogo y muestras', 'h2')]
    f += vinetas([
        'Productos, presentaciones comerciales y material promocional.',
        'Lotes con su vencimiento y las unidades que están en la calle.',
        'El <b>cupo mensual de muestras por médico</b>, que rige para todo el equipo.',
        'Conciliación con el ERP: cada entrega descuenta stock y genera su movimiento de material.',
    ])

    f += [figura('lab-catalogo', 'Catálogo: presentaciones, lotes con vencimiento y el cupo mensual de muestras por médico.', 160)]
    f += [P('3.3 Cuentas institucionales', 'h2')]
    f += [P(
        'Droguerías, cadenas de farmacias, instituciones y financiadores: donde el laboratorio factura de verdad, aunque la '
        'receta la escriba el médico. Toda la relación queda en la cuenta y no en la cabeza del responsable.')]
    f += vinetas([
        'Compras de los últimos seis meses, con la variación del trimestre.',
        'Acuerdos vigentes con su fecha de vencimiento y aviso anticipado.',
        'Contactos con cargo, teléfono y correo.',
        'Historial de reuniones, pedidos, acuerdos y reclamos, con quién los registró.',
        'Registro de interacciones desde la misma ficha.',
    ])
    f += [figura('lab-cuentas', 'Las cuentas ordenadas por actividad, con las que vienen cayendo señaladas.', 165)]
    f += [figura('lab-cuenta', 'La ficha de una cuenta: compras, acuerdos por vencer, contactos e historial.', 160)]
    f += [Spacer(1, 4), aviso(
        'Por qué importa',
        'Si el responsable de la cuenta se toma licencia o deja la empresa, el que lo reemplaza abre la ficha y sabe en qué '
        'quedó cada conversación. Es el conocimiento que hoy se pierde con la persona.', TINTA3, FONDO)]

    f += [P('3.4 Licitaciones', 'h2')]
    f += [P(
        'Los procesos institucionales, con sus fechas críticas a la vista. Perder una licitación por no presentar a tiempo es '
        'el error más caro y más evitable de este canal.')]
    f += vinetas([
        'Pipeline por etapa: detectada, en preparación, presentada y cerrada.',
        'Aviso cuando una fecha cae dentro de la semana.',
        'Checklist de requisitos de la presentación, que se va tildando.',
        'Tasa de adjudicación sobre los procesos cerrados.',
        'Cada proceso se puede asociar a la cuenta que corresponde.',
    ])
    f += [figura('lab-licitaciones', 'El pipeline de licitaciones, con la alerta de las fechas de esta semana.', 165)]

    f += [P('3.5 Lanzamientos', 'h2')]
    f += [P(
        'Sacar un producto nuevo se juega en los primeros 90 días. El módulo junta el listado de médicos objetivo, el '
        'cronograma y la adopción temprana.')]
    f += vinetas([
        'Médicos objetivo, marcados como alcanzados o pendientes.',
        'Cronograma de hitos con responsable; los atrasados quedan señalados.',
        'Kit de material del lanzamiento, con el estado de publicación de cada pieza.',
        'Porcentaje del equipo con la capacitación aprobada.',
        'Plan de visitas para los médicos que faltan, con un toque.',
    ])
    f += [figura('lab-lanzamientos', 'Un lanzamiento en curso: adopción, cronograma y listado objetivo.', 165)]

    f += [P('3.6 Segmentos y potencial', 'h2')]
    f += [P(
        'Cada médico analizado por recencia de visita, frecuencia y volumen de prescripción. El sistema propone la categoría '
        'que le correspondería; la decisión la toma una persona, porque define la carga de trabajo del equipo.')]
    f += [Spacer(1, 2), tabla(
        ['Letra', 'Qué mide'],
        [
            ['R · Recencia', 'Hace cuánto no se lo visita, contra la frecuencia que le corresponde'],
            ['F · Frecuencia', 'Visitas de los últimos 90 días sobre el objetivo de su categoría'],
            ['M · Valor', 'Recetas del último trimestre, comparadas con el resto de la cartera'],
        ], anchos=[40 * mm, ANCHO_UTIL - 40 * mm])]
    f += [Spacer(1, 8)]
    f += vinetas([
        'Cinco segmentos: campeón, en riesgo, en crecimiento, dormido y estable.',
        'Cada propuesta de cambio viene explicada en texto.',
        'Al aprobar, la categoría cambia en el fichero y con ella la frecuencia esperada.',
        'A un médico que viene creciendo no se lo baja de categoría, aunque su volumen sea bajo.',
    ])
    f += [figura('lab-segmentacion', 'El análisis de la cartera, con los cambios de categoría propuestos.', 165)]

    f += [P('3.7 Equipo y territorios', 'h2')]
    f += vinetas([
        'Alta y baja de visitadores; al darlos de baja, la tablet deja de sincronizar.',
        'Territorio asignado y cartera de cada uno.',
        'Cobertura: qué porcentaje de su cartera está dentro de la frecuencia.',
        'Estado de las capacitaciones obligatorias, curso por curso.',
        'Importación del padrón médico desde una planilla, con detección de matrículas repetidas y datos faltantes.',
    ])

    f += [figura('lab-equipo', 'Equipo y territorios, con la cobertura de cada visitador y el estado de sus capacitaciones.', 160)]
    f += [P('3.8 Farmacovigilancia', 'h2')]
    f += [P(
        'La bandeja reúne todo lo que reportaron los visitadores, incluido lo que la app detectó sola en los reportes por voz. '
        'Cada caso muestra el tiempo que queda dentro del plazo de 24 horas.')]
    f += [pasos([
        'Tomar el caso: queda asignado y pasa a análisis.',
        'Pedir la información que falte al visitador o al médico.',
        'Notificar a la autoridad sanitaria dentro del plazo.',
        'Marcarlo como notificado: queda la constancia para una auditoría.',
    ])]

    f += [figura('lab-farmacovigilancia', 'La bandeja de farmacovigilancia, con el plazo de 24 horas a la vista en cada caso.', 160)]
    f += [P('3.9 Asistente estratégico', 'h2')]
    f += [P(
        'Permite preguntarle a los datos en lenguaje natural, sin armar un tablero para cada duda. Responde con un resumen '
        'escrito, una tabla, un gráfico y, sobre todo, <b>la consulta que usó y sus fuentes</b>.')]
    f += [P('Ejemplos que responde hoy', 'h3')]
    f += vinetas([
        '¿Qué médicos bajaron su prescripción y no fueron visitados?',
        '¿Qué médicos recibieron muestras pero no aumentaron sus recetas?',
        '¿Cómo viene la cobertura de visitas de cada visitador?',
        '¿Cuáles son las objeciones más frecuentes de cada producto?',
        '¿Qué cardiólogos categoría A no se visitan hace más de 30 días?',
    ])
    f += [Spacer(1, 4), P(
        'Cuando la respuesta lista médicos, se puede crear un plan de visitas con un toque: se suma a la agenda de cada '
        'visitador. El asistente es de solo lectura y respeta los permisos por zona de cada gerente.')]

    f += [figura('lab-asistente', 'Una respuesta del asistente: resumen, indicadores, tabla, gráfico y la consulta que usó.', 165)]
    f += [P('3.10 Integraciones y API', 'h2')]
    f += vinetas([
        'Conectores a SAP, Salesforce, la auditoría de prescripciones, el directorio corporativo y el data warehouse.',
        'Mapeo de campos de cada conector, para ver exactamente qué se sincroniza.',
        'Explorador de la API con ejemplos reales y prueba de cada operación.',
        'Registro de los eventos enviados a los sistemas del laboratorio.',
        'Especificación OpenAPI 3.1 descargable.',
    ])
    f += [PageBreak()]

    # --- 4. Transversal
    f += seccion('4 · Cómo funciona por dentro', 'Tres cosas que conviene entender antes de poner la app en la calle.')

    f += [P('4.1 Sin conexión', 'h2')]
    f += [P(
        'La app está pensada para consultorios sin señal. Todo se guarda primero en el dispositivo y se envía después, en '
        'segundo plano. Cada movimiento lleva una clave única: si la señal se corta a mitad de camino y hay que reintentar, '
        'nunca se duplica.')]
    f += [Spacer(1, 2), tabla(
        ['Funciona sin conexión', 'Necesita señal'],
        [
            ['Presentar, con videos y modelos 3D', 'Descargar material nuevo'],
            ['Check-in y cierre de visita', 'Enviar material al médico'],
            ['Entrega de muestras y firma', 'Transcribir voz en el navegador'],
            ['Reporte por voz en la app nativa', 'El asistente de gerencia'],
            ['Consultar el fichero y la ayuda', 'Escribirle a soporte'],
        ], anchos=[ANCHO_UTIL / 2, ANCHO_UTIL / 2])]

    f += [Spacer(1, 8), P('4.2 Dónde interviene la inteligencia artificial', 'h2')]
    f += [Spacer(1, 2), tabla(
        ['Función', 'Qué hace', 'Quién decide'],
        [
            ['Reporte por voz', 'Transcribe y completa el registro de la visita', 'El visitador revisa y confirma'],
            ['Evento adverso', 'Detecta la mención y pide notificarla', 'El visitador confirma; Farmacovigilancia resuelve'],
            ['Asistente', 'Responde preguntas sobre los datos', 'Solo lectura; muestra la consulta que usó'],
            ['Ayuda', 'Busca la respuesta en el manual', 'Ofrece soporte humano si no la encuentra'],
        ], anchos=[36 * mm, 68 * mm, ANCHO_UTIL - 104 * mm])]

    f += [Spacer(1, 8), P('4.3 Seguridad y cumplimiento', 'h2')]
    f += vinetas([
        'Cada perfil entra solo a lo suyo: el portal no abre la app de campo ni al revés.',
        'Todo el material que ve un médico pasó por la aprobación de Asuntos Médicos.',
        'El material vencido se retira solo, también de las tablets sin conexión.',
        'Las muestras quedan trazadas por lote, con la firma de quien las recibió.',
        'Los eventos adversos tienen plazo, responsable y constancia.',
        'Los envíos al médico respetan el consentimiento que dio para cada canal.',
        'Queda registro de quién hizo qué y cuándo, para una auditoría.',
    ])

    f += [Spacer(1, 8), P('4.4 Qué registra la app sobre el visitador', 'h2')]
    f += [P(
        'La plataforma está diseñada para asistir al promotor, no para vigilarlo. Es una decisión de producto y también una '
        'condición para que la herramienta se pueda implementar en la industria.')]
    f += [Spacer(1, 2), tabla(
        ['Sí registra', 'No registra'],
        [
            ['La ubicación, solo en el check-in y el check-out', 'El recorrido ni la ubicación en segundo plano'],
            ['Lo que el promotor decide registrar de la visita', 'Los tiempos entre una visita y otra'],
            ['Las entregas de muestras y sus firmas', 'Justificaciones por demoras o desvíos del plan'],
            ['El material que se mostró, en agregado', 'Rankings individuales ligados a la remuneración'],
        ], anchos=[ANCHO_UTIL / 2, ANCHO_UTIL / 2])]
    f += [Spacer(1, 8), P(
        'Fuera del horario de trabajo, los avisos quedan en espera hasta el día hábil siguiente. La app lo explica en la '
        'pantalla de Actividad y en su ayuda, para que el equipo lo tenga claro desde el primer día.')]

    f += [Spacer(1, 6), P('4.5 Accesibilidad', 'h2')]
    f += vinetas([
        'Todos los botones se pueden tocar con el dedo, en cualquier tamaño de pantalla.',
        'La app se maneja también con teclado, y los lectores de pantalla anuncian los cambios.',
        'Ningún dato se comunica solo con color: siempre hay un texto o un ícono que lo acompaña.',
        'Si el dispositivo tiene activado "reducir movimiento", las animaciones se desactivan.',
    ])
    f += [PageBreak()]

    # --- 5. Recorridos
    f += seccion('5 · Tres recorridos de punta a punta', 'Los guiones que conviene seguir para conocer la plataforma o para mostrarla.')

    f += [P('5.1 Una visita completa', 'h2')]
    f += [pasos([
        'En <b>Hoy</b>, tocar "Hacer check-in" sobre la próxima visita.',
        'Tocar "Presentar" y pasar las páginas con el dedo.',
        'Abrir un estudio y el modelo 3D frente al médico; marcar un dato con el lápiz.',
        'Desde la misma presentación, cargar muestras para ese médico.',
        'Tocar "Terminar" y compartir el estudio por WhatsApp.',
        'En el registro, grabar el reporte por voz y aplicarlo.',
        'Pedir la firma de recepción de las muestras.',
        'Guardar y hacer check-out.',
        'Entrar a la ficha del médico: la visita ya figura, con su nota y las muestras entregadas.',
    ])]

    f += [P('5.2 El laboratorio publica material nuevo', 'h2')]
    f += [pasos([
        'Ingresar con el perfil <b>Laboratorio</b>.',
        'En <b>Material</b>, abrir la pieza que está en revisión médica.',
        'Aprobarla y después publicarla en las tablets.',
        'Cambiar al perfil del visitador y entrar a <b>Biblioteca</b>: la presentación nueva ya está disponible.',
    ])]

    f += [P('5.3 Un posible evento adverso', 'h2')]
    f += [pasos([
        'Durante el reporte por voz, mencionar que un paciente tuvo un efecto molesto.',
        'La app lo detecta y pide notificarlo; confirmar.',
        'En el portal, entrar a <b>Farmacovigilancia</b>: el caso está en la bandeja con su reloj de 24 horas.',
        'Tomar el caso y marcarlo como notificado.',
    ])]

    f += [Spacer(1, 10), P('5.4 Demostrar el trabajo sin señal', 'h2')]
    f += [pasos([
        'En <b>Actividad</b>, activar "Simular sin conexión".',
        'Hacer un check-in y cerrar una visita: todo sigue funcionando.',
        'Volver a Actividad y ver la cola de pendientes.',
        'Desactivar el modo sin conexión y ver cómo se envía todo solo.',
    ])]
    f += [PageBreak()]

    # --- 6. Referencia
    f += seccion('6 · Preguntas frecuentes y glosario')

    f += [P('Preguntas frecuentes', 'h2')]
    for pregunta, respuesta in [
        ('¿Qué pasa si se me apaga la tablet en medio de una visita?',
         'No se pierde nada. Todo se guarda apenas se hace cada acción; al volver a entrar, la visita sigue abierta donde estaba.'),
        ('¿Puedo mostrar un material que el laboratorio todavía no aprobó?',
         'No. En la tablet solo aparece lo aprobado y vigente. Es la garantía que necesita Asuntos Médicos.'),
        ('¿El médico tiene que firmar siempre?',
         'Solo cuando se entregan muestras. Si el médico prefiere el remito en papel, se marca esa opción y queda registrado.'),
        ('¿La IA puede equivocarse al completar el registro?',
         'Puede, y por eso siempre hay una revisión. Nada se guarda sin que el visitador lo confirme.'),
        ('¿Quién ve los datos de mi cartera?',
         'El visitador ve su territorio. La gerencia ve su zona. Nadie ve datos de pacientes, porque la plataforma no los maneja.'),
        ('¿Cómo sé que una pieza está vencida?',
         'No hace falta: desaparece sola de la tablet cuando vence o cuando se publica una versión nueva.'),
    ]:
        f += [KeepTogether([P(f'<b>{pregunta}</b>', 'h3'), P(respuesta)])]

    f += [P('Glosario', 'h2')]
    f += [tabla(
        ['Término', 'Qué quiere decir'],
        [
            ['APM', 'Agente de propaganda médica, el visitador'],
            ['Check-in', 'Apertura de la visita, que registra hora y distancia al consultorio'],
            ['CLM', 'Presentación interactiva que se le muestra al médico'],
            ['Cobertura', 'Porcentaje de la cartera visitado dentro de su frecuencia'],
            ['Cupo', 'Máximo de muestras que se le puede entregar a un médico por mes'],
            ['Evento adverso', 'Cualquier efecto no deseado en un paciente, con plazo de reporte de 24 horas'],
            ['Frecuencia', 'Cada cuánto corresponde visitar a un médico según su categoría'],
            ['Lote', 'Identificación de fabricación que permite trazar cada muestra entregada'],
            ['Receptividad', 'Qué tan bien recibió el médico la propuesta, de 1 a 5'],
            ['Trazabilidad', 'Poder seguir cada unidad desde el depósito hasta la firma del profesional'],
        ], anchos=[38 * mm, ANCHO_UTIL - 38 * mm])]

    f += [Spacer(1, 12), P('Soporte', 'h2')]
    f += [P(
        'Desde la ayuda de la app se puede escribir al equipo de soporte por WhatsApp o por correo, de lunes a viernes de 9 a '
        '18 h. Conviene contar en qué pantalla estabas y qué esperabas que pasara.')]

    f += [Spacer(1, 14), aviso(
        'Sobre esta versión',
        'Este manual describe la plataforma de demostración. Las marcas Lipvera y Respirel, los médicos, las recetas y los '
        'estudios son ficticios y no corresponden a ningún medicamento ni profesional real. En una implementación, el '
        'laboratorio carga su propio catálogo, su padrón y su material aprobado.', TINTA3, FONDO)]

    return f


def main():
    raiz = Path(__file__).resolve().parent.parent
    salida = raiz / 'Manual-IO-Pharma.pdf'
    doc = Manual(salida)
    doc.multiBuild(construir())
    print(f'PDF generado: {salida}')


if __name__ == '__main__':
    main()
