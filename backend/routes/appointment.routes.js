import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getDoctorAppointments,
  getPatientAppointments,
  updateAppointmentStatus,
  completeAppointment,
  cancelAppointment,
  getAppointmentById,
} from "../controllers/appointment.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateAppointment,
  validateAppointmentStatus,
  validateAppointmentIdParam,
  validatePatientIdParam,
  validateDoctorIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/appointments
 * @desc    Create a new appointment request
 * @access  Private (Patient)
 */
router.post(
  "/",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Create a new appointment request'
  // #swagger.parameters['body'] = {
  //   in: 'body',
  //   required: true,
  //   schema: {
  //     patient_id: 3,
  //     doctor_id: 5,
  //     appointment_date: '2026-02-10',
  //     appointment_time: '10:30'
  //   }
  // }
  verifyToken,
  validateAppointment,
  createAppointment,
);

/**
 * @route   GET /api/appointments
 * @desc    Get all appointments (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Get all appointments (Admin only)'
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' }
  // #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' }
  verifyToken,
  authorizeRoles("Admin"),
  getAllAppointments,
);

/**
 * @route   GET /api/appointments/:appointment_id
 * @desc    Get appointment by ID
 * @access  Private
 */
router.get(
  "/:appointment_id",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Get appointment by ID'
  // #swagger.parameters['appointment_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  verifyToken,
  validateAppointmentIdParam,
  getAppointmentById,
);

/**
 * @route   GET /api/appointments/patient/:patient_id
 * @desc    Get appointments by patient ID
 * @access  Private (Patient, Admin)
 */
router.get(
  "/patient/:patient_id",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Get appointments by patient'
  // #swagger.parameters['patient_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' }
  // #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' }
  verifyToken,
  validatePatientIdParam,
  getPatientAppointments,
);

/**
 * @route   GET /api/appointments/doctor/:doctor_id
 * @desc    Get appointments by doctor ID
 * @access  Private (Doctor, Admin)
 */
router.get(
  "/doctor/:doctor_id",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Get appointments by doctor'
  // #swagger.parameters['doctor_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  // #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' }
  // #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' }
  // #swagger.parameters['status'] = { in: 'query', type: 'string', description: 'Filter by status' }
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateDoctorIdParam,
  getDoctorAppointments,
);

/**
 * @route   PUT /api/appointments/:appointment_id/status
 * @desc    Update appointment status (confirm/reject)
 * @access  Private (Doctor, Admin)
 */
router.put(
  "/:appointment_id/status",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Doctor accepts or rejects appointment'
  // #swagger.parameters['appointment_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  // #swagger.parameters['body'] = {
  //   in: 'body',
  //   required: true,
  //   schema: {
  //     status: 'confirmed'
  //   }
  // }
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateAppointmentStatus,
  updateAppointmentStatus,
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
  // #swagger.description = 'Mark appointment as completed'
  // #swagger.parameters['appointment_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateAppointmentIdParam,
  completeAppointment,
);

/**
 * @route   PUT /api/appointments/:appointment_id/cancel
 * @desc    Cancel an appointment
 * @access  Private (Patient, Doctor, Admin)
 */
router.put(
  "/:appointment_id/cancel",
  // #swagger.tags = ['Appointments']
  // #swagger.security = [{ "bearerAuth": [] }]
  // #swagger.description = 'Cancel an appointment'
  // #swagger.parameters['appointment_id'] = {
  //   in: 'path',
  //   required: true,
  //   type: 'integer'
  // }
  // #swagger.parameters['body'] = {
  //   in: 'body',
  //   required: false,
  //   schema: {
  //     reason: 'Unable to attend'
  //   }
  // }
  verifyToken,
  validateAppointmentIdParam,
  cancelAppointment,
);

export default router;
