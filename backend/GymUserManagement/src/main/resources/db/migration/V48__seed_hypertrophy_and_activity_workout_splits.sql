-- V3__seed_hypertrophy_and_activity_workout_splits.sql
-- Create table for workout split days and seed all Top-Rated Hypertrophy & Activity Workout Splits into DB.

-- 1. Alter workouts table to support extra metadata fields
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='difficulty') THEN
        ALTER TABLE workouts ADD COLUMN difficulty VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='days_per_week') THEN
        ALTER TABLE workouts ADD COLUMN days_per_week INT DEFAULT 3;
    END IF;
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='workout_exercises' AND column_name='reps' AND data_type LIKE '%integer%'
    ) THEN
        ALTER TABLE workout_exercises ALTER COLUMN reps TYPE VARCHAR(50) USING reps::VARCHAR;
    END IF;
END $$;

-- 2. Create workout_split_days table for schedule & routine breakdown
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='workout_split_days') THEN
        CREATE TABLE workout_split_days (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
            day_label VARCHAR(50),
            name VARCHAR(255),
            description TEXT,
            display_order INT DEFAULT 1,
            created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
            deleted_at TIMESTAMP WITHOUT TIME ZONE
        );
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workout_split_days' AND column_name='deleted_at') THEN
        ALTER TABLE workout_split_days ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
END $$;

-- 3. Seed Workouts (Removed to prevent hardcoded presets)

-- 4. Seed Split Days (Removed to prevent hardcoded presets)

-- 4.5 Seed Prerequisite Exercises if not already present
INSERT INTO exercises (id, name, muscle_group, secondary_muscles, equipment, mechanics, difficulty_level, recommended_sets, recommended_reps, rest_interval, description, created_at)
VALUES
('e2400001-0000-0000-0000-000000000001', 'Barbell Incline Bench Press', 'CHEST', 'Triceps, Upper Deltoid', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Upper pectoral builder placing shoulder at 30-degree elevation.', NOW()),
('e2400001-0000-0000-0000-000000000005', 'Bent-Over Barbell Row', 'BACK', 'Biceps, Rear Deltoids, Core', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Fundamental thick back mass builder targeting lats and rhomboids.', NOW()),
('e2400001-0000-0000-0000-000000000009', 'Dumbbell Lateral Raise', 'SHOULDERS', 'Traps', 'Dumbbell', 'ISOLATION', 'BEGINNER', 4, '12-15', '60s', 'Side deltoid isolation constructing shoulder width and capping.', NOW()),
('e2400001-0000-0000-0000-000000000012', 'Romanian Deadlift (Barbell)', 'HAMSTRINGS', 'Glutes, Lower Back', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '90s', 'Hip hinge movement placing extreme eccentric stretch on hamstrings.', NOW()),
('e2400001-0000-0000-0000-000000000014', 'Bulgarian Split Squats', 'QUADS', 'Glutes, Hamstrings', 'Dumbbell', 'COMPOUND', 'INTERMEDIATE', 4, '10-12', '90s', 'Single-leg quad and glute builder improving unilateral balance.', NOW()),
('e1111111-0000-0000-0000-000000000006', 'High-Bar Barbell Back Squat', 'QUADS', 'Glutes, Hamstrings, Core', 'Barbell', 'COMPOUND', 'INTERMEDIATE', 4, '8-10', '120s', 'Compound leg movement driving knee flexion to maximize quad mass and leg drive.', NOW())
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Workout Exercises (Removed to prevent hardcoded presets)
