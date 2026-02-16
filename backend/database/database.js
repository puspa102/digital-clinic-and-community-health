import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

/**
 * Database configuration for PostgreSQL (Sequelize).
 *
 * Behavior:
 * - Uses environment variables, but provides sensible defaults for local development.
 * - Enables SSL if `DB_SSL` is "true" OR `DB_SSL_CA` is provided.
 * - If `DB_SSL_CA` is provided it will be used as the CA certificate (PEM string).
 *
 * Recommended environment variables:
 * - DB_NAME (default: "postgres")
 * - DB_USER (default: "postgres")
 * - DB_PASS (default: "")
 * - DB_HOST (default: "localhost")
 * - DB_PORT (default: 5432)
 * - DB_DIALECT (ignored; forced to "postgres" for this file)
 * - DB_SSL (set to "true" to enable SSL)
 * - DB_SSL_REJECT_UNAUTHORIZED ("false" to disable cert verification; defaults to "true")
 * - DB_SSL_CA (PEM contents for CA cert, optional)
 *
 * Notes:
 * - For production use, prefer injecting a CA via `DB_SSL_CA` or use a proper cert store.
 * - When DB_SSL_REJECT_UNAUTHORIZED is omitted or set to anything other than "false",
 *   certificate verification will be enabled.
 */

// Read values from env with defaults
const DB_NAME = process.env.DB_NAME || "postgres";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASS = process.env.DB_PASS ?? "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

// Force dialect to postgres for this configuration
const DIALECT = "postgres";

// SSL configuration
const DB_SSL =
  (process.env.DB_SSL || "").toLowerCase() === "true" ||
  Boolean(process.env.DB_SSL_CA);
const DB_SSL_REJECT_UNAUTHORIZED =
  process.env.DB_SSL_REJECT_UNAUTHORIZED === "false" ? false : true; // default true
const DB_SSL_CA = process.env.DB_SSL_CA || undefined; // PEM string, optional

// Build dialectOptions for Sequelize when SSL is required
const dialectOptions = {};
if (DB_SSL) {
  dialectOptions.ssl = {
    require: true,
    // When using node-postgres via Sequelize, rejectUnauthorized controls
    // whether the server certificate is validated. Default is true.
    rejectUnauthorized: DB_SSL_REJECT_UNAUTHORIZED,
  };

  if (DB_SSL_CA) {
    // Provide the CA as a string. Some environments pass the PEM content directly.
    // node-postgres accepts `ca` as string or Buffer in `ssl` option.
    dialectOptions.ssl.ca = DB_SSL_CA;
  }
}

// Final Sequelize initialization
const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: DIALECT,
  logging: false, // set to console.log for debugging
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
  dialectOptions: Object.keys(dialectOptions).length
    ? dialectOptions
    : undefined,
  // Keep timezone handling default (UTC). If you need a timezone, set process.env.DB_TIMEZONE
});

/**
 * connectDB - test connection and report status
 *
 * This function will attempt to authenticate with the configured Postgres server.
 * It logs a clear message on success and throws the underlying error on failure.
 */

export const connectDB = async () => {
  if (!process.env.DB_NAME || !process.env.DB_USER) {
    console.warn(
      "Warning: DB_NAME or DB_USER are not set. Using defaults which may not be appropriate for production.",
    );
  }

  try {
    await sequelize.authenticate();
    console.log(
      `Database connected: postgres://${DB_USER}@${DB_HOST}:${DB_PORT}/${DB_NAME} (ssl=${DB_SSL})`,
    );

    // 🔥 Sync models: create tables if they do not exist
    await sequelize.sync({ alter: false });
    console.log("All models were synchronized successfully");
  } catch (err) {
    console.error("Database connection failed:", err.message || err);
    throw err;
  }
};

export default sequelize;