/**
 * Centralized Models Index
 * Exports all models and sets up associations
 */

import sequelize from "../config/db.js";
import User from "./user.model.js";
import Pharmacy from "./pharmacy.model.js";
import Doctor from "./doctor.model.js";
import Appointment from "./appointment.model.js";
import Emergency from "./emergency.model.js";
import InventoryItem from "./inventory.model.js";
import { Order, OrderItem } from "./order.model.js";
import { Prescription, PrescriptionItem } from "./prescription.model.js";

// Export models object
const models = {
  User,
  Pharmacy,
  Doctor,
  Appointment,
  Emergency,
  InventoryItem,
  Order,
  OrderItem,
  Prescription,
  PrescriptionItem,
};

// Export sequelize instance
export { sequelize };

// Export individual models
export { User, Pharmacy, Doctor, Appointment, Emergency, InventoryItem, Order, OrderItem, Prescription, PrescriptionItem };

// Default export with all models
export default models;