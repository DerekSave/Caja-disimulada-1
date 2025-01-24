// models/Transaction.js
import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    cash_register_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false, // 'entrada', 'salida', 'pago_consulta', etc.
    },
    monto: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    descripcion: {
      type: DataTypes.TEXT,
    },
    client_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    fecha: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    offline: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "transactions", // Nombre de la tabla
    timestamps: true, // Activa timestamps automáticos
    createdAt: "created_at", // Mapea `createdAt` a `created_at`
    updatedAt: "updated_at", // Mapea `updatedAt` a `updated_at`
  }
);

export default Transaction;
