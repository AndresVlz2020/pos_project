-- database/migrations/0036_seed_extra_tables.sql
-- Amplía las mesas del restaurante de 10 a 20 (Mesas 11 a 20) de forma idempotente.

INSERT INTO restaurant_tables (table_number, capacity, status)
VALUES
    ('Mesa 11', 4, 'Disponible'),
    ('Mesa 12', 2, 'Disponible'),
    ('Mesa 13', 6, 'Disponible'),
    ('Mesa 14', 4, 'Disponible'),
    ('Mesa 15', 4, 'Disponible'),
    ('Mesa 16', 8, 'Disponible'),
    ('Mesa 17', 2, 'Disponible'),
    ('Mesa 18', 4, 'Disponible'),
    ('Mesa 19', 6, 'Disponible'),
    ('Mesa 20', 4, 'Disponible')
ON CONFLICT (table_number) DO NOTHING;
