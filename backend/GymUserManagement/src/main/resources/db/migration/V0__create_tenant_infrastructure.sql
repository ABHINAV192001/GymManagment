-- 1. TENANT INFRASTRUCTURE (Organizations & Branches)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='organizations') THEN
        CREATE TABLE organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_code VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            owner_email VARCHAR(255) NOT NULL,
            gst VARCHAR(255),
            pan VARCHAR(255),
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_deleted BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='branches') THEN
        CREATE TABLE branches (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            branch_code VARCHAR(255) NOT NULL UNIQUE,
            name VARCHAR(255) NOT NULL,
            admin_email VARCHAR(255) NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT true,
            is_deleted BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            deleted_at TIMESTAMPTZ
        );
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_branches_org_id ON branches(org_id);
