-- Add missing columns to workouts table expected by Workout entity
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS created_by_user_id UUID;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS days_per_week INTEGER;
ALTER TABLE workouts ADD COLUMN IF NOT EXISTS target_days VARCHAR(255);
