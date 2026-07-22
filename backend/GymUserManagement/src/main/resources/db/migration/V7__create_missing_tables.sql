-- 7. MISSING TABLES: Notification, Recipe, RefreshToken, StaffRoleAssignment
-- These tables are required by JPA entities in GymUserManagement but were not
-- included in the initial migration set.

CREATE TABLE refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(512) NOT NULL UNIQUE,
    user_email VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMPTZ NOT NULL
);
CREATE INDEX idx_refresh_tokens_email ON refresh_tokens(user_email);

CREATE TABLE notification_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    channel VARCHAR(50) NOT NULL, -- 'WHATSAPP', 'EMAIL', 'BOTH'
    is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE notification_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID REFERENCES notification_templates(id) ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    channel VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL, -- 'SENT', 'FAILED'
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_notification_logs_template ON notification_logs(template_id);

CREATE TABLE staff_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    UNIQUE (staff_id, role_id)
);
CREATE INDEX idx_staff_role_staff ON staff_role_assignments(staff_id);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    key_ingredients TEXT,
    food_added TEXT,
    protein DOUBLE PRECISION,
    carbohydrates DOUBLE PRECISION,
    fiber DOUBLE PRECISION,
    sugar DOUBLE PRECISION,
    fat DOUBLE PRECISION,
    saturated_fat DOUBLE PRECISION,
    mono_unsaturated_fat DOUBLE PRECISION,
    poly_unsaturated_fat DOUBLE PRECISION,
    calcium DOUBLE PRECISION,
    iron DOUBLE PRECISION,
    cholesterol DOUBLE PRECISION,
    sodium DOUBLE PRECISION,
    cooking_time INTEGER,
    calories DOUBLE PRECISION,
    keto_friendly BOOLEAN,
    vegan_options BOOLEAN,
    gluten_free BOOLEAN,
    low_cholesterol BOOLEAN,
    high_cholesterol BOOLEAN,
    high_sodium BOOLEAN,
    low_sodium BOOLEAN,
    high_fiber BOOLEAN
);
