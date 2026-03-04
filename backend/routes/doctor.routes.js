import express from "express";
import {
  getAllDoctors,
  getDoctorById,
  getMyDoctorProfile,
  updateDoctor,
  deleteDoctor,
  getDoctorsBySpecialization,
  searchDoctors,
  getMyPatients,
  getDoctorDashboardStats,
} from "../controllers/doctor.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateDoctorUpdate,
  validateIdParam,
} from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Public Routes — Browse & search doctors
// ============================================

/**
 * @route   GET /api/doctors
 * @desc    Get all doctors with pagination
 * @access  Public
 */
router.get(
  "/",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get all doctors'
  // #swagger.description = 'Retrieves all approved doctors with pagination. Optionally filter by specialization, hospital, experience, or pharmacy.'
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number (default: 1)' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page (default: 10, max: 100)' } */
  /* #swagger.parameters['specialization'] = { in: 'query', type: 'string', description: 'Filter by specialization' } */
  /* #swagger.parameters['hospital'] = { in: 'query', type: 'string', description: 'Filter by hospital name' } */
  /* #swagger.parameters['experience_min'] = { in: 'query', type: 'integer', description: 'Minimum experience years' } */
  /* #swagger.parameters['experience_max'] = { in: 'query', type: 'integer', description: 'Maximum experience years' } */
  /* #swagger.parameters['pharmacy_id'] = { in: 'query', type: 'integer', description: 'Filter by pharmacy ID' } */
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
  // #swagger.description = 'Search doctors by name, specialization, or hospital. Optionally filter by pharmacy.'
  /* #swagger.parameters['q'] = { in: 'query', type: 'string', description: 'Search query (matches name, specialization, hospital)' } */
  /* #swagger.parameters['specialization'] = { in: 'query', type: 'string', description: 'Filter by specialization' } */
  /* #swagger.parameters['pharmacy_id'] = { in: 'query', type: 'integer', description: 'Filter by pharmacy ID' } */
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
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
  // #swagger.description = 'Retrieves all approved doctors with a specific specialization'
  /* #swagger.parameters['specialization'] = { in: 'path', required: true, type: 'string', description: 'Doctor specialization' } */
  getDoctorsBySpecialization,
);

// ============================================
// Protected Routes — Doctor's own profile
// ============================================

/**
 * @route   GET /api/doctors/me
 * @desc    Get the profile of the currently logged-in doctor
 * @access  Private (Doctor)
 */
router.get(
  "/me",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get my doctor profile'
  // #swagger.description = 'Returns the doctor profile for the currently logged-in doctor user, including pharmacy info'
  // #swagger.security = [{ "bearerAuth": [] }]
  verifyToken,
  authorizeRoles("Doctor"),
  getMyDoctorProfile,
);

/**
 * @route   GET /api/doctors/dashboard-stats
 * @desc    Get dashboard statistics for the logged-in doctor
 * @access  Private (Doctor)
 */
router.get(
  "/dashboard-stats",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get doctor dashboard statistics'
  // #swagger.description = 'Returns comprehensive statistics for the doctor dashboard including appointments, patients, and earnings data'
  // #swagger.security = [{ "bearerAuth": [] }]
  verifyToken,
  authorizeRoles("Doctor"),
  getDoctorDashboardStats,
);

/**
 * @route   GET /api/doctors/my-patients
 * @desc    Get patients who have had appointments with the logged-in doctor
 * @access  Private (Doctor)
 */
router.get(
  "/my-patients",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get my patients'
  // #swagger.description = 'Returns patients who have had appointments with the logged-in doctor'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['page'] = { in: 'query', type: 'integer', description: 'Page number' } */
  /* #swagger.parameters['limit'] = { in: 'query', type: 'integer', description: 'Items per page' } */
  /* #swagger.parameters['search'] = { in: 'query', type: 'string', description: 'Search by name, email, or phone' } */
  verifyToken,
  authorizeRoles("Doctor"),
  getMyPatients,
);

// ============================================
// Public Route — Get doctor by ID
// ============================================

/**
 * @route   GET /api/doctors/:id
 * @desc    Get doctor by ID
 * @access  Public
 */
router.get(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Get doctor by ID'
  // #swagger.description = 'Retrieves a specific doctor by their ID, including pharmacy info'
  /* #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'Doctor ID' } */
  validateIdParam,
  getDoctorById,
);

// ============================================
// Protected Routes — Update & delete
// NOTE: Doctors are created by Pharmacies via POST /api/pharmacies/doctors
// ============================================

/**
 * @route   PUT /api/doctors/:id
 * @desc    Update doctor profile
 * @access  Private (Doctor owner, Pharmacy owner, Admin)
 */
router.put(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Update doctor profile'
  // #swagger.description = 'Updates an existing doctor profile. The doctor themselves, their parent pharmacy, or an admin can update.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'Doctor ID' } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      specialization: 'Neurologist',
      experience_years: 10,
      hospital_name: 'Nepal Medical College',
      bio: 'Updated bio',
      consultation_fee: 700,
      availability_json: { "mon": ["10:00","12:00"], "wed": ["14:00","16:00"] }
    }
  } */
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateDoctorUpdate,
  updateDoctor,
);

/**
 * @route   DELETE /api/doctors/:id
 * @desc    Delete doctor profile and user account
 * @access  Private (Pharmacy owner, Admin)
 */
router.delete(
  "/:id",
  // #swagger.tags = ['Doctors']
  // #swagger.summary = 'Delete doctor (Pharmacy or Admin only)'
  // #swagger.description = 'Permanently deletes a doctor profile and its associated user account. Only the parent pharmacy or an admin can delete.'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = { in: 'path', required: true, type: 'integer', description: 'Doctor ID' } */
  verifyToken,
  authorizeRoles("Pharmacy", "Admin"),
  validateIdParam,
  deleteDoctor,
);

export default router;