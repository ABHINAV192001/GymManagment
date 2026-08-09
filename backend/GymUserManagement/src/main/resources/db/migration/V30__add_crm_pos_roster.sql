-- V30__add_crm_pos_roster.sql

CREATE TABLE leads (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW',
    notes TEXT,
    org_id UUID,
    branch_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE staff_shifts (
    id UUID PRIMARY KEY,
    staff_id UUID NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    task_description TEXT,
    org_id UUID,
    branch_id UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE inventory ADD COLUMN price DECIMAL(10, 2);
