import express from "express";
import {
  getMyPrescriptions,
  getPrescriptionById,
  createPrescription,
  updatePrescription,
  deletePrescription,
  getPrescriptionStats,
  getPatientPrescriptions,
} from "../controllers/prescription.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// All routes require authentication
router.use(verifyToken);

// ============================================
// Doctor routes
// ============================================

/**
 * @route   GET /api/prescriptions/stats
 * @desc    Get prescription stats for the logged-in doctor
 * @access  Private (Doctor)
 */
router.get("/stats", authorizeRoles("Doctor"), getPrescriptionStats);

/**
 * @route   GET /api/prescriptions/my-prescriptions
 * @desc    Get prescriptions for the logged-in doctor
 * @access  Private (Doctor)
 */
router.get("/my-prescriptions", authorizeRoles("Doctor"), getMyPrescriptions);

/**
 * @route   POST /api/prescriptions
 * @desc    Create a new prescription
 * @access  Private (Doctor)
 */
router.post(
  "/",
  authorizeRoles("Doctor"),
  [
    body("patient_id")
      .notEmpty()
      .withMessage("Patient ID is required")
      .isInt({ min: 1 })
      .withMessage("Invalid patient ID"),
    body("diagnosis")
      .trim()
      .notEmpty()
      .withMessage("Diagnosis is required")
      .isLength({ max: 2000 })
      .withMessage("Diagnosis must be less than 2000 characters"),
    body("items")
      .isArray({ min: 1 })
      .withMessage("At least one prescription item is required"),
    body("items.*.medicine_name")
      .trim()
      .notEmpty()
      .withMessage("Medicine name is required"),
    body("items.*.dosage")
      .trim()
      .notEmpty()
      .withMessage("Dosage is required"),
    body("items.*.frequency")
      .trim()
      .notEmpty()
      .withMessage("Frequency is required"),
    body("items.*.duration")
      .trim()
      .notEmpty()
      .withMessage("Duration is required"),
    handleValidationErrors,
  ],
  createPrescription
);

/**
 * @route   GET /api/prescriptions/patient/:patient_id
 * @desc    Get prescriptions for a specific patient
 * @access  Private (Patient themselves, Doctor, Admin)
 */
router.get(
  "/patient/:patient_id",
  authorizeRoles("Doctor", "Patient", "Admin"),
  [
    param("patient_id")
      .isInt({ min: 1 })
      .withMessage("Invalid patient ID"),
    handleValidationErrors,
  ],
  getPatientPrescriptions
);

/**
 * @route   GET /api/prescriptions/:id
 * @desc    Get a single prescription by ID
 * @access  Private (Doctor, Patient, Admin)
 */
router.get(
  "/:id",
  authorizeRoles("Doctor", "Patient", "Admin"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Invalid prescription ID"),
    handleValidationErrors,
  ],
  getPrescriptionById
);

/**
 * @route   PUT /api/prescriptions/:id
 * @desc    Update a prescription
 * @access  Private (Doctor who created it)
 */
router.put(
  "/:id",
  authorizeRoles("Doctor"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Invalid prescription ID"),
    handleValidationErrors,
  ],
  updatePrescription
);

/**
 * @route   DELETE /api/prescriptions/:id
 * @desc    Delete a prescription
 * @access  Private (Doctor who created it, Admin)
 */
router.delete(
  "/:id",
  authorizeRoles("Doctor", "Admin"),
  [
    param("id")
      .isInt({ min: 1 })
      .withMessage("Invalid prescription ID"),
    handleValidationErrors,
  ],
  deletePrescription
);

export default router;
