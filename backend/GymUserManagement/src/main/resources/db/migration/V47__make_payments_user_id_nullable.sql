-- V47: Make user_id nullable in payments table to support payments recorded without a specific user attached (e.g. POS sales, general accounts income)
ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL;
