-- 4. CORE OPERATIONS (Attendance, Chat, Finance)
CREATE TABLE attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out_time TIMESTAMPTZ,
    method VARCHAR(255),
    status VARCHAR(255) NOT NULL
);

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT,
    is_read BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    plan_type VARCHAR(255),
    duration_days INTEGER NOT NULL,
    price NUMERIC(38,2) NOT NULL,
    max_members INTEGER,
    is_active BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE member_profiles ADD CONSTRAINT fk_member_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE SET NULL;

CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES plans(id) ON DELETE SET NULL,
    amount NUMERIC(38,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(255),
    status VARCHAR(255) NOT NULL
);

CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID REFERENCES branches(id) ON DELETE CASCADE,
    recorded_by UUID REFERENCES users(id) ON DELETE SET NULL,
    category VARCHAR(255) NOT NULL,
    description VARCHAR(255),
    amount NUMERIC(38,2) NOT NULL,
    expense_date DATE NOT NULL
);

CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(255),
    condition VARCHAR(255),
    quantity INTEGER NOT NULL,
    purchase_date TIMESTAMPTZ
);
