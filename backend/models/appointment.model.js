import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import User from "./user.model.js";
import Doctor from "./doctor.model.js";

const Appointment = sequelize.define(
  "Appointment",
  {
    appointment_id: {
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

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Doctor,
        key: "doctor_id",
      },
    },

    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    appointment_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    status: {
      type: DataTypes.ENUM(
        "requested",
        "confirmed",
        "completed",
        "cancelled",
        "no_show"
      ),
      defaultValue: "requested",
    },

    payment_status: {
      type: DataTypes.ENUM("pending", "paid", "failed"),
      defaultValue: "pending",
    },

    payment_amount: {
      type: DataTypes.FLOAT,
      allowNull: true,
    },

    payment_reference: {
      type: DataTypes.STRING,
      allowNull: true, // eSewa / Khalti transaction ID
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "appointments",
    timestamps: false,
  }
);

// Relations
User.hasMany(Appointment, { foreignKey: "patient_id" });
Doctor.hasMany(Appointment, { foreignKey: "doctor_id" });
Appointment.belongsTo(User, { foreignKey: "patient_id" });
Appointment.belongsTo(Doctor, { foreignKey: "doctor_id" });

export default Appointment;
