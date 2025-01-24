import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extraer el token del header

  if (!token) {
    return res.status(401).json({ message: "No autenticado" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verificar y decodificar el token
    const user = await User.findByPk(decoded.userId); // Buscar el usuario por ID

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    req.user = user; // Asociar el usuario al objeto `req`
    next(); // Pasar al siguiente middleware o controlador
  } catch (err) {
    res.status(401).json({ message: "Token inválido", error: err.message });
  }
};
