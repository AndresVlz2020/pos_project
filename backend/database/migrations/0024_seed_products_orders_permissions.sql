-- database/migrations/0024_seed_products_orders_permissions.sql
-- Permisos para los Módulos Productos y Órdenes

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    (
        'Listar productos',
        'list_product',
        (SELECT content_type_id FROM content_type WHERE app_label = 'products' AND model = 'product')
    ),
    (
        'Crear productos',
        'create_product',
        (SELECT content_type_id FROM content_type WHERE app_label = 'products' AND model = 'product')
    ),
    (
        'Actualizar productos',
        'update_product',
        (SELECT content_type_id FROM content_type WHERE app_label = 'products' AND model = 'product')
    ),
    (
        'Deshabilitar productos',
        'disable_product',
        (SELECT content_type_id FROM content_type WHERE app_label = 'products' AND model = 'product')
    ),
    (
        'Listar órdenes',
        'list_order',
        (SELECT content_type_id FROM content_type WHERE app_label = 'orders' AND model = 'order')
    ),
    (
        'Crear órdenes',
        'create_order',
        (SELECT content_type_id FROM content_type WHERE app_label = 'orders' AND model = 'order')
    ),
    (
        'Actualizar órdenes',
        'update_order',
        (SELECT content_type_id FROM content_type WHERE app_label = 'orders' AND model = 'order')
    ),
    (
        'Cancelar órdenes',
        'cancel_order',
        (SELECT content_type_id FROM content_type WHERE app_label = 'orders' AND model = 'order')
    )
ON CONFLICT (permission_codename)
DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    content_type_id = EXCLUDED.content_type_id;
