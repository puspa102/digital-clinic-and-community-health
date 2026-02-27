import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    password_hash: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
      unique: true,
    },
    role: {
      type: DataTypes.ENUM("Doctor", "Patient", "Admin", "Pharmacy"),
      defaultValue: "Patient",
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("pending", "approved", "blocked"),
      defaultValue: "pending", // Admin approves Doctors/Pharmacies
    },
    otp: {
      type: DataTypes.STRING(6), // Temporary OTP for verification
      allowNull: true,
    },
    otp_expiry: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_temp_password: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "users",
    timestamps: false,
  },
);

export default User;
