import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Doctor from "./doctor.model.js";
import User from "./user.model.js";
import Appointment from "./appointment.model.js";

const Prescription = sequelize.define(
  "Prescription",
  {
    prescription_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    doctor_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Doctor, key: "doctor_id" },
    },
    patient_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: User, key: "user_id" },
    },
    appointment_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: Appointment, key: "appointment_id" },
    },
    diagnosis: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("active", "completed", "cancelled"),
      defaultValue: "active",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "prescriptions",
    timestamps: false,
  }
);

const PrescriptionItem = sequelize.define(
  "PrescriptionItem",
  {
    prescription_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    prescription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Prescription, key: "prescription_id" },
    },
    medicine_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    dosage: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "e.g., 500mg, 10ml",
    },
    frequency: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "e.g., Twice daily, Every 8 hours",
    },
    duration: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "e.g., 7 days, 2 weeks",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    instructions: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "e.g., Take after meals, Avoid alcohol",
    },
  },
  {
    tableName: "prescription_items",
    timestamps: false,
  }
);

// Relations
Doctor.hasMany(Prescription, { foreignKey: "doctor_id" });
Prescription.belongsTo(Doctor, { foreignKey: "doctor_id" });

User.hasMany(Prescription, { foreignKey: "patient_id" });
Prescription.belongsTo(User, { foreignKey: "patient_id", as: "Patient" });

Appointment.hasMany(Prescription, { foreignKey: "appointment_id" });
Prescription.belongsTo(Appointment, { foreignKey: "appointment_id" });

Prescription.hasMany(PrescriptionItem, {
  foreignKey: "prescription_id",
  onDelete: "CASCADE",
});
PrescriptionItem.belongsTo(Prescription, { foreignKey: "prescription_id" });

export { Prescription, PrescriptionItem };
export default Prescription;
