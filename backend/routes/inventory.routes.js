import express from "express";
import {
  getInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  getInventoryStats,
} from "../controllers/inventory.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Validation chains
// ============================================

const validateCreateInventoryItem = [
  body("medicine_name")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required")
    .isLength({ max: 200 })
    .withMessage("Medicine name must be less than 200 characters"),
  body("generic_name")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Generic name must be less than 200 characters"),
  body("category")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Category must be less than 100 characters"),
  body("manufacturer")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Manufacturer must be less than 200 characters"),
  body("batch_number")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Batch number must be less than 100 characters"),
  body("expiry_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid expiry date format (use YYYY-MM-DD)"),
  body("quantity")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Quantity must be a non-negative integer"),
  body("unit_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number"),
  body("selling_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Selling price must be a non-negative number"),
  body("reorder_level")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Reorder level must be a non-negative integer"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  handleValidationErrors,
];

const validateIdParam = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("Invalid ID"),
  handleValidationErrors,
];

// ============================================
// Routes
// ============================================

/**
 * @route   GET /api/inventory/stats
 * @desc    Get inventory statistics for the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("Pharmacy"),
  getInventoryStats
);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items for the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("Pharmacy"),
  getInventory
);

/**
 * @route   POST /api/inventory
 * @desc    Create a new inventory item
 * @access  Private (Pharmacy)
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateCreateInventoryItem,
  createInventoryItem
);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get a single inventory item
 * @access  Private (Pharmacy)
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  getInventoryItem
);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update an inventory item
 * @access  Private (Pharmacy)
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  updateInventoryItem
);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete (soft) an inventory item
 * @access  Private (Pharmacy)
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  deleteInventoryItem
);

export default router;
