import express from "express";
import {
  createDoctorProfile,
  getAllDoctors,
  getDoctorById,
  updateDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  searchDoctors,
} from "../controllers/doctor.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateDoctorProfile,
  validateDoctorUpdate,
  validateIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/doctors/profile
 * @desc    Create doctor profile
 * @access  Private (Doctor only)
 */
router.post(
  "/profile",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Create doctor profile'
  // #swagger.description = 'Creates a new doctor profile for a registered doctor user'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      user_id: 5,
      specialization: 'Cardiologist',
      license_number: 'DOC-NEP-12345',
      experience_years: 8,
      hospital_name: 'Kathmandu Medical',
      bio: 'Heart specialist with 8 years of experience',
      availability_json: { "mon": ["10:00","12:00"], "tue": ["14:00","16:00"] }
    }
  } */
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateDoctorProfile,
  createDoctorProfile,
);

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors with pagination
 * @access  Public
 */
router.get(
  "/",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get all doctors'
  // #swagger.description = 'Retrieves all doctors with pagination support'
  /* #swagger.parameters['page'] = {
    in: 'query',
    type: 'integer',
    description: 'Page number (default: 1)'
  } */
  /* #swagger.parameters['limit'] = {
    in: 'query',
    type: 'integer',
    description: 'Items per page (default: 10, max: 100)'
  } */
  getAllDoctors,
);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors by name, specialization, or hospital
 * @access  Public
 */
router.get(
  "/search",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Search doctors'
  // #swagger.description = 'Search doctors by name, specialization, or hospital'
  /* #swagger.parameters['q'] = {
    in: 'query',
    type: 'string',
    description: 'Search query'
  } */
  /* #swagger.parameters['specialization'] = {
    in: 'query',
    type: 'string',
    description: 'Filter by specialization'
  } */
  /* #swagger.parameters['page'] = {
    in: 'query',
    type: 'integer',
    description: 'Page number'
  } */
  /* #swagger.parameters['limit'] = {
    in: 'query',
    type: 'integer',
    description: 'Items per page'
  } */
  searchDoctors,
);

/**
 * @route   GET /api/doctors/specialization/:specialization
 * @desc    Get doctors by specialization
 * @access  Public
 */
router.get(
  "/specialization/:specialization",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get doctors by specialization'
  // #swagger.description = 'Retrieves all doctors with a specific specialization'
  /* #swagger.parameters['specialization'] = {
    in: 'path',
    required: true,
    type: 'string',
    description: 'Doctor specialization'
  } */
  getDoctorsBySpecialization,
);

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get doctor by ID'
  // #swagger.description = 'Retrieves a specific doctor by their ID'
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Doctor ID'
  } */
  validateIdParam,
  getDoctorById,
);

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor profile
 * @access  Private (Owner or Admin)
 */
router.put(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Update doctor profile'
  // #swagger.description = 'Updates an existing doctor profile'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Doctor ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      specialization: 'Neurologist',
      experience_years: 10,
      hospital_name: 'Nepal Medical College',
      bio: 'Updated bio'
    }
  } */
  verifyToken,
  authorizeRoles("Doctor", "Admin"),
  validateDoctorUpdate,
  updateDoctor,
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete doctor profile
 * @access  Private (Admin only)
 */
router.delete(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Delete doctor profile'
  // #swagger.description = 'Deletes a doctor profile (Admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Doctor ID'
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  deleteDoctor,
);

export default router;
