/**
 * Application Constants
 * Centralized configuration values and constants
 */

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// User Roles
export const USER_ROLES = {
  PATIENT: "Patient",
  DOCTOR: "Doctor",
  ADMIN: "Admin",
  PHARMACY: "Pharmacy",
};

// User Status
export const USER_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  BLOCKED: "blocked",
};

// Appointment Status
export const APPOINTMENT_STATUS = {
  REQUESTED: "requested",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  NO_SHOW: "no_show",
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
};

// Emergency Types
export const EMERGENCY_TYPES = {
  DOCTOR: "Doctor",
  BLOOD: "Blood",
  MEDICINE: "Medicine",
};

// Emergency Status
export const EMERGENCY_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  IN_PROGRESS: "in_progress",
  RESOLVED: "resolved",
  EXPIRED: "expired",
};

// Emergency Priority
export const EMERGENCY_PRIORITY = {
  LOW: "LOW",
  MEDIUM: "MEDIUM",
  HIGH: "HIGH",
  CRITICAL: "CRITICAL",
};

// JWT Configuration
export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: "15m",
  REFRESH_TOKEN_EXPIRY: "7d",
  REFRESH_TOKEN_COOKIE_MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
};

// OTP Configuration
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
};

// Pagination Defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

// Rate Limiting
export const RATE_LIMITS = {
  GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  OTP: {
    WINDOW_MS: 5 * 60 * 1000, // 5 minutes
    MAX_REQUESTS: 3,
  },
  PAYMENT: {
    WINDOW_MS: 60 * 60 * 1000, // 1 hour
    MAX_REQUESTS: 10,
  },
  EMERGENCY: {
    WINDOW_MS: 10 * 60 * 1000, // 10 minutes
    MAX_REQUESTS: 5,
  },
};

// Validation Constraints
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 150,
  PHONE_MIN_LENGTH: 7,
  PHONE_MAX_LENGTH: 15,
  BIO_MAX_LENGTH: 1000,
  DESCRIPTION_MAX_LENGTH: 1000,
  MAX_EXPERIENCE_YEARS: 70,
};

// Error Codes
export const ERROR_CODES = {
  TOKEN_EXPIRED: "TOKEN_EXPIRED",
  INVALID_TOKEN: "INVALID_TOKEN",
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  USER_NOT_FOUND: "USER_NOT_FOUND",
  USER_BLOCKED: "USER_BLOCKED",
  USER_PENDING: "USER_PENDING",
  DUPLICATE_EMAIL: "DUPLICATE_EMAIL",
  DUPLICATE_PHONE: "DUPLICATE_PHONE",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  RATE_LIMIT_EXCEEDED: "RATE_LIMIT_EXCEEDED",
  INTERNAL_ERROR: "INTERNAL_ERROR",
};

// Success Messages
export const SUCCESS_MESSAGES = {
  USER_REGISTERED: "User registered successfully. Please verify OTP to activate account.",
  OTP_VERIFIED: "OTP verified. Account activated.",
  LOGIN_SUCCESS: "Login successful",
  LOGOUT_SUCCESS: "Logged out successfully",
  PROFILE_CREATED: "Profile created successfully",
  PROFILE_UPDATED: "Profile updated successfully",
  PROFILE_DELETED: "Profile deleted successfully",
  APPOINTMENT_CREATED: "Appointment requested successfully",
  APPOINTMENT_UPDATED: "Appointment updated successfully",
  APPOINTMENT_COMPLETED: "Appointment completed successfully",
  PAYMENT_INITIATED: "Payment initiated successfully",
  PAYMENT_CONFIRMED: "Payment confirmed successfully",
  EMERGENCY_CREATED: "Emergency request created successfully",
  EMERGENCY_ACCEPTED: "Emergency accepted successfully",
  EMERGENCY_UPDATED: "Emergency status updated successfully",
};

// Error Messages
export const ERROR_MESSAGES = {
  ALL_FIELDS_REQUIRED: "All required fields must be provided",
  INVALID_EMAIL: "Invalid email format",
  INVALID_PASSWORD: "Password must be at least 8 characters with uppercase, lowercase, and number",
  EMAIL_EXISTS: "Email already registered",
  PHONE_EXISTS: "Phone number already registered",
  USER_NOT_FOUND: "User not found",
  INVALID_CREDENTIALS: "Invalid email or password",
  INVALID_OTP: "Invalid or expired OTP",
  DOCTOR_NOT_FOUND: "Doctor not found",
  DOCTOR_PROFILE_EXISTS: "Doctor profile already exists",
  INVALID_DOCTOR_USER: "User is not registered as a doctor",
  APPOINTMENT_NOT_FOUND: "Appointment not found",
  EMERGENCY_NOT_FOUND: "Emergency not found",
  EMERGENCY_ALREADY_ACCEPTED: "Emergency has already been accepted",
  UNAUTHORIZED: "Unauthorized access",
  FORBIDDEN: "Access denied",
  TOKEN_REQUIRED: "Access token is required",
  TOKEN_INVALID: "Invalid or expired token",
  SERVER_ERROR: "Internal server error. Please try again later.",
};

export default {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  APPOINTMENT_STATUS,
  PAYMENT_STATUS,
  EMERGENCY_TYPES,
  EMERGENCY_STATUS,
  EMERGENCY_PRIORITY,
  JWT_CONFIG,
  OTP_CONFIG,
  PAGINATION,
  RATE_LIMITS,
  VALIDATION,
  ERROR_CODES,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
};
