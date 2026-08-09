-- V28: Enhance payments and expenses tables for financial ledger support

ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS payment_type VARCHAR(255);
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS reference_no VARCHAR(255);
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE IF EXISTS payments ADD COLUMN IF NOT EXISTS staff_id UUID;
