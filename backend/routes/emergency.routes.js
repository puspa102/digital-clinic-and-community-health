import express from "express";
import {
  createEmergency,
  getAllEmergencies,
  getEmergencyById,
  acceptEmergency,
  updateEmergencyStatus,
  getActiveEmergencies,
  getNearbyEmergencies,
  resolveEmergency,
  getMyEmergencies,
  getPublicEmergencies,
  cancelEmergency,
} from "../controllers/emergency.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validateEmergency,
  validateEmergencyStatus,
  validateEmergencyAccept,
  validateIdParam,
} from "../middlewares/validation.middleware.js";
import { emergencyLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/emergencies
 * @desc    Create a new emergency request
 * @access  Private (Patient)
 */
router.post(
  "/",
  verifyToken,
  emergencyLimiter,
  validateEmergency,
  createEmergency,
);

/**
 * @route   GET /api/emergencies/my-emergencies
 * @desc    Get current user's emergency requests
 * @access  Private
 */
router.get(
  "/my-emergencies",
  verifyToken,
  getMyEmergencies,
);

/**
 * @route   GET /api/emergencies/public
 * @desc    Get all public emergency requests (viewable by all authenticated users)
 * @access  Private
 */
router.get(
  "/public",
  verifyToken,
  getPublicEmergencies,
);

/**
 * @route   GET /api/emergencies
 * @desc    Get all emergency requests
 * @access  Private (Admin, Doctor, Pharmacy)
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("Admin", "Doctor", "Pharmacy"),
  getAllEmergencies,
);

/**
 * @route   GET /api/emergencies/active
 * @desc    Get all active (pending/accepted/in_progress) emergencies
 * @access  Private (Admin, Doctor, Pharmacy)
 */
router.get(
  "/active",
  verifyToken,
  authorizeRoles("Admin", "Doctor", "Pharmacy"),
  getActiveEmergencies,
);

/**
 * @route   GET /api/emergencies/nearby
 * @desc    Get nearby emergencies within a specified radius
 * @access  Private (Doctor, Pharmacy)
 */
router.get(
  "/nearby",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  getNearbyEmergencies,
);

/**
 * @route   GET /api/emergencies/:id
 * @desc    Get emergency by ID
 * @access  Private
 */
router.get(
  "/:id",
  verifyToken,
  validateIdParam,
  getEmergencyById,
);

/**
 * @route   PUT /api/emergencies/:emergency_id/accept
 * @desc    Accept an emergency request
 * @access  Private (Doctor, Pharmacy)
 */
router.put(
  "/:emergency_id/accept",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateEmergencyAccept,
  acceptEmergency,
);

/**
 * @route   PUT /api/emergencies/:id/status
 * @desc    Update emergency status
 * @access  Private (Doctor, Pharmacy, Admin)
 */
router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateEmergencyStatus,
  updateEmergencyStatus,
);

/**
 * @route   PUT /api/emergencies/:id/resolve
 * @desc    Resolve an emergency
 * @access  Private (Doctor, Pharmacy, Admin)
 */
router.put(
  "/:id/resolve",
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateIdParam,
  resolveEmergency,
);

/**
 * @route   PUT /api/emergencies/:id/cancel
 * @desc    Cancel own emergency request
 * @access  Private (Patient - own requests only)
 */
router.put(
  "/:id/cancel",
  verifyToken,
  validateIdParam,
  cancelEmergency,
);

export default router;
