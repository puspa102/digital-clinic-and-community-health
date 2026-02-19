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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Book appointment at pharmacy (Patient only)'
  // #swagger.description = 'Patient books an appointment at a specific pharmacy. The pharmacy will later assign a doctor.'
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      pharmacy_id: 1,
      appointment_date: '2026-02-10',
      appointment_time: '10:30',
      reason: 'Regular checkup'
    }
  } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get my appointments (Patient)'
  // #swagger.description = 'Returns all appointments for the currently logged-in patient'
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status (requested, assigned, confirmed, completed, cancelled, no_show)' } */
  /* #swagger.parameters['upcoming'] = { in: 'query', type: 'string', description: 'Set to "true" to show only upcoming appointments' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get my appointments (Doctor)'
  // #swagger.description = 'Returns all appointments assigned to the currently logged-in doctor'
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' } */
  /* #swagger.parameters['date_from'] = { in: 'query', type: 'string', description: 'Filter from date (YYYY-MM-DD)' } */
  /* #swagger.parameters['date_to'] = { in: 'query', type: 'string', description: 'Filter to date (YYYY-MM-DD)' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get all appointments (Admin only)'
  // #swagger.description = 'Retrieves all appointments with pagination and filters'
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' } */
  /* #swagger.parameters['payment_status'] = { in: 'query', type: 'string', description: 'Filter by payment status' } */
  /* #swagger.parameters['pharmacy_id'] = { in: 'query', type: 'integer', description: 'Filter by pharmacy' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get patient appointments by patient ID'
  // #swagger.description = 'Retrieves all appointments for a specific patient (Admin or patient themselves)'
  /* #swagger.parameters['patient_id'] = { in: 'path', required: true, type: 'integer' } */
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' } */
  /* #swagger.parameters['upcoming'] = { in: 'query', type: 'string', description: 'Set to "true" to show only upcoming' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get doctor appointments by doctor ID'
  // #swagger.description = 'Retrieves all appointments for a specific doctor'
  /* #swagger.parameters['doctor_id'] = { in: 'path', required: true, type: 'integer' } */
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' } */
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
 * @desc    Doctor confirms an assigned appointment
 * @access  Private (Doctor, Admin)
 */
router.put(
  "/:appointment_id/confirm",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Confirm appointment (Doctor)'
  // #swagger.description = 'Doctor confirms an appointment that has been assigned to them by the pharmacy. Moves status from assigned to confirmed.'
  /* #swagger.parameters['appointment_id'] = { in: 'path', required: true, type: 'integer' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Complete appointment (Doctor)'
  // #swagger.description = 'Doctor marks a confirmed appointment as completed'
  /* #swagger.parameters['appointment_id'] = { in: 'path', required: true, type: 'integer' } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Update appointment status'
  // #swagger.description = 'Updates appointment status with transition validation. Valid transitions: requested->assigned/cancelled, assigned->confirmed/cancelled, confirmed->completed/cancelled/no_show'
  /* #swagger.parameters['appointment_id'] = { in: 'path', required: true, type: 'integer' } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      status: 'confirmed'
    }
  } */
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Cancel appointment'
  // #swagger.description = 'Cancels an appointment. Patients can cancel their own, doctors can cancel ones assigned to them, pharmacies can cancel ones in their pharmacy, admins can cancel any.'
  /* #swagger.parameters['appointment_id'] = { in: 'path', required: true, type: 'integer' } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: false,
    schema: {
      reason: 'Unable to attend'
    }
  } */
  verifyToken,
  validateAppointmentIdParam,
  cancelAppointment,
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
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.summary = 'Get appointment by ID'
  // #swagger.description = 'Retrieves a specific appointment. Accessible by the patient, assigned doctor, owning pharmacy, or admin.'
  /* #swagger.parameters['appointment_id'] = { in: 'path', required: true, type: 'integer' } */
  verifyToken,
  validateAppointmentIdParam,
  getAppointmentById,
);

export default router;