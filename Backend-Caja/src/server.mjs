import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
import sequelize from "./config/db.js"; // Asegúrate de añadir la extensión `.js` en rutas con ES Modules
import userRoutes from "./routes/userRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import cashRegisterRoutes from "./routes/cashRegisterRoutes.js";
import clientRoutes from "./routes/clientRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cron from "node-cron";
import { closeCashRegister } from "./controllers/cashRegisterController.js";

// Cargar variables de entorno
dotenv.config();

// Instancia de express
const app = express();
app.use(helmet());
app.use(express.json());

// Usar las rutas
app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/cash_registers", cashRegisterRoutes);
app.use("/api/clients", clientRoutes);
app.use("/api/payments", paymentRoutes);

// Programar tarea diaria para cerrar cajas abiertas
cron.schedule("59 23 * * *", async () => {
  console.log("Ejecutando cierre automático de cajas...");
  const openCashRegisters = await CashRegister.findAll({
    where: { estado: "abierta" },
  });

  for (const cashRegister of openCashRegisters) {
    await closeCashRegister({ params: { cash_register_id: cashRegister.id } });
  }

  console.log("Cierre automático de cajas completado.");
});

// Sincronizar la base de datos y arrancar el servidor
(async () => {
  try {
    await sequelize.sync();
    console.log("Base de datos conectada");

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log("Servidor corriendo en el puerto", PORT);
    });
  } catch (err) {
    console.error("Error al conectar con la base de datos:", err);
  }
})();
