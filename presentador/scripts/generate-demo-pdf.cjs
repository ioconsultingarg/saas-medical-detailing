const fs = require('fs')
const path = require('path')

function buildPdf(text) {
  const lines = text.split('\n')
  const contentStream = [
    'BT',
    '/F1 18 Tf',
    '50 780 Td',
    ...lines.map((line, i) => `${i === 0 ? '' : '0 -28 Td\n'}(${line.replace(/[()\\]/g, '\\$&')}) Tj`),
    'ET',
  ].join('\n')

  const objects = []
  objects.push('<< /Type /Catalog /Pages 2 0 R >>')
  objects.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>')
  objects.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>')
  objects.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>')
  objects.push(`<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream`)

  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  objects.forEach((obj, i) => {
    offsets.push(pdf.length)
    pdf += `${i + 1} 0 obj\n${obj}\nendobj\n`
  })

  const xrefOffset = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n`
  pdf += '0000000000 65535 f \n'
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`

  return pdf
}

const pdf = buildPdf(
  'Ficha tecnica de ejemplo\nPrincipio activo: Demo-molecula 20mg\nPosologia: 1 comprimido cada 12hs\nContenido cargado a mano para el MVP',
)

const outDir = path.join(__dirname, '..', 'public', 'content')
fs.mkdirSync(outDir, { recursive: true })
fs.writeFileSync(path.join(outDir, 'ficha-tecnica.pdf'), pdf, 'latin1')
console.log('PDF generado en', path.join(outDir, 'ficha-tecnica.pdf'))
