import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";

const Transaction = sequelize.define(
  "Transaction",
  {
    transaction_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    transaction_uuid: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      comment: "Unique identifier for the transaction (sent to gateway)",
    },
    customer_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    customer_email: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    customer_phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
    product_name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    product_id: {
      type: DataTypes.STRING(100),
      allowNull: false,
      comment: "ID of the item being purchased (e.g., Appointment ID)",
    },
    amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
    },
    payment_gateway: {
      type: DataTypes.ENUM("esewa", "khalti"),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENDING", "COMPLETED", "FAILED", "REFUNDED"),
      defaultValue: "PENDING",
    },
    gateway_reference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: "Reference ID returned by the payment gateway (e.g., refId, pidx)",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "transactions",
    timestamps: false,
  }
);

export default Transaction;
