import express from "express";
import {
  registerUser,
  loginUser,
  verifyOtp,
  refreshAccessToken,
  logoutUser,
  getProfile,
  updateProfile,
  changePassword,
  resendOtp,
  getAllUsers,
  getUserById,
  updateUserStatus,
  deleteUser,
  getPatientDashboardStats,
} from "../controllers/auth.controller.js";
import {
  verifyToken,
  authorizeRoles,
  checkOwnershipOrAdmin,
} from "../middlewares/auth.middleware.js";
import {
  validateRegister,
  validateLogin,
  validateOtp,
  validateIdParam,
} from "../middlewares/validation.middleware.js";
import {
  authLimiter,
  otpLimiter,
  refreshTokenLimiter,
} from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new patient account (public registration is Patient-only)
 * @access  Public
 */
router.post(
  "/register",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Register a new patient'
  // #swagger.description = 'Creates a new Patient account and sends OTP for verification. Public registration is ONLY for patients. Pharmacies are created by Admin (POST /api/pharmacies). Doctors are created by Pharmacies (POST /api/pharmacies/doctors).'
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      full_name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123',
      phone: '+977-9812345678'
    }
  } */
  /* #swagger.responses[201] = {
    description: 'Patient registered successfully',
    schema: {
      success: true,
      message: 'User registered successfully. Please verify OTP to activate account.',
      data: {
        user_id: 1,
        email: 'john@example.com',
        role: 'Patient',
        status: 'approved'
      }
    }
  } */
  /* #swagger.responses[403] = {
    description: 'Non-patient role rejected',
    schema: {
      success: false,
      message: 'Public registration is only for patients. Pharmacies are created by Admin and Doctors are created by Pharmacies.'
    }
  } */
  authLimiter,
  validateRegister,
  registerUser,
);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for account activation
 * @access  Public
 */
router.post(
  "/verify-otp",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Verify OTP'
  // #swagger.description = 'Verifies the OTP sent to user email for account activation'
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      email: 'john@example.com',
      otp: '123456'
    }
  } */
  /* #swagger.responses[200] = {
    description: 'OTP verified successfully',
    schema: {
      success: true,
      message: 'OTP verified. Account activated.',
      status: 'approved'
    }
  } */
  otpLimiter,
  validateOtp,
  verifyOtp,
);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user email
 * @access  Public
 */
router.post(
  "/resend-otp",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Resend OTP'
  // #swagger.description = 'Resends a new OTP to the user email'
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      email: 'john@example.com'
    }
  } */
  otpLimiter,
  resendOtp,
);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post(
  "/login",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'User login'
  // #swagger.description = 'Authenticates user and returns access token and refresh token'
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      email: 'john@example.com',
      password: 'SecurePass123'
    }
  } */
  /* #swagger.responses[200] = {
    description: 'Login successful',
    schema: {
      success: true,
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      user: {
        id: 1,
        email: 'john@example.com',
        full_name: 'John Doe',
        role: 'Patient'
      }
    }
  } */
  authLimiter,
  validateLogin,
  loginUser,
);

/**
 * @route   GET /api/auth/refresh-token
 * @desc    Refresh access token using refresh token cookie
 * @access  Public (requires valid refresh token cookie)
 */
router.get(
  "/refresh-token",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Refresh access token'
  // #swagger.description = 'Generates a new access token using the refresh token stored in cookies'
  /* #swagger.responses[200] = {
    description: 'Token refreshed successfully',
    schema: {
      success: true,
      accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    }
  } */
  refreshTokenLimiter,
  refreshAccessToken,
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Public
 */
router.post(
  "/logout",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'User logout'
  // #swagger.description = 'Clears the refresh token cookie and logs out the user'
  /* #swagger.responses[200] = {
    description: 'Logout successful',
    schema: {
      success: true,
      message: 'Logged out successfully'
    }
  } */
  logoutUser,
);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get(
  "/profile",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Get user profile'
  // #swagger.description = 'Retrieves the profile of the currently authenticated user'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.responses[200] = {
    description: 'Profile retrieved successfully',
    schema: {
      success: true,
      data: {
        user_id: 1,
        full_name: 'John Doe',
        email: 'john@example.com',
        phone: '+977-9812345678',
        role: 'Patient',
        status: 'approved',
        created_at: '2024-01-15T10:30:00Z'
      }
    }
  } */
  verifyToken,
  getProfile,
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/profile",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Update user profile'
  // #swagger.description = 'Updates the profile of the currently authenticated user'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      full_name: 'John Updated',
      phone: '+977-9812345679'
    }
  } */
  verifyToken,
  updateProfile,
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  "/change-password",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Change password'
  // #swagger.description = 'Changes the password for the currently authenticated user'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      current_password: 'OldPassword123',
      new_password: 'NewSecurePass456'
    }
  } */
  verifyToken,
  authLimiter,
  changePassword,
);

/**
 * @route   GET /api/auth/patient-stats
 * @desc    Get patient dashboard statistics
 * @access  Private (Patient)
 */
router.get(
  "/patient-stats",
  // #swagger.tags = ['Authentication']
  // #swagger.summary = 'Get patient dashboard statistics'
  // #swagger.description = 'Returns comprehensive statistics for the patient dashboard including appointments, prescriptions, and health data'
  // #swagger.security = [{ "bearerAuth": [] }]
  verifyToken,
  authorizeRoles("Patient"),
  getPatientDashboardStats,
);

// ============================================
// Admin Routes
// ============================================

/**
 * @route   GET /api/auth/users
 * @desc    Get all users (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/users",
  // #swagger.tags = ['User Management']
  // #swagger.summary = 'Get all users'
  // #swagger.description = 'Retrieves all users with pagination (Admin only)'
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
  /* #swagger.parameters['role'] = {
    in: 'query',
    type: 'string',
    description: 'Filter by role (Patient, Doctor, Admin, Pharmacy)'
  } */
  /* #swagger.parameters['status'] = {
    in: 'query',
    type: 'string',
    description: 'Filter by status (pending, approved, blocked)'
  } */
  verifyToken,
  authorizeRoles("Admin"),
  getAllUsers,
);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/users/:id",
  // #swagger.tags = ['User Management']
  // #swagger.summary = 'Get user by ID'
  // #swagger.description = 'Retrieves a specific user by ID (Admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'User ID'
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  getUserById,
);

/**
 * @route   PUT /api/auth/users/:id/status
 * @desc    Update user status (approve/block) - Admin only
 * @access  Private (Admin)
 */
router.put(
  "/users/:id/status",
  // #swagger.tags = ['User Management']
  // #swagger.summary = 'Update user status'
  // #swagger.description = 'Approves or blocks a user account (Admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'User ID'
  } */
  /* #swagger.parameters['body'] = {
    in: 'body',
    required: true,
    schema: {
      status: 'approved'
    }
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  updateUserStatus,
);

/**
 * @route   DELETE /api/auth/users/:id
 * @desc    Delete user (Admin only)
 * @access  Private (Admin)
 */
router.delete(
  "/users/:id",
  // #swagger.tags = ['User Management']
  // #swagger.summary = 'Delete user'
  // #swagger.description = 'Permanently deletes a user account (Admin only)'
  // #swagger.security = [{ "bearerAuth": [] }]
  /* #swagger.parameters['id'] = {
    in: 'path',
    required: true,
    type: 'integer',
    description: 'User ID'
  } */
  verifyToken,
  authorizeRoles("Admin"),
  validateIdParam,
  deleteUser,
);

/**
 * @route   GET /api/auth/patients
 * @desc    Get all patients (Admin, Doctor, and Pharmacy)
 * @access  Private (Admin, Doctor, Pharmacy)
 */
router.get(
  "/patients",
  // #swagger.tags = ['User Management']
  // #swagger.summary = 'Get all patients'
  // #swagger.description = 'Retrieves all patient users (Admin, Doctor, and Pharmacy)'
  // #swagger.security = [{ "bearerAuth": [] }]
  verifyToken,
  authorizeRoles("Admin", "Doctor", "Pharmacy"),
  (req, res, next) => {
    req.query.role = "Patient";
    next();
  },
  getAllUsers,
);

export default router;