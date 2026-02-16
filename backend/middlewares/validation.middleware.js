import { body, param, validationResult } from "express-validator";

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }
  next();
};

/**
 * Auth validations
 */
export const validateRegister = [
  body("full_name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Full name must be between 2 and 100 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  body("role")
    .optional()
    .isIn(["Doctor", "Patient", "Admin", "Pharmacy"])
    .withMessage("Invalid role"),
  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,15}$/)
    .withMessage("Invalid phone number format"),
  handleValidationErrors,
];

export const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
  handleValidationErrors,
];

export const validateOtp = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .normalizeEmail(),
  body("otp")
    .trim()
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),
  handleValidationErrors,
];

/**
 * Doctor validations
 */
export const validateDoctorProfile = [
  body("user_id")
    .notEmpty()
    .withMessage("User ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
  body("specialization")
    .trim()
    .notEmpty()
    .withMessage("Specialization is required")
    .isLength({ max: 100 })
    .withMessage("Specialization must be less than 100 characters"),
  body("license_number")
    .trim()
    .notEmpty()
    .withMessage("License number is required")
    .isLength({ max: 100 })
    .withMessage("License number must be less than 100 characters"),
  body("experience_years")
    .notEmpty()
    .withMessage("Experience years is required")
    .isInt({ min: 0, max: 70 })
    .withMessage("Experience years must be between 0 and 70"),
  body("hospital_name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Hospital name must be less than 150 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),
  body("availability_json")
    .optional()
    .isObject()
    .withMessage("Availability must be a valid JSON object"),
  handleValidationErrors,
];

export const validateDoctorUpdate = [
  param("id")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid doctor ID"),
  body("specialization")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Specialization must be less than 100 characters"),
  body("license_number")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("License number must be less than 100 characters"),
  body("experience_years")
    .optional()
    .isInt({ min: 0, max: 70 })
    .withMessage("Experience years must be between 0 and 70"),
  body("hospital_name")
    .optional()
    .trim()
    .isLength({ max: 150 })
    .withMessage("Hospital name must be less than 150 characters"),
  body("bio")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Bio must be less than 1000 characters"),
  body("availability_json")
    .optional()
    .isObject()
    .withMessage("Availability must be a valid JSON object"),
  handleValidationErrors,
];

/**
 * Appointment validations
 */
export const validateAppointment = [
  body("patient_id")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid patient ID"),
  body("doctor_id")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid doctor ID"),
  body("appointment_date")
    .notEmpty()
    .withMessage("Appointment date is required")
    .isISO8601()
    .withMessage("Invalid date format (use YYYY-MM-DD)")
    .custom((value) => {
      const appointmentDate = new Date(value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (appointmentDate < today) {
        throw new Error("Appointment date cannot be in the past");
      }
      return true;
    }),
  body("appointment_time")
    .notEmpty()
    .withMessage("Appointment time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage("Invalid time format (use HH:MM)"),
  handleValidationErrors,
];

export const validateAppointmentStatus = [
  param("appointment_id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid appointment ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["requested", "confirmed", "completed", "cancelled", "no_show"])
    .withMessage("Invalid status value"),
  handleValidationErrors,
];

/**
 * Emergency validations
 */
export const validateEmergency = [
  body("patient_id")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid patient ID"),
  body("emergency_type")
    .notEmpty()
    .withMessage("Emergency type is required")
    .isIn(["Doctor", "Blood", "Medicine"])
    .withMessage("Invalid emergency type"),
  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description must be less than 1000 characters"),
  body("latitude")
    .notEmpty()
    .withMessage("Latitude is required")
    .isFloat({ min: -90, max: 90 })
    .withMessage("Invalid latitude"),
  body("longitude")
    .notEmpty()
    .withMessage("Longitude is required")
    .isFloat({ min: -180, max: 180 })
    .withMessage("Invalid longitude"),
  handleValidationErrors,
];

export const validateEmergencyStatus = [
  param("id")
    .notEmpty()
    .withMessage("Emergency ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid emergency ID"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["pending", "accepted", "in_progress", "resolved", "expired"])
    .withMessage("Invalid status value"),
  handleValidationErrors,
];

export const validateEmergencyAccept = [
  param("emergency_id")
    .notEmpty()
    .withMessage("Emergency ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid emergency ID"),
  body("accepted_by")
    .notEmpty()
    .withMessage("Accepted by user ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid user ID"),
  handleValidationErrors,
];

/**
 * Payment validations
 */
export const validatePaymentInitiate = [
  body("appointment_id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid appointment ID"),
  body("amount")
    .notEmpty()
    .withMessage("Amount is required")
    .isFloat({ min: 0.01 })
    .withMessage("Amount must be greater than 0"),
  handleValidationErrors,
];

export const validatePaymentConfirm = [
  body("appointment_id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid appointment ID"),
  body("payment_id")
    .notEmpty()
    .withMessage("Payment ID is required")
    .trim()
    .isLength({ max: 100 })
    .withMessage("Payment ID must be less than 100 characters"),
  body("status")
    .notEmpty()
    .withMessage("Status is required")
    .isIn(["success", "failed", "pending"])
    .withMessage("Invalid payment status"),
  handleValidationErrors,
];

/**
 * Common param validations
 */
export const validateIdParam = [
  param("id")
    .notEmpty()
    .withMessage("ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid ID"),
  handleValidationErrors,
];

export const validatePatientIdParam = [
  param("patient_id")
    .notEmpty()
    .withMessage("Patient ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid patient ID"),
  handleValidationErrors,
];

export const validateDoctorIdParam = [
  param("doctor_id")
    .notEmpty()
    .withMessage("Doctor ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid doctor ID"),
  handleValidationErrors,
];

export const validateAppointmentIdParam = [
  param("appointment_id")
    .notEmpty()
    .withMessage("Appointment ID is required")
    .isInt({ min: 1 })
    .withMessage("Invalid appointment ID"),
  handleValidationErrors,
];
