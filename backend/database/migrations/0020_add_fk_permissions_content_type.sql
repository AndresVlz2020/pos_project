-- database/migrations/0020_add_fk_permissions_content_type.sql

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'fk_permissions_content_type'
    ) THEN
        ALTER TABLE permissions
        ADD CONSTRAINT fk_permissions_content_type
        FOREIGN KEY (content_type_id)
        REFERENCES content_type(content_type_id);
    END IF;
END $$;
