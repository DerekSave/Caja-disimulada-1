import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const loginUser = async (req, res) => {
  const { email, password } = req.body;

  // 1) Verifica las credenciales en la BD.
  // 2) Si son correctas, genera token JWT:
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: "Usuario no existe" });
    }

    // Comparar password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ error: "Credenciales inválidas" });
    }

    // Generar token JWT
    const token = jwt.sign(
      { email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" } // expira en 1 día
    );

    return res.json({ message: "Login exitoso", token });
  } catch (error) {
    return res.status(500).json({ error: "Login falló" });
  }
};
