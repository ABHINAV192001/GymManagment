-- Migration V18: Add missing created_at column to attendance_logs table for schema alignment
ALTER TABLE IF EXISTS attendance_logs ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now();
