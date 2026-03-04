import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./user.model.js";

const Pharmacy = sequelize.define(
  "Pharmacy",
  {
    pharmacy_id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: User,
        key: "user_id",
      },
    },

    pharmacy_name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false,
    },

    license_number: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },

    phone: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },

    latitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    longitude: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    opening_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    closing_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "pharmacies",
    timestamps: false,
  }
);

// RELATIONS
Pharmacy.belongsTo(User, { foreignKey: "user_id" });
User.hasOne(Pharmacy, { foreignKey: "user_id" });

export default Pharmacy;