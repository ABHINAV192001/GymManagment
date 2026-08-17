-- 12. ADD org_id TO plans
-- The Plan entity (com.gymbross.usermanagement.entity.Plan) maps org_id as a
-- required column, but V9's plans-table alignment missed it. Added nullable
-- so any existing rows survive; plans are always created with an org going
-- forward (see PlanController/PlanServiceImpl).
ALTER TABLE plans ADD COLUMN org_id UUID REFERENCES organizations(id);
CREATE INDEX idx_plans_org ON plans(org_id);
