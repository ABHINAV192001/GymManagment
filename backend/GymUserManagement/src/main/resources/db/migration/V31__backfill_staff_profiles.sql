-- V31: Backfill staff_profiles for existing trainer/staff users who are missing a profile row.
-- This ensures getAllStaff() returns them correctly.

-- Backfill: any user whose user_code starts with 'TRN-' or 'STF-' and has no staff_profiles row
INSERT INTO staff_profiles (user_id, org_id, is_personal_trainer)
SELECT
    u.id,
    u.org_id,
    CASE WHEN u.user_code LIKE 'TRN-%' THEN TRUE ELSE FALSE END
FROM users u
WHERE
    u.deleted_at IS NULL
    AND u.user_code IS NOT NULL
    AND (u.user_code LIKE 'STF-%' OR u.user_code LIKE 'TRN-%')
    AND NOT EXISTS (
        SELECT 1 FROM staff_profiles sp WHERE sp.user_id = u.id
    );

-- Add is_read and read_at columns to chat_messages if they don't exist yet
-- (these are added by the chat service which uses ddl-auto=none, so we don't manage them here)
