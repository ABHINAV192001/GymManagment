CREATE TABLE audit_logs (
    id UUID PRIMARY KEY,
    user_id UUID,
    org_id UUID,
    action_type VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);
