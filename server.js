const express = require('express');
const PDFDocument = require('pdfkit');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Necesario para parsear los formularios POST (urlencoded)
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// GET principal: muestra la página
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// POST principal: genera el PDF
app.post('/', (req, res) => {
  const { empresa, cuit, fecha, condiciones } = req.body;
  // productos[] viene como 3 arrays paralelos (cantidad[], descripcion[], precio[])
  // Si solo hay uno, llega como string
  const cantidades = Array.isArray(req.body.cantidad) ? req.body.cantidad : [req.body.cantidad];
  const descripciones = Array.isArray(req.body.descripcion) ? req.body.descripcion : [req.body.descripcion];
  const precios = Array.isArray(req.body.precio) ? req.body.precio : [req.body.precio];

  const productos = cantidades.map((c, i) => ({
    cantidad: parseFloat(c) || 0,
    descripcion: descripciones[i] || "",
    precio: parseFloat(precios[i]) || 0
  }));

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
