import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    branch: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
      defaultValue: "cajero",
    },
  },
  {
    tableName: "users",
    timestamps: true, // Esto usa automáticamente las columnas created_at y updated_at
    createdAt: "created_at", // Mapea created_at
    updatedAt: "updated_at", // Mapea updated_at
  }
);

export default User;
