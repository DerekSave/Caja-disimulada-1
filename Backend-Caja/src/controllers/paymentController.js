import Transaction from "../models/Transaction.js";
import CashRegister from "../models/CashRegister.js";

export const payProcedure = async (req, res) => {
  try {
    const { cash_register_id, monto, descripcion, user_id, branch, client_id } =
      req.body;
    let cashRegister;

    // 1. Verificar si existe la caja por el ID
    if (cash_register_id) {
      cashRegister = await CashRegister.findByPk(cash_register_id);
    }

    // 2. Crear caja si no existe (opcional, si tu lógica lo permite)
    if (!cashRegister) {
      if (!user_id || !branch) {
        return res.status(400).json({
          message:
            "No se encontró la caja, y no se proporcionaron los datos (user_id, branch).",
        });
      }

      // Verificar si hay una caja abierta para este user_id y branch
      const existingOpenRegister = await CashRegister.findOne({
        where: { user_id, branch, estado: "abierta" },
      });

      if (existingOpenRegister) {
        cashRegister = existingOpenRegister;
      } else {
        // Crear una nueva caja
        cashRegister = await CashRegister.create({
          user_id,
          branch,
          monto_inicial: 0,
          estado: "abierta",
        });
      }
    }

    // 3. Crear la transacción de pago de consulta/procedimiento
    const newTransaction = await Transaction.create({
      cash_register_id: cashRegister.id,
      type: "pago_consulta", // O "pago_procedimiento", "pago_cuenta", etc.
      monto,
      descripcion,
      client_id, // Asocia al cliente (opcional)
    });

    // 4. Actualizar el monto_final de la caja
    const currentMontoFinal =
      cashRegister.monto_final !== null
        ? parseFloat(cashRegister.monto_final)
        : parseFloat(cashRegister.monto_inicial);

    const newMontoFinal = currentMontoFinal + parseFloat(monto);

    await cashRegister.update({ monto_final: newMontoFinal });

    // 5. Devolver la transacción creada y/o la caja actualizada
    res.status(201).json({
      message: "Pago de procedimiento registrado con éxito",
      transaction: newTransaction,
    });
  } catch (err) {
    res.status(400).json({
      message: "Error al registrar pago de consulta/procedimiento",
      error: err.message,
    });
  }
};
// GET /api/payments?type=pago_consulta
export const listPayments = async (req, res) => {
  try {
    const { type } = req.query;
    let whereClause = {};

    if (type) {
      whereClause.type = type;
    }

    const transactions = await Transaction.findAll({ where: whereClause });
    res.json(transactions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al listar pagos", error: err.message });
  }
};
