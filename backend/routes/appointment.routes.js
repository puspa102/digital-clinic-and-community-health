import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getMyDoctorAppointments,
  getMyAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
  getAppointmentById,
  getAppointmentByQrToken,
} from "../controllers/appointment.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateAppointmentStatus,
  validateAppointmentIdParam,
  validatePatientIdParam,
  validateDoctorIdParam,
} from "../middlewares/validation.middleware.js";
import { body } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Validation for creating an appointment
// Patient books at a pharmacy — no doctor_id required
// ============================================

const validateCreateAppointment = [
  body("pharmacy_id")
    .notEmpty()
    .withMessage("Pharmacy ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid pharmacy ID"),
  body("appointment_date")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD)")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past");
      }
      return true;
    }),
  body("appointment_time")
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (use HH:MM)"),
  body("reason")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Reason must be less than 1000 characters"),
  handleValidationErrors,
];

// ============================================
// Patient Routes
// ============================================

/**
 * @route   POST /api/appointments
 * @desc    Patient books an appointment at a specific pharmacy (no doctor needed)
 * @access  Private (Patient)
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("Patient"),
  validateCreateAppointment,
  createAppointment,
);

/**
 * @route   GET /api/appointments/my-appointments
 * @desc    Get all appointments for the currently logged-in patient
 * @access  Private (Patient)
 */
router.get(
  "/my-appointments",
  verifyToken,
  authorizeRoles("Patient"),
  getMyAppointments,
);

/**
 * @route   GET /api/appointments/my-doctor-appointments
 * @desc    Get all appointments assigned to the currently logged-in doctor
 * @access  Private (Doctor)
 */
router.get(
  "/my-doctor-appointments",
  verifyToken,
  authorizeRoles("Doctor"),
  getMyDoctorAppointments,
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin"),
  getAllAppointments,
);

/**
 * @route   GET /api/appointments/patient/:patient_id
 * @desc    Get appointments by patient ID (Admin or patient themselves)
 * @access  Private (Admin, Patient)
 */
router.get(
  "/patient/:patient_id",
  verifyToken,
  validatePatientIdParam,
  getPatientAppointments,
);

/**
 * @route   GET /api/appointments/doctor/:doctor_id
 * @desc    Get appointments by doctor ID
 * @access  Private (Doctor owner, Pharmacy owner, Admin)
 */
router.get(
  "/doctor/:doctor_id",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateDoctorIdParam,
  getDoctorAppointments,
);

// ============================================
// Doctor Routes — Confirm / Complete
// ============================================

/**
 * @route   PUT /api/appointments/:appointment_id/confirm
 * @desc    Doctor confirms an assigned appointment with consultation details
 * @access  Private (Doctor, Admin)
 */
router.put(
  "/:appointment_id/confirm",
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateAppointmentIdParam,
  confirmAppointment,
);

/**
 * @route   PUT /api/appointments/:appointment_id/complete
 * @desc    Mark appointment as completed
 * @access  Private (Doctor, Admin)
 */
router.put(
  "/:appointment_id/complete",
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateAppointmentIdParam,
  completeAppointment,
);

// ============================================
// Shared Routes — Status update / Cancel
// ============================================

/**
 * @route   PUT /api/appointments/:appointment_id/status
 * @desc    Update appointment status (with transition validation)
 * @access  Private (Doctor, Pharmacy, Admin)
 */
router.put(
  "/:appointment_id/status",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateAppointmentStatus,
  updateAppointmentStatus,
);

/**
 * @route   PUT /api/appointments/:appointment_id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patient, Doctor, Pharmacy, Admin)
 */
router.put(
  "/:appointment_id/cancel",
  verifyToken,
  validateAppointmentIdParam,
  cancelAppointment,
);

// ============================================
// QR Code Verification
// ============================================

/**
 * @route   GET /api/appointments/verify-qr/:qr_token
 * @desc    Verify appointment by QR token
 * @access  Private (Doctor, Pharmacy, Admin)
 */
router.get(
  "/verify-qr/:qr_token",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  getAppointmentByQrToken,
);

// ============================================
// Get single appointment
// ============================================

/**
 * @route   GET /api/appointments/:appointment_id
 * @desc    Get appointment by ID
 * @access  Private (Patient who owns it, Doctor assigned to it, Pharmacy that owns it, or Admin)
 */
router.get(
  "/:appointment_id",
  verifyToken,
  validateAppointmentIdParam,
  getAppointmentById,
);

export default router;