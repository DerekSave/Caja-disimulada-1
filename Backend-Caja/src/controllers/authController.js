// src/controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcrypt";

export const registerUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hashear contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Crear usuario en Postgres
    const newUser = await User.create({
      email,
      password: hashedPassword,
    });

    return res.json({ message: "Usuario registrado", user: newUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear usuario" });
  }
};
