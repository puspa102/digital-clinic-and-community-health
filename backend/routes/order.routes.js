import express from "express";
import {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  getOrderStats,
} from "../controllers/order.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Validation chains
// ============================================

const validateCreateOrder = [
  body("supplier_name")
    .trim()
    .notEmpty()
    .withMessage("Supplier name is required")
    .isLength({ max: 200 })
    .withMessage("Supplier name must be less than 200 characters"),
  body("supplier_contact")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Supplier contact must be less than 200 characters"),
  body("order_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid order date format (use YYYY-MM-DD)"),
  body("expected_delivery_date")
    .optional()
    .isISO8601()
    .withMessage("Invalid expected delivery date format (use YYYY-MM-DD)"),
  body("notes")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Notes must be less than 1000 characters"),
  body("items")
    .isArray({ min: 1 })
    .withMessage("At least one item is required"),
  body("items.*.medicine_name")
    .trim()
    .notEmpty()
    .withMessage("Medicine name is required for each item"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
  body("items.*.unit_price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Unit price must be a non-negative number"),
  handleValidationErrors,
];

const validateUpdateStatus = [
  body("status")
    .trim()
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "confirmed", "shipped", "delivered", "cancelled"])
    .withMessage(
      "Status must be one of: pending, confirmed, shipped, delivered, cancelled"
    ),
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
 * @route   GET /api/orders/stats
 * @desc    Get order statistics for the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/stats",
  verifyToken,
  authorizeRoles("Pharmacy"),
  getOrderStats
);

/**
 * @route   GET /api/orders
 * @desc    Get all orders for the logged-in pharmacy
 * @access  Private (Pharmacy)
 */
router.get(
  "/",
  verifyToken,
  authorizeRoles("Pharmacy"),
  getOrders
);

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private (Pharmacy)
 */
router.post(
  "/",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateCreateOrder,
  createOrder
);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private (Pharmacy)
 */
router.get(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  getOrderById
);

/**
 * @route   PUT /api/orders/:id
 * @desc    Update order details
 * @access  Private (Pharmacy)
 */
router.put(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  updateOrder
);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status
 * @access  Private (Pharmacy)
 */
router.put(
  "/:id/status",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  validateUpdateStatus,
  updateOrderStatus
);

/**
 * @route   DELETE /api/orders/:id
 * @desc    Delete order
 * @access  Private (Pharmacy)
 */
router.delete(
  "/:id",
  verifyToken,
  authorizeRoles("Pharmacy"),
  validateIdParam,
  deleteOrder
);

export default router;
