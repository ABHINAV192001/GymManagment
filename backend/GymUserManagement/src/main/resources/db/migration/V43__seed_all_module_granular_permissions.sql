-- V43__seed_all_module_granular_permissions.sql
-- Seed comprehensive A-to-Z permissions for all 19 GymOS modules

INSERT INTO permissions (id, module, sub_module, description, is_active, create_date)
VALUES
-- 1. DASHBOARD
(gen_random_uuid(), 'DASHBOARD', 'DASHBOARD:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DASHBOARD', 'DASHBOARD:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 2. MEMBER_PORTAL
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'MEMBER_PORTAL', 'MEMBER_PORTAL:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 3. BRANCHES
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'BRANCHES', 'BRANCHES:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 4. USERS (Members Directory)
(gen_random_uuid(), 'USERS', 'USERS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'USERS', 'USERS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 5. STAFF (Staff & Payroll)
(gen_random_uuid(), 'STAFF', 'STAFF:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'STAFF:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'STAFF:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'STAFF:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'STAFF:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'STAFF', 'STAFF:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

-- 6. PLANS (Membership Plans)
(gen_random_uuid(), 'PLANS', 'PLANS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'PLANS', 'PLANS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 7. ACCOUNTS (Finance & Ledger)
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACCOUNTS', 'ACCOUNTS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 8. INVENTORY (Equipment Assets)
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'INVENTORY', 'INVENTORY:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 9. ACTIVITY (Group Classes)
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:BOOKSPOT', 'BookSpot', true, CURRENT_TIMESTAMP),

-- 10. WORKOUT (Workouts & Exercises)
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'WORKOUT', 'WORKOUT:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

-- 11. DIET (Diet & Nutrition)
(gen_random_uuid(), 'DIET', 'DIET:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'DIET', 'DIET:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

-- 12. ATTENDANCE (Entrance Desk)
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ATTENDANCE', 'ATTENDANCE:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 13. NOTIFICATIONS (Marketing Blasts)
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'NOTIFICATIONS', 'NOTIFICATIONS:SEND', 'Send', true, CURRENT_TIMESTAMP),

-- 14. CHAT (Client Chat Hub)
(gen_random_uuid(), 'CHAT', 'CHAT:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CHAT', 'CHAT:SEND', 'Send', true, CURRENT_TIMESTAMP),

-- 15. RBAC (RBAC Roles Matrix)
(gen_random_uuid(), 'RBAC', 'RBAC:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'RBAC', 'RBAC:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 16. SETTINGS (App Settings)
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'SETTINGS', 'SETTINGS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),

-- 17. CRM (Lead CRM)
(gen_random_uuid(), 'CRM', 'CRM:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CRM', 'CRM:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CRM', 'CRM:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CRM', 'CRM:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CRM', 'CRM:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'CRM', 'CRM:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

-- 18. ROSTER (Shift Roster)
(gen_random_uuid(), 'ROSTER', 'ROSTER:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ROSTER', 'ROSTER:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ROSTER', 'ROSTER:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ROSTER', 'ROSTER:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ROSTER', 'ROSTER:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'ROSTER', 'ROSTER:ASSIGN', 'Assign', true, CURRENT_TIMESTAMP),

-- 19. POS (POS Billing)
(gen_random_uuid(), 'POS', 'POS:VIEW', 'View', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:CREATE', 'Create', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:EDIT', 'Edit', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:DELETE', 'Delete', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:EXPORT', 'Export', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:CHECKOUT', 'Checkout', true, CURRENT_TIMESTAMP),
(gen_random_uuid(), 'POS', 'POS:REFUND', 'Refund', true, CURRENT_TIMESTAMP)

ON CONFLICT (sub_module) DO UPDATE SET is_active = true;
