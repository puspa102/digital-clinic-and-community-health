import express from "express";
import {
  initiatePayment,
  confirmPayment,
  getPaymentStatus,
  getPaymentHistory,
} from "../controllers/payment.controller.js";
import { verifyToken, authorizeRoles } from "../middlewares/auth.middleware.js";
import {
  validatePaymentInitiate,
  validatePaymentConfirm,
  validateAppointmentIdParam,
  validatePatientIdParam,
} from "../middlewares/validation.middleware.js";
import { paymentLimiter } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

/**
 * @route   POST /api/payments/initiate
 * @desc    Initiate payment for an appointment
 * @access  Private (Patient)
 */
router.post(
  "/initiate",
  verifyToken,
  paymentLimiter,
  validatePaymentInitiate,
  initiatePayment,
);

/**
 * @route   POST /api/payments/confirm
 * @desc    Confirm payment callback from payment gateway
 * @access  Private
 */
router.post(
  "/confirm",
  verifyToken,
  validatePaymentConfirm,
  confirmPayment,
);

/**
 * @route   GET /api/payments/status/:appointment_id
 * @desc    Get payment status for an appointment
 * @access  Private (Patient, Doctor, Admin)
 */
router.get(
  "/status/:appointment_id",
  verifyToken,
  validateAppointmentIdParam,
  getPaymentStatus,
);

/**
 * @route   GET /api/payments/history/:patient_id
 * @desc    Get payment history for a patient
 * @access  Private (Patient, Admin)
 */
router.get(
  "/history/:patient_id",
  verifyToken,
  validatePatientIdParam,
  getPaymentHistory,
);

export default router;
