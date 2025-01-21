import { verifyToken } from "../middlewares/authMiddleware.js";

router.get("/perfil", verifyToken, (req, res) => {
  // Aquí ya tienes acceso a req.user
  res.json({ message: "Este es tu perfil privado", user: req.user });
});
