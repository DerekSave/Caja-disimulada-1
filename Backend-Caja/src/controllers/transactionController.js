import Transaction from "../models/Transaction.js";
import CashRegister from "../models/CashRegister.js";

export const getTransactionsByCashRegisterId = async (req, res) => {
  try {
    const { id } = req.params; // ID de la caja
    // Verificar si la caja existe (opcional, pero recomendado)
    const cashRegister = await CashRegister.findByPk(id);
    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // Buscar todas las transacciones con ese cash_register_id
    const transactions = await Transaction.findAll({
      where: { cash_register_id: id },
      order: [["created_at", "DESC"]], // por ejemplo, más recientes primero
    });

    return res.json(transactions);
  } catch (err) {
    return res.status(500).json({
      message: "Error al obtener transacciones",
      error: err.message,
    });
  }
};
export const deposit = async (req, res) => {
  try {
    const { cash_register_id, monto, descripcion, user_id, branch } = req.body;
    let cashRegister;

    // 1. Verificar si se proporcionó cash_register_id
    if (cash_register_id) {
      cashRegister = await CashRegister.findByPk(cash_register_id);
    }

    // 2. Si no existe la caja, buscar si ya hay una caja abierta para este usuario y sucursal
    if (!cashRegister) {
      if (!user_id || !branch) {
        return res.status(400).json({
          message:
            "No se encontró la caja, y no se proporcionaron los datos necesarios para crearla (user_id y branch).",
        });
      }

      // Verificar si ya existe una caja abierta para este user_id + branch
      const existingOpenRegister = await CashRegister.findOne({
        where: { user_id, branch, estado: "abierta" },
      });
      if (existingOpenRegister) {
        // Usar la caja abierta existente en lugar de crear una nueva
        cashRegister = existingOpenRegister;
      } else {
        // Crear una nueva caja
        cashRegister = await CashRegister.create({
          user_id,
          branch,
          monto_inicial: 0, // Ajustar según tu lógica de negocio
          estado: "abierta",
        });
      }
    }

    // 3. Crear la transacción de depósito
    const newTransaction = await Transaction.create({
      cash_register_id: cashRegister.id,
      type: "entrada",
      monto,
      descripcion,
    });

    // 4. Actualizar el monto_final de la caja
    const currentMontoFinal =
      cashRegister.monto_final !== null
        ? parseFloat(cashRegister.monto_final)
        : parseFloat(cashRegister.monto_inicial);

    const newMontoFinal = currentMontoFinal + parseFloat(monto);

    await cashRegister.update({ monto_final: newMontoFinal });

    // 5. (Opcional) Refrescar la caja para obtener los datos actualizados
    // const updatedCashRegister = await CashRegister.findByPk(cashRegister.id);

    res.status(201).json({
      message: "Depósito realizado con éxito",
      transaction: newTransaction,
      // cashRegister: updatedCashRegister // Descomenta si quieres devolver la caja actualizada
    });
  } catch (err) {
    res
      .status(400)
      .json({ message: "Error al hacer depósito", error: err.message });
  }
};

export const withdraw = async (req, res) => {
  try {
    const { cash_register_id, monto, descripcion, client_id } = req.body; // Incluir client_id si aplica

    // 1. Verificar si la caja existe
    const cashRegister = await CashRegister.findByPk(cash_register_id);
    if (!cashRegister) {
      return res.status(404).json({ message: "Caja no encontrada" });
    }

    // 2. Calcular nuevo monto final
    const currentMontoFinal =
      cashRegister.monto_final !== null
        ? parseFloat(cashRegister.monto_final)
        : parseFloat(cashRegister.monto_inicial);

    const newMontoFinal = currentMontoFinal - parseFloat(monto);

    // 3. Control de saldos negativos
    if (newMontoFinal < 0) {
      return res.status(400).json({
        message: "Saldo insuficiente en la caja para realizar el retiro.",
      });
    }

    // 4. Crear la transacción (retiro)
    const newTransaction = await Transaction.create({
      cash_register_id,
      type: "salida",
      monto,
      descripcion,
      client_id: client_id || null, // Registra el client_id si está presente
    });

    // 5. Actualizar la caja
    await cashRegister.update({ monto_final: newMontoFinal });

    res.status(201).json({
      message: "Retiro realizado con éxito",
      transaction: newTransaction,
    });
  } catch (err) {
    res.status(400).json({ message: "Error al retirar", error: err.message });
  }
};
