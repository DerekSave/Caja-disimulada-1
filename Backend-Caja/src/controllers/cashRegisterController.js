import CashRegister from "../models/CashRegister.js";
import Transaction from "../models/Transaction.js";
// Crear una nueva caja
export const createCashRegister = async (req, res) => {
  try {
    const { user_id, branch, monto_inicial } = req.body;

    // Verificar si ya existe una caja abierta en la sucursal
    const existingOpenRegister = await CashRegister.findOne({
      where: { branch, estado: "abierta" },
    });

    if (existingOpenRegister) {
      return res.status(400).json({
        message: "Ya existe una caja abierta para esta sucursal.",
      });
    }

    // Crear la nueva caja
    const newCashRegister = await CashRegister.create({
      user_id,
      branch,
      monto_inicial,
      estado: "abierta", // Marca la caja como abierta
      fecha_apertura: new Date(), // Registra la fecha de apertura
    });

    res.status(201).json({
      message: "Caja creada con éxito",
      cashRegister: newCashRegister,
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al crear la caja", error: err.message });
  }
};

export const getAllCashRegisters = async (req, res) => {
  try {
    const cashRegisters = await CashRegister.findAll();
    res.json(cashRegisters);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener las cajas", error: err.message });
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

export const closeCashRegister = async (req, res) => {
  try {
    const { id } = req.params;

    // Validar el ID
    if (isNaN(id)) {
      return res.status(400).json({ message: "ID inválido para la caja" });
    }

    // Buscar la caja
    const cashRegister = await CashRegister.findByPk(id);

    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    if (cashRegister.estado === "cerrada") {
      return res.status(400).json({ message: "La caja ya está cerrada" });
    }

    // Buscar transacciones asociadas
    const transactions = await Transaction.findAll({
      where: { cash_register_id: id },
    });

    // Calcular entradas y salidas
    const totalEntradas = (transactions || [])
      .filter((t) => t.type === "entrada")
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

    const totalSalidas = (transactions || [])
      .filter((t) => t.type === "salida")
      .reduce((sum, t) => sum + parseFloat(t.monto || 0), 0);

    // Calcular monto final
    const montoFinal =
      parseFloat(cashRegister.monto_inicial || 0) +
      totalEntradas -
      totalSalidas;

    // Actualizar la caja
    cashRegister.monto_final = montoFinal;
    cashRegister.estado = "cerrada";
    cashRegister.fecha_cierre = new Date();

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
    console.error("Error al cerrar caja:", err.message); // Depuración
    res
      .status(500)
      .json({ message: "Error al cerrar caja", error: err.message });
  }
};

// Obtener la caja activa (suponiendo que 'abierta' sea el estado)
export const getActiveCashRegister = async (req, res) => {
  try {
    const activeCashRegister = await CashRegister.findOne({
      where: { estado: "abierta" }, // Ajusta según tu lógica
    });

    if (!activeCashRegister) {
      return res.status(404).json({ message: "No hay caja activa" });
    }

    res.json(activeCashRegister);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener caja activa", error: err.message });
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
