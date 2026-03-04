import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

const Emergency = sequelize.define(
  "Emergency",
  {
    emergency_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "user_id",
      },
    },

    emergency_type: {
      type: DataTypes.ENUM("Doctor", "Blood", "Medicine"),
      allowNull: false,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "accepted",
        "in_progress",
        "resolved",
        "expired"
      ),
      defaultValue: "pending",
    },

    accepted_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      comment: "Doctor, Pharmacy, or donor who accepted",
    },

    priority: {
      type: DataTypes.STRING,
      defaultValue: "HIGH",
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "emergencies",
    timestamps: false,
  }
);

// Relations
User.hasMany(Emergency, { foreignKey: "patient_id" });
Emergency.belongsTo(User, { foreignKey: "patient_id" });

export default Emergency;
