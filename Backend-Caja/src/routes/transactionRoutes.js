import express from "express";
import {
  deposit,
  withdraw,
  getTransactionsByCashRegisterId,
} from "../controllers/transactionController.js";
import auth from "../middlewares/auth.js";
import { generateReceipt } from "../controllers/receiptController.js";

const router = express.Router();

// POST /api/transactions/deposit
router.post("/deposit", auth, deposit);

// POST /api/transactions/withdraw
router.post("/withdraw", auth, withdraw);

// POST /api/transactions/receipt -> Generar recibo
router.post("/receipt", auth, generateReceipt);

// cashRegisterRoutes.js
router.get("/:id/transactions", auth, getTransactionsByCashRegisterId);

export default router;
