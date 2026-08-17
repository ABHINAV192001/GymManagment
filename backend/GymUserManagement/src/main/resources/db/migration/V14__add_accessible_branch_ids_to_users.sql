-- Migration V14: Add accessible_branch_ids JSONB column to users table
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS accessible_branch_ids jsonb DEFAULT '[]'::jsonb;
