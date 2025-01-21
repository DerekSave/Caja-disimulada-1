import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

// Usa variables de entorno definidas en .env para no exponer credenciales
const sequelize = new Sequelize(
  process.env.PG_DB, // nombre de la base de datos
  process.env.PG_USER, // usuario
  process.env.PG_PASS, // contraseña
  {
    host: process.env.PG_HOST || "localhost",
    dialect: "postgres",
    port: process.env.PG_PORT || 5432,
    logging: false, // desactiva logs de SQL en consola (opcional)
  }
);

export default sequelize;
