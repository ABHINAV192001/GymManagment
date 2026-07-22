-- 2. UNIFIED IDENTITY & PROFILES
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    email VARCHAR(255),
    username VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(255),
    user_code VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(255),
    dob DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_email_verified BOOLEAN NOT NULL DEFAULT false,
    is_phone_verified BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    deleted_at TIMESTAMPTZ,
    UNIQUE (org_id, username),
    UNIQUE (org_id, user_code)
);
CREATE INDEX idx_users_org_branch ON users(org_id, branch_id);
CREATE INDEX idx_users_auth ON users(username, email);

CREATE TABLE staff_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_personal_trainer BOOLEAN NOT NULL DEFAULT false,
    salary NUMERIC(38,2),
    experience_years INTEGER,
    shift_timings JSONB DEFAULT '[]'::jsonb,
    payment_status VARCHAR(255),
    start_date DATE
);
CREATE INDEX idx_staff_manager ON staff_profiles(manager_id);

CREATE TABLE member_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES users(id) ON DELETE SET NULL,
    plan_id UUID,
    height_cm NUMERIC(10,2),
    weight_kg NUMERIC(10,2),
    fitness_goal VARCHAR(255),
    activity_level VARCHAR(255),
    membership_start_date DATE,
    membership_end_date DATE,
    metadata JSONB DEFAULT '{}'::jsonb
);
CREATE INDEX idx_member_trainer ON member_profiles(trainer_id);
