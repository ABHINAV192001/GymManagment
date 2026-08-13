-- Drop the number_of_owners column from the organizations table
ALTER TABLE organizations DROP COLUMN IF EXISTS number_of_owners;
