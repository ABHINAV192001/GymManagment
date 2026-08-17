-- Migration V21: Add missing created_at column to role_permissions table for complete schema alignment
ALTER TABLE IF EXISTS role_permissions ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS otps ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS user_roles ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
