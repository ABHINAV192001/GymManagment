-- Migration V20: Add missing created_at column to notification_templates, refresh_tokens, and staff_role_assignments
ALTER TABLE IF EXISTS notification_templates ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS refresh_tokens ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS staff_role_assignments ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
