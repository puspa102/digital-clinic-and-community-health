/**
 * CORS Configuration
 * Configures Cross-Origin Resource Sharing settings
 */

import dotenv from "dotenv";

dotenv.config();

// Allowed origins - add your frontend URLs here
const allowedOrigins = [
  "http://localhost:3000", // React dev server
  "http://localhost:5173", // Vite dev server
  "http://localhost:5174", // Vite dev server (alternate port)
  "http://localhost:8080", // Vue dev server
  "http://localhost:4200", // Angular dev server
  "http://127.0.0.1:3000",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:8080",
  "http://127.0.0.1:4200",
];

// Add production origins from environment variable
if (process.env.CORS_ORIGINS) {
  const envOrigins = process.env.CORS_ORIGINS.split(",").map((origin) =>
    origin.trim(),
  );
  allowedOrigins.push(...envOrigins);
}

/**
 * CORS options configuration
 */
export const corsOptions = {
  /**
   * Origin validation function
   * @param {string} origin - The request origin
   * @param {function} callback - Callback function
   */
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl, server-to-server, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === "development" || !process.env.NODE_ENV) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // In production, reject other origins
    return callback(new Error("Not allowed by CORS"));
  },

  // Allowed HTTP methods
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"],

  // Allowed headers
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "Accept",
    "Origin",
    "X-CSRF-Token",
    "Cache-Control",
    "Pragma",
  ],

  // Headers exposed to the client
  exposedHeaders: [
    "X-Total-Count",
    "X-Total-Pages",
    "X-Current-Page",
    "X-Per-Page",
    "RateLimit-Limit",
    "RateLimit-Remaining",
    "RateLimit-Reset",
  ],

  // Allow credentials (cookies, authorization headers)
  credentials: true,

  // Preflight cache duration (24 hours)
  maxAge: 86400,

  // Success status for legacy browser support
  optionsSuccessStatus: 200,

  // Handle preflight requests
  preflightContinue: false,
};

/**
 * Simple CORS options for public endpoints
 * Less restrictive for endpoints that don't require authentication
 */
export const publicCorsOptions = {
  origin: "*",
  methods: ["GET", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Accept"],
  maxAge: 86400,
  optionsSuccessStatus: 200,
};

export default corsOptions;
