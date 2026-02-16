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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Create emergency request'
  // #swagger.description = 'Creates a new emergency request for immediate assistance'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      patient_id: 1,
      emergency_type: 'Doctor',
      description: 'Severe chest pain',
      latitude: 27.7172,
      longitude: 85.3240
    }
  } */
  verifyToken,
  emergencyLimiter,
  validateEmergency,
  createEmergency,
);

/**
 * @route   GET /api/emergencies
 * @desc    Get all emergency requests
 * @access  Private (Admin, Doctor, Pharmacy)
 */
router.get(
  "/",
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Get all emergencies'
  // #swagger.description = 'Retrieves all emergency requests with pagination'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['page'] = {
    in: 'query',
    type: 'integer',
    description: 'Page number (default: 1)'
  } */
  /* #swagger.parameters['limit'] = {
    in: 'query',
    type: 'integer',
    description: 'Items per page (default: 10)'
  } */
  /* #swagger.parameters['status'] = {
    in: 'query',
    type: 'string',
    description: 'Filter by status (pending, accepted, in_progress, resolved, expired)'
  } */
  /* #swagger.parameters['type'] = {
    in: 'query',
    type: 'string',
    description: 'Filter by emergency type (Doctor, Blood, Medicine)'
  } */
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Get active emergencies'
  // #swagger.description = 'Retrieves all active emergency requests (pending, accepted, in_progress)'
  // #swagger.security = [{ "bearerAuth": [] }]
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Get nearby emergencies'
  // #swagger.description = 'Retrieves emergency requests within a specified radius from given coordinates'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['latitude'] = {
    in: 'query',
    required: true,
    type: 'number',
    description: 'Current latitude'
  } */
  /* #swagger.parameters['longitude'] = {
    in: 'query',
    required: true,
    type: 'number',
    description: 'Current longitude'
  } */
  /* #swagger.parameters['radius'] = {
    in: 'query',
    type: 'number',
    description: 'Search radius in kilometers (default: 10)'
  } */
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Get emergency by ID'
  // #swagger.description = 'Retrieves a specific emergency request by ID'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Emergency ID'
  } */
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Accept emergency request'
  // #swagger.description = 'Accepts an emergency request (Doctor/Pharmacy/Donor)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['emergency_id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Emergency ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      accepted_by: 2
    }
  } */
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Update emergency status'
  // #swagger.description = 'Updates the status of an emergency request'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Emergency ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      status: 'in_progress'
    }
  } */
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
  // #swagger.tags = ['Emergency']
  // #swagger.summary = 'Resolve emergency'
  // #swagger.description = 'Marks an emergency as resolved'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'Emergency ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: false,
    schema: {
      resolution_notes: 'Patient stabilized and transported to hospital'
    }
  } */
  verifyToken,
  authorizeRoles("Doctor", "Pharmacy", "Admin"),
  validateIdParam,
  resolveEmergency,
);

export default router;
