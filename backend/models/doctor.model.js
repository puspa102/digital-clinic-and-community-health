import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import User from "./user.model.js";

const Doctor = sequelize.define(
  "Doctor",
  {
    doctor_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    specialization: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    experience_years: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    hospital_name: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },

    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    availability_json: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "doctors",
    timestamps: false,
  },
);

// RELATION
Doctor.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Doctor, { foreignKey: "user_id" });

export default Doctor;