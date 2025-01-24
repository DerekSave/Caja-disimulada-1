// controllers/receiptController.js
import Transaction from "../models/Transaction.js";
import CashRegister from "../models/CashRegister.js";
import Client from "../models/Client.js"; // si lo necesitas

export const generateReceipt = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    // Buscar la transacción
    const transaction = await Transaction.findByPk(transaction_id);
    if (!transaction) {
      return res.status(404).json({ message: "Transacción no encontrada" });
    }

    // Obtener más datos relevantes, si los necesitas (caja, cliente, etc.)
    const cashRegister = await CashRegister.findByPk(
      transaction.cash_register_id
    );
    // const client = await Client.findByPk(transaction.client_id); // Opcional

    // Estructura el contenido del recibo
    const receiptData = {
      transaction_id: transaction.id,
      type: transaction.type,
      monto: transaction.monto,
      descripcion: transaction.descripcion,
      // Datos de la caja
      caja_id: cashRegister.id,
      estado_caja: cashRegister.estado,
      branch: cashRegister.branch,
      // ...
      created_at: transaction.created_at,
    };

    // Devuelve los datos necesarios para que el frontend genere o muestre el recibo
    res.json({ receiptData });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al generar recibo", error: err.message });
  }
};
