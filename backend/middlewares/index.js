/**
 * Middleware Index
 * Centralized exports for all middleware modules
 */

// Authentication middleware
export {
  verifyToken,
  authorizeRoles,
  optionalAuth,
  checkOwnershipOrAdmin,
} from "./auth.middleware.js";

// Error handling middleware
export {
  errorHandler,
  notFoundHandler,
  asyncHandler,
  ApiError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  ValidationError,
  InternalError,
} from "./error.middleware.js";

// Rate limiting middleware
export {
  apiLimiter,
  authLimiter,
  refreshTokenLimiter,
  otpLimiter,
  paymentLimiter,
  emergencyLimiter,
} from "./rateLimiter.middleware.js";

// Validation middleware
export {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateOtp,
  validateDoctorProfile,
  validateDoctorUpdate,
  validateAppointment,
  validateAppointmentStatus,
  validateEmergency,
  validateEmergencyStatus,
  validateEmergencyAccept,
  validatePaymentInitiate,
  validatePaymentConfirm,
  validateIdParam,
  validatePatientIdParam,
  validateDoctorIdParam,
  validateAppointmentIdParam,
} from "./validation.middleware.js";

// Default export with grouped middleware
export default {
  auth: {
    verifyToken,
    authorizeRoles,
    optionalAuth,
    checkOwnershipOrAdmin,
  },
  rateLimiter: {
    apiLimiter,
    authLimiter,
    refreshTokenLimiter,
    otpLimiter,
    paymentLimiter,
    emergencyLimiter,
  },
};