/**
 * Environment Configuration
 * Centralized configuration management with validation
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config();

/**
 * Validate required environment variables
 */
const requiredEnvVars = ["JWT_SECRET", "JWT_REFRESH_SECRET"];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missing.length > 0 && process.env.NODE_ENV === "production") {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }

  if (missing.length > 0) {
    console.warn(
      `⚠️  Warning: Missing environment variables: ${missing.join(", ")}`
    );
    console.warn("   Using default values for development...");
  }
};

// Validate on import
validateEnv();

/**
 * Application Configuration
 */
const config = {
  // App settings
  app: {
    name: process.env.APP_NAME || "Digital Clinic API",
    env: process.env.NODE_ENV || "development",
    port: parseInt(process.env.PORT, 10) || 5000,
    host: process.env.HOST || "localhost",
    apiVersion: process.env.API_VERSION || "v1",
    isDev: (process.env.NODE_ENV || "development") === "development",
    isProd: process.env.NODE_ENV === "production",
  },

  // Database settings
  db: {
    name: process.env.DB_NAME || "postgres",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASS || "",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    dialect: "postgres",
    ssl: (process.env.DB_SSL || "").toLowerCase() === "true",
    sslRejectUnauthorized: process.env.DB_SSL_REJECT_UNAUTHORIZED !== "false",
    sslCa: process.env.DB_SSL_CA || undefined,
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 0,
      acquire: parseInt(process.env.DB_POOL_ACQUIRE, 10) || 30000,
      idle: parseInt(process.env.DB_POOL_IDLE, 10) || 10000,
    },
    logging: process.env.DB_LOGGING === "true" ? console.log : false,
  },

  // JWT settings
  jwt: {
    secret: process.env.JWT_SECRET || "dev-secret-change-in-production",
    refreshSecret:
      process.env.JWT_REFRESH_SECRET || "dev-refresh-secret-change-in-production",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    issuer: process.env.JWT_ISSUER || "digital-clinic-api",
    audience: process.env.JWT_AUDIENCE || "digital-clinic-app",
  },

  // CORS settings
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((o) => o.trim())
      : ["http://localhost:3000", "http://localhost:5173"],
    credentials: process.env.CORS_CREDENTIALS !== "false",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  },

  // Rate limiting settings
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  },

  // Cookie settings
  cookie: {
    secure: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
    httpOnly: process.env.COOKIE_HTTP_ONLY !== "false",
    sameSite: process.env.COOKIE_SAME_SITE || "strict",
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10) || 7 * 24 * 60 * 60 * 1000,
  },

  // OTP settings
  otp: {
    length: parseInt(process.env.OTP_LENGTH, 10) || 6,
    expiresInMinutes: parseInt(process.env.OTP_EXPIRES_IN_MINUTES, 10) || 5,
  },

  // Pagination defaults
  pagination: {
    defaultPage: 1,
    defaultLimit: parseInt(process.env.PAGINATION_DEFAULT_LIMIT, 10) || 10,
    maxLimit: parseInt(process.env.PAGINATION_MAX_LIMIT, 10) || 100,
  },

  // Logging settings
  logging: {
    level: process.env.LOG_LEVEL || "info",
    format: process.env.LOG_FORMAT || "combined",
  },

  // Redis settings (for future caching/session storage)
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB, 10) || 0,
    enabled: process.env.REDIS_ENABLED === "true",
  },

  // Email settings (for future email notifications)
  email: {
    host: process.env.EMAIL_HOST || "smtp.mailtrap.io",
    port: parseInt(process.env.EMAIL_PORT, 10) || 587,
    user: process.env.EMAIL_USER || "",
    password: process.env.EMAIL_PASSWORD || "",
    from: process.env.EMAIL_FROM || "noreply@digitalclinic.com",
    fromName: process.env.EMAIL_FROM_NAME || "Digital Clinic",
    enabled: process.env.EMAIL_ENABLED === "true",
  },

  // Payment gateway settings
  payment: {
    esewa: {
      merchantId: process.env.ESEWA_MERCHANT_ID || "",
      secretKey: process.env.ESEWA_SECRET_KEY || "",
      testMode: process.env.ESEWA_TEST_MODE !== "false",
      baseUrl: process.env.ESEWA_TEST_MODE !== "false"
        ? "https://uat.esewa.com.np"
        : "https://esewa.com.np",
    },
    khalti: {
      publicKey: process.env.KHALTI_PUBLIC_KEY || "",
      secretKey: process.env.KHALTI_SECRET_KEY || "",
      testMode: process.env.KHALTI_TEST_MODE !== "false",
    },
  },
};

/**
 * Get full database connection URL
 */
export const getDatabaseUrl = () => {
  const { user, password, host, port, name, ssl } = config.db;
  const sslParam = ssl ? "?sslmode=require" : "";
  return `postgres://${user}:${password}@${host}:${port}/${name}${sslParam}`;
};

/**
 * Get server URL
 */
export const getServerUrl = () => {
  const { host, port } = config.app;
  const protocol = config.app.isProd ? "https" : "http";
  return `${protocol}://${host}:${port}`;
};

export default config;
