-- 10. DROP LEGACY USER-TYPE TABLES
-- The identity model is unified: everyone is a row in `users`, and their kind
-- (admin/staff/trainer/member/premium) is expressed through RBAC
-- (user_roles -> roles -> role_permissions -> permissions). The legacy
-- Admin/Staff/Trainer/Member/PremiumUser entities were deleted from
-- GymCommonServices, so their tables (created empty by V8 to satisfy
-- schema validation) are dropped again.
-- Order matters: members references staffs, premium_users references trainers.

DROP TABLE IF EXISTS members;
DROP TABLE IF EXISTS premium_users;
DROP TABLE IF EXISTS staffs;
DROP TABLE IF EXISTS trainers;
DROP TABLE IF EXISTS admins;
