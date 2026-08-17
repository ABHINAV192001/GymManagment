-- Migration V19: Add missing created_at column to food_log and water_log tables
ALTER TABLE IF EXISTS food_log ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
ALTER TABLE IF EXISTS water_log ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
