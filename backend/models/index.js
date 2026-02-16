/**
 * Centralized Models Index
 * Exports all models and sets up associations
 */

import sequelize from "../database/database.js";
import User from "./user.model.js";
import Doctor from "./doctor.model.js";
import Appointment from "./appointment.model.js";
import Emergency from "./emergency.model.js";

// Export models object
const models = {
  User,
  Doctor,
  Appointment,
  Emergency,
};

// Export sequelize instance
export { sequelize };

// Export individual models
export { User, Doctor, Appointment, Emergency };

// Default export with all models
export default models;
