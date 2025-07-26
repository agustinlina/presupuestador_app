const PDFDocument = require('pdfkit');

module.exports = (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("Method Not Allowed");
    return;
  }

  let data = req.body;
  // Manejo para parsear si llega como string (Vercel en edge env sometimes)
  if (typeof data === "string") data = JSON.parse(data);

  // Puede que Vercel no parsee automáticamente req.body, por lo que:
  if (!data || !data.empresa) {
    let rawData = "";
    req.on("data", chunk => { rawData += chunk; });
    req.on("end", () => {
      data = JSON.parse(rawData);
      return generarPDF(data, res);
    });
  } else {
    return generarPDF(data, res);
  }
};

function generarPDF({ empresa, cuit, fecha, condiciones, productos }, res) {
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="presupuesto_${Date.now()}.pdf"`);

  const doc = new PDFDocument();
  const buffers = [];
  doc.on('data', buffers.push.bind(buffers));
  doc.on('end', () => {
    const pdfData = Buffer.concat(buffers);
    res.status(200).end(pdfData);
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
  doc.fontSize(12).text('Cant.   Descripción                          Precio     Subtotal');
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
