import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
  try {
    const { username, password, branch, role } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    await User.create({
      username,
      password_hash: passwordHash, // Almacenar el hash
      branch,
      role: role || "cajero", // Si no se proporciona el rol, usar 'cajero' por defecto
    });

    res.status(201).json({ message: "Usuario registrado" });
  } catch (err) {
    res.status(400).json({ message: "Error al registrar", error: err.message });
  }
};
export const getAuthenticatedUser = async (req, res) => {
  try {
    const { id, username, branch, role } = req.user; // Extraer los datos relevantes del usuario
    res.status(200).json({ id, username, branch, role });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error al obtener el usuario", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ where: { username } });

    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    const valid = await bcrypt.compare(password, user.password_hash); // Comparar con el hash
    if (!valid)
      return res.status(400).json({ message: "Contraseña incorrecta" });

    const token = jwt.sign(
      { userId: user.id, branch: user.branch, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "8h" }
    );

    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Error interno", error: err.message });
  }
};
