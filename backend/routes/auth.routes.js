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
  requestPasswordResetOtp,
  resetPasswordWithOtp,
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
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   POST /api/auth/register
 * @desc    Register a new patient account (public registration is Patient-only)
 * @access  Public
 */
router.post("/register", authLimiter, validateRegister, registerUser);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP for account activation
 * @access  Public
 */
router.post("/verify-otp", otpLimiter, validateOtp, verifyOtp);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to user email
 * @access  Public
 */
router.post("/resend-otp", otpLimiter, resendOtp);

/**
 * @route   POST /api/auth/forgot-password
 * @desc    Send OTP for password reset
 * @access  Public
 */
router.post("/forgot-password", otpLimiter, requestPasswordResetOtp);

/**
 * @route   POST /api/auth/reset-password-otp
 * @desc    Reset password using email + OTP
 * @access  Public
 */
router.post("/reset-password-otp", authLimiter, resetPasswordWithOtp);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user and get tokens
 * @access  Public
 */
router.post("/login", authLimiter, validateLogin, loginUser);

/**
 * @route   GET /api/auth/refresh-token
 * @desc    Refresh access token using refresh token cookie
 * @access  Public (requires valid refresh token cookie)
 */
router.get("/refresh-token", refreshTokenLimiter, refreshAccessToken);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user and clear refresh token cookie
 * @access  Public
 */
router.post("/logout", logoutUser);

// ============================================
// Protected Routes (Authentication Required)
// ============================================

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", verifyToken, getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put(
  "/profile",
  verifyToken,
  upload.single("profile_picture"),
  updateProfile,
);

/**
 * @route   PUT /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.put("/change-password", verifyToken, authLimiter, changePassword);

/**
 * @route   GET /api/auth/patient-stats
 * @desc    Get patient dashboard statistics
 * @access  Private (Patient)
 */
router.get(
  "/patient-stats",
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
router.get("/users", verifyToken, authorizeRoles("Admin"), getAllUsers);

/**
 * @route   GET /api/auth/users/:id
 * @desc    Get user by ID (Admin only)
 * @access  Private (Admin)
 */
router.get(
  "/users/:id",
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
  verifyToken,
  authorizeRoles("Admin", "Doctor", "Pharmacy"),
  (req, res, next) => {
    req.query.role = "Patient";
    next();
  },
  getAllUsers,
);

export default router;
