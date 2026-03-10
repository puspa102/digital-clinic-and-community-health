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
  // Password is now auto-generated on the backend, so no validation needed
  body("pharmacy_name")
    .trim()
    .notEmpty()
    .withMessage("Pharmacy name is required")
    .isLength({ max: 200 })
    .withMessage("Pharmacy name must be less than 200 characters"),
  body("address").trim().notEmpty().withMessage("Address is required"),
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
  // Password is now auto-generated on the backend, so no validation needed
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
  getAllPharmacies,
);

/**
 * @route   GET /api/pharmacies/me
 * @desc    Get the pharmacy profile of the currently logged-in pharmacy user
 * @access  Private (Pharmacy)
 */
router.get(
  "/me",
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
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  deletePharmacy,
);

export default router;
