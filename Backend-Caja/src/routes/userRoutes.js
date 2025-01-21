import express from "express";
import { register, login } from "../controllers/userController.js";

const router = express.Router();

// POST /api/users/register
router.post("/register", register);

// POST /api/users/login
router.post("/login", login);

export default router;

// {  "username": "admin",  "password": "securepassword"}
