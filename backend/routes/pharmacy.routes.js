import express from "express";
import {
  createPharmacy,
  getAllPharmacies,
  getPharmacyById,
  updatePharmacy,
  deletePharmacy,
  createDoctor,
  getMyDoctors,
  getPharmacyDoctors,
  assignDoctorToAppointment,
  getMyAppointments,
  getMyPharmacy,
} from "../controllers/pharmacy.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateIdParam,
  validateAppointmentIdParam,
} from "../middlewares/validation.middleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Validation chains specific to pharmacy routes
// ============================================

const validateCreatePharmacy = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("pharmacy_name")
    .trim()
    .notEmpty()
    .withMessage("Pharmacy name is required")
    .isLength({ max: 200 })
    .withMessage("Pharmacy name must be less than 200 characters"),
  body("address")
    .trim()
    .notEmpty()
    .withMessage("Address is required"),
  body("license_number")
    .trim()
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ max: 100 })
    .withMessage("License number must be less than 100 characters"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Invalid phone number format"),
  body("latitude")
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  body("opening_time")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid opening time format (use HH:MM)"),
  body("closing_time")
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid closing time format (use HH:MM)"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  handleValidationErrors,
];

const validateCreateDoctor = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Invalid phone number format"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ max: 100 })
    .withMessage("Specialization must be less than 100 characters"),
  body("license_number")
    .trim()
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ max: 100 })
    .withMessage("License number must be less than 100 characters"),
  body("experience_years")
    .notEmpty()
    .withMessage("Experience years is required")
    .isInt({ min: 0, max: 70 })
    .withMessage("Experience years must be between 0 and 70"),
  body("hospital_name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Hospital name must be less than 150 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),
  body("consultation_fee")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Consultation fee must be a positive number"),
  body("availability_json")
    .optional()
    .isObject()
    .withMessage("Availability must be a valid JSON object"),
  handleValidationErrors,
];

const validateAssignDoctor = [
  param("appointment_id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid appointment ID"),
  body("doctor_id")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid doctor ID"),
  handleValidationErrors,
];

// ============================================
// Admin Routes — Create & manage pharmacies
// ============================================

/**
 * @route   POST /api/pharmacies
 * @desc    Create a new pharmacy (creates user + pharmacy profile)
 * @access  Private (Admin)
 */
router.post(
  "/",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Create a new pharmacy (Admin only)'
  // #swagger.description = 'Admin creates a pharmacy account. This creates both the User (role=Pharmacy) and the Pharmacy profile in one step.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      full_name: 'Pharmacy Owner Name',
      email: 'pharmacy@example.com',
      password: 'SecurePass123',
      phone: '+977-9812345678',
      pharmacy_name: 'City Health Pharmacy',
      address: 'Kathmandu, Thamel',
      license_number: 'PH-NEP-12345',
      latitude: 27.7172,
      longitude: 85.3240,
      opening_time: '08:00',
      closing_time: '20:00',
      description: 'A trusted pharmacy in the heart of Thamel'
    }
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateCreatePharmacy,
  createPharmacy,
);

/**
 * @route   GET /api/pharmacies
 * @desc    Get all pharmacies with pagination and search
 * @access  Public
 */
router.get(
  "/",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get all pharmacies'
  // #swagger.description = 'Retrieves all approved pharmacies with pagination'
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number (default: 1)' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page (default: 10)' } */
  /* #swagger.parameters['search'] = { in: 'query', type: 'string', description: 'Search by pharmacy name or address' } */
  getAllPharmacies,
);

/**
 * @route   GET /api/pharmacies/me
 * @desc    Get the pharmacy profile of the currently logged-in pharmacy user
 * @access  Private (Pharmacy)
 */
router.get(
  "/me",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get my pharmacy profile'
  // #swagger.description = 'Returns the pharmacy profile and associated doctors for the logged-in pharmacy user'
  // #swagger.security = [{ "bearerAuth": [] }]
  verifyToken,
  authorizeRoles("Pharmacy"),
  getMyPharmacy,
);

// ============================================
// Pharmacy Routes — Manage their doctors
// ============================================

/**
 * @route   POST /api/pharmacies/doctors
 * @desc    Create a doctor under the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.post(
  "/doctors",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Create a doctor (Pharmacy only)'
  // #swagger.description = 'Pharmacy creates a new doctor account. This creates both the User (role=Doctor) and the Doctor profile linked to this pharmacy.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      full_name: 'Dr. Ram Sharma',
      email: 'doctor@example.com',
      password: 'SecurePass123',
      phone: '+977-9812345679',
      specialization: 'Cardiologist',
      license_number: 'DOC-NEP-12345',
      experience_years: 8,
      hospital_name: 'City Health Pharmacy',
      bio: 'Heart specialist with 8 years of experience',
      consultation_fee: 500,
      availability_json: { "mon": ["10:00","12:00"], "tue": ["14:00","16:00"] }
    }
  } */
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateCreateDoctor,
  createDoctor,
);

/**
 * @route   GET /api/pharmacies/my-doctors
 * @desc    Get all doctors belonging to the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/my-doctors",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get my pharmacy doctors'
  // #swagger.description = 'Returns all doctors belonging to the currently logged-in pharmacy'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['specialization'] = { in: 'query', type: 'string', description: 'Filter by specialization' } */
  verifyToken,
  authorizeRoles("Pharmacy"),
  getMyDoctors,
);

// ============================================
// Pharmacy Routes — Manage appointments
// ============================================

/**
 * @route   GET /api/pharmacies/my-appointments
 * @desc    Get all appointments for the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/my-appointments",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get my pharmacy appointments'
  // #swagger.description = 'Returns all appointments made to the currently logged-in pharmacy'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status (requested, assigned, confirmed, completed, cancelled, no_show)' } */
  /* #swagger.parameters['date_from'] = { in: 'query', type: 'string', description: 'Filter from date (YYYY-MM-DD)' } */
  /* #swagger.parameters['date_to'] = { in: 'query', type: 'string', description: 'Filter to date (YYYY-MM-DD)' } */
  verifyToken,
  authorizeRoles("Pharmacy"),
  getMyAppointments,
);

/**
 * @route   PUT /api/pharmacies/appointments/:appointment_id/assign-doctor
 * @desc    Assign a doctor to an appointment
 * @access  Private (Pharmacy)
 */
router.put(
  "/appointments/:appointment_id/assign-doctor",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Assign doctor to appointment (Pharmacy only)'
  // #swagger.description = 'Pharmacy picks one of their doctors and assigns them to a pending appointment. Moves status from requested to assigned.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['appointment_id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Appointment ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      doctor_id: 5
    }
  } */
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateAssignDoctor,
  assignDoctorToAppointment,
);

// ============================================
// Public Routes — View pharmacy details
// ============================================

/**
 * @route   GET /api/pharmacies/:id/doctors
 * @desc    Get all doctors belonging to a specific pharmacy
 * @access  Public
 */
router.get(
  "/:id/doctors",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get pharmacy doctors (public)'
  // #swagger.description = 'Returns all approved doctors belonging to a specific pharmacy'
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Pharmacy ID'
  } */
  /* #swagger.parameters['specialization'] = { in: 'query', type: 'string', description: 'Filter by specialization' } */
  validateIdParam,
  getPharmacyDoctors,
);

/**
 * @route   GET /api/pharmacies/:id
 * @desc    Get pharmacy by ID (includes list of doctors)
 * @access  Public
 */
router.get(
  "/:id",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Get pharmacy by ID'
  // #swagger.description = 'Retrieves a specific pharmacy by ID, including its doctors'
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Pharmacy ID'
  } */
  validateIdParam,
  getPharmacyById,
);

/**
 * @route   PUT /api/pharmacies/:id
 * @desc    Update pharmacy profile
 * @access  Private (Pharmacy owner or Admin)
 */
router.put(
  "/:id",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Update pharmacy profile'
  // #swagger.description = 'Updates an existing pharmacy profile. Only the pharmacy owner or an admin can update.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Pharmacy ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      pharmacy_name: 'Updated Pharmacy Name',
      address: 'New Address',
      description: 'Updated description'
    }
  } */
  verifyToken,
  authorizeRoles("Pharmacy", "Admin"),
  validateIdParam,
  updatePharmacy,
);

/**
 * @route   DELETE /api/pharmacies/:id
 * @desc    Delete pharmacy and its user account
 * @access  Private (Admin)
 */
router.delete(
  "/:id",
  // #swagger.tags = ['Pharmacies']
  // #swagger.summary = 'Delete pharmacy (Admin only)'
  // #swagger.description = 'Permanently deletes a pharmacy profile and its associated user account'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Pharmacy ID'
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  deletePharmacy,
);

export default router;