/**
 * Seed Admin User Script
 *
 * This script creates a default admin user for the Digital Clinic application.
 * Run it once after setting up the database.
 *
 * Usage:
 *   node scripts/seedAdmin.js
 *
 * Or add to package.json scripts:
 *   "seed:admin": "node scripts/seedAdmin.js"
 */

import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import { Sequelize } from "sequelize";

// Load environment variables
dotenv.config();

// Database configuration (same as database.js)
const DB_NAME = process.env.DB_NAME || "postgres";
const DB_USER = process.env.DB_USER || "postgres";
const DB_PASS = process.env.DB_PASS ?? "";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_PORT = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432;

// Default admin credentials - CHANGE THESE IN PRODUCTION!
const DEFAULT_ADMIN = {
  full_name: process.env.ADMIN_NAME || "System Administrator",
  email: process.env.ADMIN_EMAIL || "puspakhadka123@gmail.com",
  password: process.env.ADMIN_PASSWORD || "Puspa123@",
  phone: process.env.ADMIN_PHONE || "+977-9800000000",
};

const sequelize = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: DB_HOST,
  port: DB_PORT,
  dialect: "postgres",
  logging: false,
});

async function seedAdmin() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    // Check if admin already exists
    const [existingAdmin] = await sequelize.query(
      `SELECT user_id, email, role FROM users WHERE email = :email OR role = 'Admin' LIMIT 1`,
      {
        replacements: { email: DEFAULT_ADMIN.email },
        type: Sequelize.QueryTypes.SELECT,
      }
    );

    if (existingAdmin) {
      console.log("ℹ️  Admin user already exists:");
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   User ID: ${existingAdmin.user_id}`);
      console.log("\n⚠️  No changes made. If you need to reset the admin password, do it manually in the database.");
      process.exit(0);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

    // Insert admin user
    const [result] = await sequelize.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, status, created_at)
       VALUES (:full_name, :email, :password_hash, :phone, 'Admin', 'approved', NOW())
       RETURNING user_id, email, role, status`,
      {
        replacements: {
          full_name: DEFAULT_ADMIN.full_name,
          email: DEFAULT_ADMIN.email,
          password_hash: hashedPassword,
          phone: DEFAULT_ADMIN.phone,
        },
        type: Sequelize.QueryTypes.INSERT,
      }
    );

    console.log("\n✅ Admin user created successfully!");
    console.log("========================================");
    console.log("   Admin Credentials:");
    console.log("========================================");
    console.log(`   Email:    ${DEFAULT_ADMIN.email}`);
    console.log(`   Password: ${DEFAULT_ADMIN.password}`);
    console.log("========================================");
    console.log("\n⚠️  IMPORTANT: Change the password after first login!");
    console.log("⚠️  For production, set these environment variables:");
    console.log("   - ADMIN_EMAIL");
    console.log("   - ADMIN_PASSWORD");
    console.log("   - ADMIN_NAME");
    console.log("   - ADMIN_PHONE\n");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding admin:", error.message);

    if (error.message.includes("relation \"users\" does not exist")) {
      console.log("\n💡 Hint: The users table doesn't exist yet.");
      console.log("   Start the backend server first to create tables:");
      console.log("   npm run dev\n");
    }

    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the seed function
seedAdmin();
