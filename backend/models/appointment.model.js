import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import User from "./user.model.js";
import Pharmacy from "./pharmacy.model.js";
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

    pharmacy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pharmacy,
        key: "pharmacy_id",
      },
      comment: "Patient books appointment at a specific pharmacy",
    },

    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Doctor,
        key: "doctor_id",
      },
      comment: "Assigned later by the pharmacy; null until assigned",
    },

    appointment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    appointment_time: {
      type: DataTypes.TIME,
      allowNull: false,
    },

    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Patient describes why they need the appointment",
    },

    status: {
      type: DataTypes.ENUM(
        "requested",
        "assigned",
        "confirmed",
        "completed",
        "cancelled",
        "no_show"
      ),
      defaultValue: "requested",
      comment:
        "requested = patient booked; assigned = pharmacy assigned doctor; confirmed = doctor accepted; completed/cancelled/no_show = terminal states",
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
      allowNull: true,
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
Appointment.belongsTo(User, { foreignKey: "patient_id", as: "Patient" });

Pharmacy.hasMany(Appointment, { foreignKey: "pharmacy_id" });
Appointment.belongsTo(Pharmacy, { foreignKey: "pharmacy_id" });

Doctor.hasMany(Appointment, { foreignKey: "doctor_id" });
Appointment.belongsTo(Doctor, { foreignKey: "doctor_id" });

export default Appointment;