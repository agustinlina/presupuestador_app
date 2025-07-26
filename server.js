const express = require('express');
const bodyParser = require('body-parser');
const PDFDocument = require('pdfkit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Static files
app.use(express.static(__dirname));
app.use(bodyParser.json());

// PDF generation endpoint (NO guarda en disco)
app.post('/api/generar-pdf', (req, res) => {
  const { empresa, cuit, fecha, condiciones, productos } = req.body;
  res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${Date.now()}.pdf"`);
  res.setHeader('Content-Type', 'application/pdf');

  const doc = new PDFDocument();
  doc.pipe(res);

  // Título
  doc.fontSize(22).text('Presupuesto', { align: 'center' });
  doc.moveDown();

  // Datos
  doc.fontSize(12)
    .text(`Empresa: ${empresa}`)
    .text(`CUIT: ${cuit}`)
    .text(`Fecha de emisión: ${fecha}`)
    .text(`Condiciones de pago: ${condiciones}`)
    .moveDown();

  // Tabla productos
  doc.fontSize(14).text('Detalle:', { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text('Cant.   Descripción                          Precio     Subtotal', { continued: false });
  doc.moveDown(0.2);

  let total = 0;
  productos.forEach(item => {
    const subtotal = item.cantidad * item.precio;
    total += subtotal;
    doc.text(
      `${item.cantidad}      ${item.descripcion.padEnd(32)}   $${item.precio.toFixed(2)}   $${subtotal.toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`TOTAL: $${total.toFixed(2)}`, { align: 'right' });

  doc.end();
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
