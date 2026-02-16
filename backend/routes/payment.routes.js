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
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Initiate payment'
  // #swagger.description = 'Initiates a payment for an appointment (eSewa/Khalti)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      appointment_id: 1,
      amount: 500,
      payment_method: 'esewa'
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Payment initiated successfully',
    schema: {
      success: true,
      message: 'Payment initiated',
      data: {
        paymentUrl: 'https://esewa.com/payment?...',
        transaction_id: 'TXN-123456'
      }
    }
  } */
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
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Confirm payment'
  // #swagger.description = 'Confirms payment callback from eSewa/Khalti'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      appointment_id: 1,
      payment_id: 'ES-12345',
      status: 'success',
      transaction_code: 'TXN123456'
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Payment confirmed',
    schema: {
      success: true,
      message: 'Payment confirmed successfully',
      data: {
        appointment_id: 1,
        payment_status: 'paid',
        payment_reference: 'ES-12345'
      }
    }
  } */
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
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Get payment status'
  // #swagger.description = 'Retrieves the payment status for a specific appointment'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['appointment_id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Appointment ID'
  } */
  /* #swagger.responses[200] = {
    description: 'Payment status retrieved',
    schema: {
      success: true,
      data: {
        appointment_id: 1,
        payment_status: 'paid',
        payment_amount: 500,
        payment_reference: 'ES-12345',
        paid_at: '2024-01-15T10:30:00Z'
      }
    }
  } */
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
  // #swagger.tags = ['Payments']
  // #swagger.summary = 'Get payment history'
  // #swagger.description = 'Retrieves payment history for a specific patient'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['patient_id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Patient ID'
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
  /* #swagger.responses[200] = {
    description: 'Payment history retrieved',
    schema: {
      success: true,
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 5,
        totalItems: 50,
        itemsPerPage: 10
      }
    }
  } */
  verifyToken,
  validatePatientIdParam,
  getPaymentHistory,
);

export default router;
