import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const CashRegister = sequelize.define(
  "CashRegister",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    monto_inicial: {
      type: DataTypes.DECIMAL(15, 2),
      allowNull: false,
    },
    monto_final: {
      type: DataTypes.DECIMAL(15, 2),
    },
    estado: {
      type: DataTypes.STRING,
      defaultValue: "abierta",
    },
    fecha_apertura: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    fecha_cierre: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "cash_register",
    timestamps: true,
    createdAt: "created_at", // Nombre personalizado para createdAt
    updatedAt: "updated_at", // Nombre personalizado para updatedAt
  }
);

export default CashRegister;
