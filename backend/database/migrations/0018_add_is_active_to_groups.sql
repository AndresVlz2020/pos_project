-- database/migrations/0018_add_is_active_to_groups.sql

ALTER TABLE groups
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
