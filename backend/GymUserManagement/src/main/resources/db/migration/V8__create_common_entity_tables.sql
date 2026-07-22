-- 8. COMMON-SERVICE ENTITY TABLES
-- GymUserManagement now scans com.Gym.GymCommonServices.entity (needed because
-- FoodLog and others reference Food/User/etc. from the shared module), so every
-- @Entity in that package must have a backing table for ddl-auto=validate.
-- These tables back the shared entities that had no table yet: RevokedToken,
-- FitnessSession, SessionVote, Notification, FoodCal, Admin, Staff, Trainer,
-- Member, PremiumUser.

CREATE TABLE revoked_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    jti VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL
);

CREATE TABLE fitness_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_type VARCHAR(255) NOT NULL,
    branch_ids VARCHAR(255) NOT NULL,
    session_time VARCHAR(255) NOT NULL,
    session_period VARCHAR(255) NOT NULL,
    description TEXT,
    remarks TEXT,
    recipient_roles VARCHAR(255) NOT NULL,
    poll_enabled BOOLEAN,
    in_count INTEGER,
    out_count INTEGER,
    session_date DATE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE session_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL,
    username VARCHAR(255) NOT NULL,
    vote_type VARCHAR(20) NOT NULL, -- 'IN' or 'OUT'
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE (session_id, username)
);

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_username VARCHAR(255) NOT NULL,
    sender_username VARCHAR(255),
    content VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'INFO', 'SESSION', 'MESSAGE', 'PAYMENT'
    is_read BOOLEAN NOT NULL DEFAULT false,
    action_link VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
CREATE INDEX idx_notifications_recipient ON notifications(recipient_username);

CREATE TABLE food_cal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    food_name VARCHAR(255),
    food_code VARCHAR(255) UNIQUE,
    protein DOUBLE PRECISION,
    carbohydrates DOUBLE PRECISION,
    fats DOUBLE PRECISION,
    calories DOUBLE PRECISION,
    fiber DOUBLE PRECISION,
    sodium DOUBLE PRECISION,
    sugar DOUBLE PRECISION,
    vitamins VARCHAR(255),
    minerals VARCHAR(255),
    calcium DOUBLE PRECISION,
    iron DOUBLE PRECISION,
    potassium DOUBLE PRECISION,
    water_hydration DOUBLE PRECISION,
    portion_size VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    branch_id UUID REFERENCES branches(id),
    admin_code VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255),
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    role VARCHAR(50),
    name VARCHAR(255),
    dob DATE,
    gender VARCHAR(50),
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE staffs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID REFERENCES organizations(id),
    branch_id UUID REFERENCES branches(id),
    staff_code VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    role VARCHAR(50),
    salary NUMERIC(19, 2),
    start_date DATE,
    shift_timings VARCHAR(255),
    payment_status VARCHAR(50), -- 'Paid' or 'Pending'
    experience INTEGER,
    is_active BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    trainer_code VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    salary NUMERIC(19, 2),
    start_date DATE,
    shift_timings VARCHAR(255),
    experience INTEGER,
    payment_status VARCHAR(50),
    is_personal_trainer BOOLEAN,
    is_active BOOLEAN DEFAULT false,
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone_number VARCHAR(50) NOT NULL,
    plan_name VARCHAR(255),
    membership_end_date DATE,
    amount NUMERIC(19, 2),
    started_date DATE,
    shift_timings VARCHAR(255),
    is_personal_trainer BOOLEAN,
    has_personal_trainer BOOLEAN,
    trainer_id UUID REFERENCES staffs(id),
    role VARCHAR(50), -- 'USER' or 'PREMIUM_USER'
    diet TEXT,
    workout_plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

CREATE TABLE premium_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id),
    branch_id UUID NOT NULL REFERENCES branches(id),
    premium_code VARCHAR(255) NOT NULL UNIQUE,
    username VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    password_hash VARCHAR(255),
    start_date DATE,
    plan VARCHAR(255),
    trainer_id UUID REFERENCES trainers(id),
    is_email_verified BOOLEAN DEFAULT false,
    is_phone_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT false,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    failed_login_attempts INTEGER NOT NULL DEFAULT 0,
    locked_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);
