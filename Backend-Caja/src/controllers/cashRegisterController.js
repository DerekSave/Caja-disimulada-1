import CashRegister from "../models/CashRegister.js";

// Crear una nueva caja
export const createCashRegister = async (req, res) => {
  try {
    const { user_id, branch, monto_inicial } = req.body;

    const newCashRegister = await CashRegister.create({
      user_id,
      branch,
      monto_inicial,
    });

    res.status(201).json(newCashRegister);
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear caja", error: err.message });
  }
};

// Obtener detalles de una caja
export const getCashRegister = async (req, res) => {
  try {
    const { id } = req.params;
    const cashRegister = await CashRegister.findByPk(id);

    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    res.json(cashRegister);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener caja", error: err.message });
  }
};

// Cerrar una caja
export const closeCashRegister = async (req, res) => {
  try {
    const { id } = req.params; // Obtén el ID de la caja desde los parámetros de la ruta

    // Busca la caja por su ID
    const cashRegister = await CashRegister.findByPk(id);

    // Verifica si la caja existe
    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // Verifica si la caja ya está cerrada
    if (cashRegister.estado === "cerrada") {
      return res.status(400).json({ message: "La caja ya está cerrada" });
    }

    // Obtén las transacciones asociadas a esta caja
    const transactions = await Transaction.findAll({
      where: { cash_register_id: id },
    });

    // Calcula el total de entradas y salidas
    const totalEntradas = transactions
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);

    const totalSalidas = transactions
      .filter((t) => t.type === "salida")
      .reduce((sum, t) => sum + parseFloat(t.monto), 0);

    // Calcula el monto final
    const montoFinal =
      parseFloat(cashRegister.monto_inicial) + totalEntradas - totalSalidas;

    // Actualiza los valores de la caja
    cashRegister.monto_final = montoFinal;
    cashRegister.estado = "cerrada";
    cashRegister.fecha_cierre = new Date();

    // Guarda los cambios
    await cashRegister.save();

    res.status(200).json({
      message: "Caja cerrada con éxito",
      cuadre: {
        id: cashRegister.id,
        monto_inicial: cashRegister.monto_inicial,
        total_entradas: totalEntradas,
        total_salidas: totalSalidas,
        monto_final: cashRegister.monto_final,
        fecha_cierre: cashRegister.fecha_cierre,
      },
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al cerrar caja", error: err.message });
  }
};

export const getCuadre = async (req, res) => {
  try {
    const { id } = req.params;
    const cashRegister = await CashRegister.findByPk(id);
    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // Sumar entradas
    const totalEntradas = await Transaction.sum("monto", {
      where: { cash_register_id: id, type: "entrada" },
    });

    // Sumar salidas
    const totalSalidas = await Transaction.sum("monto", {
      where: { cash_register_id: id, type: "salida" },
    });

    // Calcular saldo sistema
    const saldoSistema =
      parseFloat(cashRegister.monto_inicial) +
      (totalEntradas || 0) -
      (totalSalidas || 0);

    res.json({
      monto_inicial: cashRegister.monto_inicial,
      total_entradas: totalEntradas || 0,
      total_salidas: totalSalidas || 0,
      saldo_sistema: saldoSistema,
      monto_final: cashRegister.monto_final,
    });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener cuadre", error: err.message });
  }
};
