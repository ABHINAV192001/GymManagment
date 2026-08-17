-- 7. SEED PERMISSIONS
INSERT INTO permissions (
    id,
    module,
    sub_module,
    description,
    is_active,
    create_date
)
VALUES
(gen_random_uuid(), 'CHAT', 'CHAT:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:SEND', 'Send', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'DASHBOARD', 'DASHBOARD:VIEW', 'View', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'USERS', 'USERS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'BRANCHES', 'BRANCHES:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'INVENTORY', 'INVENTORY:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'PLANS', 'PLANS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'DIET', 'DIET:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'WORKOUT', 'WORKOUT:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:DELETE', 'Delete', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'RBAC', 'RBAC:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:DELETE', 'Delete', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'SETTINGS', 'SETTINGS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),

(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:SEND', 'Send', true, CURRENT_TIMESTAMP)
ON CONFLICT (sub_module) DO NOTHING;


UPDATE permissions
SET description = initcap(split_part(sub_module, ':', 2))
WHERE sub_module LIKE '%:%';
