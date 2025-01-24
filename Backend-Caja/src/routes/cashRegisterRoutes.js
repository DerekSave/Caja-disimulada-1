import express from "express";
import {
  createCashRegister,
  getCashRegister,
  getAllCashRegisters,
  closeCashRegister,
  getActiveCashRegister, // <--- Este controlador es nuevo
} from "../controllers/cashRegisterController.js";
import auth from "../middlewares/auth.js";
import { getTransactionsByCashRegisterId } from "../controllers/transactionController.js";

const router = express.Router();

// POST /api/cash_registers/start-day -> Inicio de día
router.post("/start-day", auth, createCashRegister);

// GET /api/cash_registers/active -> Obtener la caja activa
router.get("/active", auth, getActiveCashRegister);

// GET /api/cash_registers -> Obtener todas las cajas
router.get("/", auth, getAllCashRegisters);

// GET /api/cash_registers/:id -> Obtener detalles de una caja específica
router.get("/:id", auth, getCashRegister);

// PATCH /api/cash_registers/:id/close -> Cerrar una caja
router.patch("/:id/close", auth, closeCashRegister);

// Obtener transacciones de la caja
router.get("/:id/transactions", auth, getTransactionsByCashRegisterId);
// ...
export default router;
