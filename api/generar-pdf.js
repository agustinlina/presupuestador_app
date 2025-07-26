const PDFDocument = require('pdfkit');

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  // Asegura que parseamos JSON
  let data = req.body;
  if (typeof data === "string") data = JSON.parse(data);

  const { empresa, cuit, fecha, condiciones, productos } = data;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${Date.now()}.pdf"`);

  const doc = new PDFDocument();

  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfBuffer = Buffer.concat(buffers);
    res.status(200).end(pdfBuffer);
  });

  doc.fontSize(22).text('Presupuesto', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12)
    .text(`Empresa: ${empresa}`)
    .text(`CUIT: ${cuit}`)
    .text(`Fecha de emisión: ${fecha}`)
    .text(`Condiciones de pago: ${condiciones}`)
    .moveDown();

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
}
