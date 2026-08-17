-- Add BOOKSPOT permission for ACTIVITY module
INSERT INTO permissions (
    id,
    module,
    sub_module,
    description,
    is_active,
    create_date
)
VALUES
(gen_random_uuid(), 'ACTIVITY', 'ACTIVITY:BOOKSPOT', 'BookSpot', true, CURRENT_TIMESTAMP)
ON CONFLICT (sub_module) DO NOTHING;
