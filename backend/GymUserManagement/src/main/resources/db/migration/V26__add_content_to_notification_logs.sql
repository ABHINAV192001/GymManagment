-- Migration V26: Add content and role column to notification_logs to track exact sent message

ALTER TABLE IF EXISTS notification_logs ADD COLUMN IF NOT EXISTS content TEXT;
ALTER TABLE IF EXISTS notification_logs ADD COLUMN IF NOT EXISTS target_role VARCHAR(100);
