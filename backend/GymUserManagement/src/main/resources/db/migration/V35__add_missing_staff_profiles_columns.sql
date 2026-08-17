-- V35__add_missing_staff_profiles_columns.sql
-- Add missing columns to staff_profiles for JPA Hibernate schema validation

DO $$
BEGIN
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
