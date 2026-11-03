-- database/migrations/0021_seed_content_type_modules.sql
-- Módulos del sistema POS D'Piero

INSERT INTO content_type (app_label, model, display_name)
VALUES
    ('users', 'user', 'Usuarios'),
    ('products', 'product', 'Productos'),
    ('orders', 'order', 'Órdenes'),
    ('inventory', 'inventory', 'Inventario'),
    ('suppliers', 'supplier', 'Proveedores')
ON CONFLICT (app_label, model)
DO UPDATE SET display_name = EXCLUDED.display_name;
