-- database/migrations/0025_seed_inventory_suppliers_permissions.sql
-- Permisos para los Módulos Inventario y Proveedores

INSERT INTO permissions (permission_name, permission_codename, content_type_id)
VALUES
    (
        'Listar inventario',
        'list_inventory',
        (SELECT content_type_id FROM content_type WHERE app_label = 'inventory' AND model = 'inventory')
    ),
    (
        'Crear insumos',
        'create_inventory',
        (SELECT content_type_id FROM content_type WHERE app_label = 'inventory' AND model = 'inventory')
    ),
    (
        'Actualizar inventario',
        'update_inventory',
        (SELECT content_type_id FROM content_type WHERE app_label = 'inventory' AND model = 'inventory')
    ),
    (
        'Deshabilitar insumos',
        'disable_inventory',
        (SELECT content_type_id FROM content_type WHERE app_label = 'inventory' AND model = 'inventory')
    ),
    (
        'Listar proveedores',
        'list_supplier',
        (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers' AND model = 'supplier')
    ),
    (
        'Crear proveedores',
        'create_supplier',
        (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers' AND model = 'supplier')
    ),
    (
        'Actualizar proveedores',
        'update_supplier',
        (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers' AND model = 'supplier')
    ),
    (
        'Deshabilitar proveedores',
        'disable_supplier',
        (SELECT content_type_id FROM content_type WHERE app_label = 'suppliers' AND model = 'supplier')
    )
ON CONFLICT (permission_codename)
DO UPDATE SET
    permission_name = EXCLUDED.permission_name,
    content_type_id = EXCLUDED.content_type_id;
