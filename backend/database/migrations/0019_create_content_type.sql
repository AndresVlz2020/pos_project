-- database/migrations/0019_create_content_type.sql

CREATE TABLE IF NOT EXISTS content_type (
    content_type_id SERIAL PRIMARY KEY,
    app_label VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    display_name VARCHAR(100) NOT NULL DEFAULT '',

    CONSTRAINT uq_content_type
    UNIQUE (app_label, model)
);
