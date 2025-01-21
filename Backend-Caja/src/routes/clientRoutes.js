import express from "express";
import {
  createClient,
  getClientByDocument,
} from "../controllers/clientController.js";
const router = express.Router();
import auth from "../middlewares/auth.js";

// POST /api/clients -> Crea un nuevo cliente
router.post("/", auth, createClient);

// GET /api/clients/:documento -> Busca cliente por documento
router.get("/:documento", auth, getClientByDocument);

export default router;
