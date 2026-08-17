-- V34__create_workout_split_days_table.sql
-- Add missing columns and create workout_split_days table for GymUserManagement schema validation.

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='difficulty') THEN
        ALTER TABLE workouts ADD COLUMN difficulty VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='workouts' AND column_name='days_per_week') THEN
        ALTER TABLE workouts ADD COLUMN days_per_week INT DEFAULT 3;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='branches' AND column_name='default_pt_trainer_percentage') THEN
        ALTER TABLE branches ADD COLUMN default_pt_trainer_percentage NUMERIC(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='safety_tips') THEN
        ALTER TABLE exercises ADD COLUMN safety_tips TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='coaching_cues') THEN
        ALTER TABLE exercises ADD COLUMN coaching_cues TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='exercises' AND column_name='deleted_at') THEN
        ALTER TABLE exercises ADD COLUMN deleted_at TIMESTAMP WITHOUT TIME ZONE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='pt_trainer_percentage') THEN
        ALTER TABLE staff_profiles ADD COLUMN pt_trainer_percentage NUMERIC(5,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='salary') THEN
        ALTER TABLE staff_profiles ADD COLUMN salary NUMERIC(10,2);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='experience_years') THEN
        ALTER TABLE staff_profiles ADD COLUMN experience_years INT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='payment_status') THEN
        ALTER TABLE staff_profiles ADD COLUMN payment_status VARCHAR(255);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='staff_profiles' AND column_name='start_date') THEN
        ALTER TABLE staff_profiles ADD COLUMN start_date DATE;
    END IF;
END $$;

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
