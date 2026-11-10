-- Migration V57: Seed granular permissions & role mapping for DUO_CHALLENGES module

INSERT INTO permissions (id, module, sub_module, description, is_active, create_date)
VALUES
(gen_random_uuid(), 'DUO_CHALLENGES', 'DUO_CHALLENGES:VIEW', 'View Gym Duo & Streaks Module', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DUO_CHALLENGES', 'DUO_CHALLENGES:CREATE', 'Create Gym Duo Challenges & WhatsApp Invites', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DUO_CHALLENGES', 'DUO_CHALLENGES:EDIT', 'Accept Invites & Settle Wager Prizes', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DUO_CHALLENGES', 'DUO_CHALLENGES:DELETE', 'Cancel or Delete Duo Partnerships & Challenges', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DUO_CHALLENGES', 'DUO_CHALLENGES:EXPORT', 'Export Gym Duo Streaks & Leaderboard Stats', true, CURRENT_TIMESTAMP)
ON CONFLICT (sub_module) DO UPDATE SET is_active = true;

-- Assign VIEW, CREATE, EDIT permissions to all active member & staff roles
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE p.sub_module IN ('DUO_CHALLENGES:VIEW', 'DUO_CHALLENGES:CREATE', 'DUO_CHALLENGES:EDIT')
  AND r.name IN ('MEMBER', 'USER', 'EMPLOYEE', 'STAF', 'TRAINER', 'STAFF', 'MANAGER', 'ORG_ADMIN', 'ADMIN')
ON CONFLICT DO NOTHING;

-- Assign DELETE & EXPORT permissions to administrative & management roles
INSERT INTO role_permissions (role_id, permission_id, created_at)
SELECT r.id, p.id, CURRENT_TIMESTAMP
FROM roles r
CROSS JOIN permissions p
WHERE p.sub_module IN ('DUO_CHALLENGES:DELETE', 'DUO_CHALLENGES:EXPORT')
  AND r.name IN ('MANAGER', 'ORG_ADMIN', 'ADMIN')
ON CONFLICT DO NOTHING;
