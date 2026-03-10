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
  getAllDoctors,
);

/**
 * @route   GET /api/doctors/search
 * @desc    Search doctors by name, specialization, or hospital
 * @access  Public
 */
router.get(
  "/search",
  searchDoctors,
);

/**
 * @route   GET /api/doctors/specialization/:specialization
 * @desc    Get doctors by specialization
 * @access  Public
 */
router.get(
  "/specialization/:specialization",
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
  verifyToken,
  authorizeRoles("Pharmacy", "Admin"),
  validateIdParam,
  deleteDoctor,
);

export default router;