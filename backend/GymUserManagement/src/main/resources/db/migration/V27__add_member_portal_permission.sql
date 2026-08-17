INSERT INTO permissions (
    id,
    module,
    sub_module,
    description,
    is_active,
    create_date
)
VALUES
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:DELETE', 'Delete', true, CURRENT_TIMESTAMP)
ON CONFLICT (sub_module) DO NOTHING;

-- Assign VIEW to any existing MEMBER, EMPLOYEE, STAF, USER roles
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE r.name IN ('MEMBER', 'EMPLOYEE', 'STAF', 'USER') AND p.sub_module = 'MEMBER_PORTAL:VIEW'
ON CONFLICT DO NOTHING;

