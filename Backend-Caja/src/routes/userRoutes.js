import express from "express";
import {
  register,
  login,
  getAuthenticatedUser,
} from "../controllers/userController.js";
import { authenticateUser } from "../middlewares/authenticateUser.js";

const router = express.Router();

// Registro de usuario
router.post("/register", register);

// Inicio de sesión
router.post("/login", login);

// Obtener usuario autenticado
router.get("/me", authenticateUser, getAuthenticatedUser);

export default router;
