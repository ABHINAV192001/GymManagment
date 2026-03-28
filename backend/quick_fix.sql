-- Quick fix: Set is_active = TRUE for all admins to allow login
-- Run this in your PostgreSQL database (pgAdmin or any SQL client)

UPDATE admins SET is_active = true WHERE is_active IS NULL;
UPDATE users SET is_active = true WHERE is_active IS NULL;

-- Verify the update
SELECT id, email, username, is_active FROM admins;
