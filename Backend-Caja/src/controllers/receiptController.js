import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Crear __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateReceipt = async (req, res) => {
  try {
    const { transaction_id, cliente, monto, descripcion } = req.body;

    if (!transaction_id || !cliente || !monto || !descripcion) {
      return res.status(400).json({ message: "Datos insuficientes" });
    }

    // Crear el directorio de recibos si no existe
    const receiptsDir = path.join(__dirname, "../../receipts");
    if (!fs.existsSync(receiptsDir)) {
      fs.mkdirSync(receiptsDir, { recursive: true });
    }

    const filePath = path.join(receiptsDir, `receipt-${transaction_id}.pdf`);

    const doc = new PDFDocument({ size: "A4", margin: 50 });

    // Crear encabezado profesional
    doc
      .fontSize(20)
      .text("Recibo Oficial de Transacción", {
        align: "center",
        underline: true,
      })
      .moveDown(1);

    // Añadir un divisor
    doc.moveTo(50, 100).lineTo(550, 100).stroke();

    // Información del recibo
    doc.fontSize(12).moveDown();
    doc
      .text(`ID Transacción: ${transaction_id}`, { continued: true })
      .text(`Fecha: ${new Date().toLocaleString()}`, { align: "right" });
    doc.moveDown();
    doc
      .text(`Cliente: ${cliente}`, { continued: true })
      .text(`Monto: RD$ ${monto}`, { align: "right" });
    doc.moveDown();
    doc.text(`Descripción: ${descripcion}`);
    doc.moveDown(1);

    // Añadir una nota o pie de página
    doc
      .moveDown(2)
      .fontSize(10)
      .text(
        "Este recibo sirve como comprobante oficial de la transacción realizada.",
        { align: "center", italic: true }
      );

    // Estilizar el pie de página
    doc.moveTo(50, 750).lineTo(550, 750).stroke();
    doc
      .fontSize(8)
      .text(
        "Caja Aseguradora - Todos los derechos reservados © 2025",
        50,
        760,
        { align: "center" }
      );

    // Guardar el archivo PDF
    doc.pipe(fs.createWriteStream(filePath));
    doc.end();

    res
      .status(200)
      .json({ message: "Recibo generado profesionalmente", filePath });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error al generar recibo", error: error.message });
  }
};
