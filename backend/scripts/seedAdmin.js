import bcrypt from "bcryptjs";
import { QueryTypes } from "sequelize";
import sequelize from "../database/database.js";

export async function seedAdminIfNotExists() {
  const DEFAULT_ADMIN = {
    full_name: process.env.ADMIN_NAME || "System Administrator",
    email: process.env.ADMIN_EMAIL || "admin@example.com",
    password: process.env.ADMIN_PASSWORD || "ChangeMe123!",
    phone: process.env.ADMIN_PHONE || "+977-9800000000",
  };

  const existingAdmin = await sequelize.query(
    `SELECT user_id FROM users WHERE role = 'Admin' LIMIT 1`,
    { type: QueryTypes.SELECT },
  );

  if (existingAdmin.length > 0) {
    console.log("ℹ️ Admin already exists. Skipping seed.");
    return;
  }

  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, 12);

  await sequelize.query(
    `
    INSERT INTO users (
      full_name, email, password_hash, phone, role, status, created_at
    )
    VALUES (
      :full_name, :email, :password_hash, :phone, 'Admin', 'approved', NOW()
    )
    `,
    {
      replacements: {
        full_name: DEFAULT_ADMIN.full_name,
        email: DEFAULT_ADMIN.email,
        password_hash: hashedPassword,
        phone: DEFAULT_ADMIN.phone,
      },
      type: QueryTypes.INSERT,
    },
  );

  console.log("✅ Admin user seeded successfully");
}