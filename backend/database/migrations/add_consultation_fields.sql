-- Migration: Add consultation fields to appointments table
-- These columns support the doctor confirmation flow with consultation type, QR codes, etc.

-- Create the enum type first (if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE "enum_appointments_consultation_type" AS ENUM ('physical', 'online');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add consultation_type column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS consultation_type "enum_appointments_consultation_type";

-- Add scheduled_time column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS scheduled_time TIME;

-- Add doctor_notes column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS doctor_notes TEXT;

-- Add meeting_link column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS meeting_link VARCHAR(255);

-- Add qr_token column
ALTER TABLE appointments ADD COLUMN IF NOT EXISTS qr_token VARCHAR(255) UNIQUE;
