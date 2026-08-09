-- V15: Make user_id nullable in attendance_logs to support generic entity_id / entity_type mapping
ALTER TABLE attendance_logs ALTER COLUMN user_id DROP NOT NULL;
