import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";
import Pharmacy from "./pharmacy.model.js";

const InventoryItem = sequelize.define(
  "InventoryItem",
  {
    inventory_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    pharmacy_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Pharmacy,
        key: "pharmacy_id",
      },
    },

    medicine_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    generic_name: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    category: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: "General",
      comment: "e.g., Tablet, Capsule, Syrup, Injection, Cream, Drops",
    },

    manufacturer: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    batch_number: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },

    expiry_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    reorder_level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10,
      comment: "Minimum quantity before triggering reorder alert",
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
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
    tableName: "inventory_items",
    timestamps: false,
  }
);

// Relations
Pharmacy.hasMany(InventoryItem, { foreignKey: "pharmacy_id" });
InventoryItem.belongsTo(Pharmacy, { foreignKey: "pharmacy_id" });

export default InventoryItem;
