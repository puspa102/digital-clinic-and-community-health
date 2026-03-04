import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Pharmacy from "./pharmacy.model.js";
import InventoryItem from "./inventory.model.js";

// ============================================
// Order Model
// ============================================
const Order = sequelize.define(
  "Order",
  {
    order_id: {
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

    supplier_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    supplier_contact: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },

    order_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    expected_delivery_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },

    status: {
      type: DataTypes.ENUM(
        "pending",
        "confirmed",
        "shipped",
        "delivered",
        "cancelled"
      ),
      defaultValue: "pending",
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
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
    tableName: "orders",
    timestamps: false,
  }
);

// ============================================
// OrderItem Model
// ============================================
const OrderItem = sequelize.define(
  "OrderItem",
  {
    order_item_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: "order_id",
      },
    },

    inventory_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: InventoryItem,
        key: "inventory_id",
      },
      comment: "Optional link to existing inventory item",
    },

    medicine_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },

    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },

    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    tableName: "order_items",
    timestamps: false,
  }
);

// ============================================
// Relations
// ============================================

// Order <-> Pharmacy
Pharmacy.hasMany(Order, { foreignKey: "pharmacy_id" });
Order.belongsTo(Pharmacy, { foreignKey: "pharmacy_id" });

// Order <-> OrderItem
Order.hasMany(OrderItem, { foreignKey: "order_id", onDelete: "CASCADE" });
OrderItem.belongsTo(Order, { foreignKey: "order_id" });

// OrderItem <-> InventoryItem (optional link)
InventoryItem.hasMany(OrderItem, { foreignKey: "inventory_id" });
OrderItem.belongsTo(InventoryItem, { foreignKey: "inventory_id" });

export { Order, OrderItem };
export default Order;
