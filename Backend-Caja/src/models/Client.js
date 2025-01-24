// models/Client.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js"; // Asegúrate de ajustar la ruta a tu archivo de conexión

const Client = sequelize.define(
  "Client",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nombre: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    documento: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    direccion: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    telefono: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "clients", // Nombre exacto de la tabla en tu base de datos
    timestamps: true,
    createdAt: "created_at", // Mapea la columna created_at
    updatedAt: "updated_at", // Mapea la columna updated_at
  }
);

export default Client;
