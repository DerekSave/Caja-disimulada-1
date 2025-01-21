import CashRegister from "../models/CashRegister.js";
import Transaction from "../models/Transaction.js";

export const cuadreTransacciones = async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar la caja
    const cashRegister = await CashRegister.findByPk(id);
    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // Verificar si la caja está abierta
    if (cashRegister.estado !== "abierta") {
      return res
        .status(400)
        .json({ message: "La caja no está abierta para realizar el cuadre." });
    }

    // Obtener todas las transacciones de la caja
    const transactions = await Transaction.findAll({
      where: { cash_register_id: id }, // Usamos 'cash_register_id' en lugar de 'id'
    });

    // Calcular totales
    const totalEntradas = transactions
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);

    const totalSalidas = transactions
      .filter((t) => t.type === "salida")
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);

    const saldoFinal =
      parseFloat(cashRegister.monto_inicial) + totalEntradas - totalSalidas;

    // Retornar el resumen
    res.status(200).json({
      message: "Cuadre de transacciones realizado con éxito.",
      caja: {
        id: cashRegister.id,
        monto_inicial: cashRegister.monto_inicial,
        total_entradas: totalEntradas,
        total_salidas: totalSalidas,
        saldo_final: saldoFinal,
      },
      transacciones: transactions.map((t) => ({
        id: t.id,
        tipo: t.type,
        monto: t.monto,
        descripcion: t.descripcion,
        fecha: t.created_at,
      })),
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al realizar el cuadre", error: err.message });
  }
};
