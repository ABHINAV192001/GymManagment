-- Migration V13: Add org_id to staff_profiles for direct organization-level identification
ALTER TABLE staff_profiles 
ADD COLUMN IF NOT EXISTS org_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_staff_profiles_org ON staff_profiles(org_id);
