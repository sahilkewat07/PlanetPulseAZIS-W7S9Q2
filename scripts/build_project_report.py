"""Build the project audit PDF from its editable Markdown source."""

from pathlib import Path
import re
from xml.sax.saxutils import escape

from reportlab.lib import colors
from reportlab.lib.enums import TA_LEFT
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak,
    Preformatted, KeepTogether,
)


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'output' / 'PlanetPulse_Project_Report.md'
DEST = ROOT / 'output' / 'PlanetPulse_Project_Report.pdf'
FONTS = Path('C:/Windows/Fonts')
pdfmetrics.registerFont(TTFont('ReportSans', str(FONTS / 'arial.ttf')))
pdfmetrics.registerFont(TTFont('ReportSansBold', str(FONTS / 'arialbd.ttf')))
pdfmetrics.registerFont(TTFont('ReportSerif', str(FONTS / 'georgia.ttf')))
pdfmetrics.registerFont(TTFont('ReportSerifBold', str(FONTS / 'georgiab.ttf')))
pdfmetrics.registerFontFamily('ReportSans', normal='ReportSans', bold='ReportSansBold')
pdfmetrics.registerFontFamily('ReportSerif', normal='ReportSerif', bold='ReportSerifBold')

PAGE_W, PAGE_H = letter
MARGIN = 48
WIDTH = PAGE_W - MARGIN * 2
styles = getSampleStyleSheet()
styles.add(ParagraphStyle('ReportTitle', fontName='ReportSerifBold', fontSize=25,
                          leading=30, textColor=colors.black, spaceAfter=13))
styles.add(ParagraphStyle('ReportHeading', fontName='ReportSerifBold', fontSize=18,
                          leading=23, textColor=colors.black, spaceAfter=11,
                          keepWithNext=True))
styles.add(ParagraphStyle('ReportSubheading', fontName='ReportSansBold', fontSize=12,
                          leading=16, textColor=colors.black, spaceBefore=8,
                          spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle('ReportBody', fontName='ReportSans', fontSize=10.8,
                          leading=14.6, spaceAfter=8, textColor=colors.HexColor('#202620'),
                          allowWidows=0, allowOrphans=0))
styles.add(ParagraphStyle('ReportMeta', parent=styles['ReportBody'], fontSize=9.5,
                          leading=13, textColor=colors.HexColor('#535C55'), spaceAfter=7))
styles.add(ParagraphStyle('ReportTable', fontName='ReportSans', fontSize=9.4,
                          leading=12.6, spaceAfter=0, textColor=colors.HexColor('#202620'),
                          splitLongWords=True))
styles.add(ParagraphStyle('ReportTableHead', parent=styles['ReportTable'],
                          fontName='ReportSansBold', textColor=colors.white))
styles.add(ParagraphStyle('ReportSource', parent=styles['ReportTable'], fontSize=8.8,
                          leading=11.6))
styles.add(ParagraphStyle('ReportCode', fontName='Courier', fontSize=9,
                          leading=12, spaceBefore=2, spaceAfter=10))


def inline(text):
    text = escape(text)
    text = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', text)
    return re.sub(r'`([^`]+)`', r'<font name="Courier">\1</font>', text)


def parse_table(lines):
    records = [[c.strip() for c in line.strip().strip('|').split('|')] for line in lines]
    records = [row for row in records if not all(re.fullmatch(r':?-+:?', c) for c in row)]
    head = records[0]
    if head[0] == 'Tool':
        widths = [110, 199, WIDTH - 309]
    elif head[0] == 'Record':
        widths = [65, 193, WIDTH - 258]
    elif head[0] == 'Type':
        widths = [110, 112, 74, WIDTH - 296]
    elif head[0] == 'Method and path':
        widths = [180, WIDTH - 180]
    elif head[0] == 'Phase':
        widths = [65, 205, WIDTH - 270]
    elif head[0] == 'Condition':
        widths = [143, 92, WIDTH - 235]
    elif head[0] == 'Item':
        widths = [120, 103, WIDTH - 223]
    elif head[0] == 'Ref':
        widths = [46, 251, WIDTH - 297]
    else:
        widths = [WIDTH / len(head)] * len(head)
    body_style = styles['ReportSource'] if head[0] == 'Ref' else styles['ReportTable']
    values = []
    for ri, row in enumerate(records):
        values.append([Paragraph(inline(c), styles['ReportTableHead'] if ri == 0 else body_style) for c in row])
    t = Table(values, colWidths=widths, repeatRows=1, hAlign='LEFT', splitByRow=True)
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#314455')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F1F4F6')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#D9D9D9')),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    return t


def footer(canvas, doc):
    canvas.saveState()
    canvas.setFont('ReportSans', 8)
    canvas.setFillColor(colors.HexColor('#535C55'))
    canvas.drawString(MARGIN, 28, 'PlanetPulse  |  Project implementation and requirements report')
    canvas.drawRightString(PAGE_W - MARGIN, 28, str(doc.page))
    canvas.restoreState()


lines = SOURCE.read_text(encoding='utf-8').splitlines()
story = []
i = 0
page_start = True
while i < len(lines):
    line = lines[i]
    if not line.strip():
        i += 1
        continue
    if line == '<!-- pagebreak -->':
        story.append(Spacer(1, 13))
        page_start = True
        i += 1
        continue
    if line.startswith('# '):
        story.append(Paragraph(inline(line[2:]), styles['ReportTitle']))
        page_start = False
        i += 1
        continue
    if line.startswith('## '):
        style = styles['ReportHeading'] if page_start else styles['ReportSubheading']
        story.append(Paragraph(inline(line[3:]), style))
        page_start = False
        i += 1
        continue
    if line.startswith('|'):
        table_lines = []
        while i < len(lines) and lines[i].startswith('|'):
            table_lines.append(lines[i])
            i += 1
        story.append(parse_table(table_lines))
        story.append(Spacer(1, 9))
        continue
    if line.startswith('```'):
        i += 1
        code_lines = []
        while i < len(lines) and not lines[i].startswith('```'):
            code_lines.append(lines[i])
            i += 1
        story.append(Preformatted('\n'.join(code_lines), styles['ReportCode']))
        i += 1
        continue
    para_lines = []
    while i < len(lines) and lines[i].strip() and not lines[i].startswith(('#', '|', '```', '<!--')):
        para_lines.append(lines[i])
        i += 1
    text = ' '.join(para_lines)
    style = styles['ReportMeta'] if text.startswith(('Azisly Hackathon', 'Prepared 22')) else styles['ReportBody']
    story.append(Paragraph(inline(text), style))

doc = SimpleDocTemplate(str(DEST), pagesize=letter, rightMargin=MARGIN, leftMargin=MARGIN,
                        topMargin=42, bottomMargin=48,
                        title='PlanetPulse Project Implementation and Requirements Report',
                        author='PlanetPulse', subject='Architecture and evidence-based requirements review')
doc.build(story, onFirstPage=footer, onLaterPages=footer)
print(f'Created {DEST}')
