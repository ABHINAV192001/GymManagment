-- Fix existing NULL values for is_active and is_deleted fields
-- Run this script manually on your PostgreSQL database

-- Update admins table
UPDATE admins 
SET is_active = false, is_deleted = false 
WHERE is_active IS NULL OR is_deleted IS NULL;

-- Update users table  
UPDATE users
SET is_active = false, is_deleted = false
WHERE is_active IS NULL OR is_deleted IS NULL;

-- Add NOT NULL constraints (optional, but recommended)
ALTER TABLE admins 
ALTER COLUMN is_active SET NOT NULL,
ALTER COLUMN is_active SET DEFAULT false,
ALTER COLUMN is_deleted SET NOT NULL,
ALTER COLUMN is_deleted SET DEFAULT false;

ALTER TABLE users
ALTER COLUMN is_active SET NOT NULL,
ALTER COLUMN is_active SET DEFAULT false,
ALTER COLUMN is_deleted SET NOT NULL,
ALTER COLUMN is_deleted SET DEFAULT false;
