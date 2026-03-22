import express from "express";
import {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
  getChatContacts,
  markAsRead,
} from "../controllers/chat.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import { body, param } from "express-validator";
import { handleValidationErrors } from "../middlewares/validation.middleware.js";

const router = express.Router();

// ============================================
// Validation Middlewares
// ============================================

const validateConversationId = [
  param("conversationId")
    .isInt({ min: 1 })
    .withMessage("Invalid conversation ID"),
  handleValidationErrors,
];

const validateCreateConversation = [
  body("participant_id")
    .notEmpty()
    .withMessage("Participant ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid participant ID"),
  handleValidationErrors,
];

const validateSendMessage = [
  param("conversationId")
    .isInt({ min: 1 })
    .withMessage("Invalid conversation ID"),
  body("content")
    .notEmpty()
    .withMessage("Message content is required")
    .isLength({ max: 5000 })
    .withMessage("Message must be less than 5000 characters"),
  body("message_type")
    .optional()
    .isIn(["text", "image", "file"])
    .withMessage("Invalid message type"),
  handleValidationErrors,
];

// ============================================
// Chat Routes
// ============================================

/**
 * @route   GET /api/chat/contacts
 * @desc    Get available chat contacts
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.get(
  "/contacts",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  getChatContacts,
);

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.get(
  "/unread-count",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  getUnreadCount,
);

/**
 * @route   GET /api/chat/conversations
 * @desc    Get all conversations for current user
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.get(
  "/conversations",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  getConversations,
);

/**
 * @route   POST /api/chat/conversations
 * @desc    Get or create a conversation with another user
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.post(
  "/conversations",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  validateCreateConversation,
  getOrCreateConversation,
);

/**
 * @route   GET /api/chat/conversations/:conversationId/messages
 * @desc    Get messages in a conversation
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.get(
  "/conversations/:conversationId/messages",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  validateConversationId,
  getMessages,
);

/**
 * @route   POST /api/chat/conversations/:conversationId/messages
 * @desc    Send a message in a conversation
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.post(
  "/conversations/:conversationId/messages",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  validateSendMessage,
  sendMessage,
);

/**
 * @route   PUT /api/chat/conversations/:conversationId/read
 * @desc    Mark messages as read
 * @access  Private (Doctor, Patient, Pharmacy, Admin)
 */
router.put(
  "/conversations/:conversationId/read",
  verifyToken,
  authorizeRoles("Doctor", "Patient", "Pharmacy", "Admin"),
  validateConversationId,
  markAsRead,
);

export default router;
