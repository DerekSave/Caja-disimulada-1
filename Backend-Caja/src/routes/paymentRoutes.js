import express from "express";
import { payProcedure } from "../controllers/paymentController.js";
import auth from "../middlewares/auth.js";

const router = express.Router();

// POST /api/payments/procedure -> Pago de consulta/procedimiento
router.post("/procedure", auth, payProcedure);

export default router;
