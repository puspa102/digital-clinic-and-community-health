import rateLimit from "express-rate-limit";

/**
 * General API rate limiter
 * Limits each IP to 500 requests per 15 minutes (dev-friendly)
 * Skips chat routes as they use WebSocket for real-time updates
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per windowMs
  message: {
    success: false,
    message: "Too many requests, please try again later.",
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => req.path.startsWith("/chat"), // Skip chat routes
});

/**
 * Strict rate limiter for authentication endpoints
 * Limits each IP to 20 requests per 15 minutes
 * Helps prevent brute force attacks
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Too many authentication attempts, please try again after 15 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Only count failed attempts
});

/**
 * Refresh token rate limiter
 * More lenient than auth limiter since refresh is automatic
 * Limits each IP to 50 requests per 5 minutes
 */
export const refreshTokenLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: {
    success: false,
    message: "Too many token refresh attempts, please try again after 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * OTP verification rate limiter
 * Limits each IP to 3 OTP verification attempts per 5 minutes
 */
export const otpLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Limit each IP to 3 requests per windowMs
  message: {
    success: false,
    message: "Too many OTP verification attempts, please try again after 5 minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Payment endpoint rate limiter
 * Limits each IP to 10 payment requests per hour
 */
export const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: "Too many payment requests, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Emergency endpoint rate limiter
 * More lenient for genuine emergencies but still protects against abuse
 * Limits each IP to 5 emergency requests per 10 minutes
 */
export const emergencyLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: {
    success: false,
    message: "Too many emergency requests, please try again shortly.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default {
  apiLimiter,
  authLimiter,
  refreshTokenLimiter,
  otpLimiter,
  paymentLimiter,
  emergencyLimiter,
};