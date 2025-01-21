import express from "express";
import {
  createCashRegister,
  getCashRegister,
  closeCashRegister,
} from "../controllers/cashRegisterController.js";
import auth from "../middlewares/auth.js";
import { cuadreTransacciones } from "../controllers/cuadreController.js";
const router = express.Router();

// POST /api/cash_registers -> Crear una nueva caja
router.post("/", auth, createCashRegister);

// GET /api/cash_registers/:id -> Obtener detalles de una caja específica
router.get("/:id", auth, getCashRegister);

// PATCH /api/cash_registers/:id/close -> Cerrar una caja
router.patch("/:id/close", auth, closeCashRegister);

// GET /api/cash_registers/:id/cuadre -> Obtener cuadre de una caja
router.get("/:id/cuadre", auth, cuadreTransacciones);

export default router;
