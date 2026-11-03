-- database/migrations/0022_seed_pos_groups.sql
-- Grupos de usuarios propios del sistema POS (Administrador, Cajero, Mesero, Cocina)

INSERT INTO groups (group_name, is_active)
VALUES
    ('Administrador', TRUE),
    ('Cajero', TRUE),
    ('Mesero', TRUE),
    ('Cocina', TRUE)
ON CONFLICT (group_name) DO NOTHING;
