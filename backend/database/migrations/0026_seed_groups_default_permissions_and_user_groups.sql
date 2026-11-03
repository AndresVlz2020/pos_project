-- database/migrations/0026_seed_groups_default_permissions_and_user_groups.sql
-- Asignar permisos predefinidos a cada grupo del POS y vincular usuarios existentes a sus grupos y permisos iniciales

-- 1. Administrador: todos los permisos
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
CROSS JOIN permissions p
WHERE g.group_name = 'Administrador'
ON CONFLICT DO NOTHING;

-- 2. Cajero: productos (listar), órdenes (listar, crear, actualizar), inventario (listar, actualizar)
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
INNER JOIN permissions p
    ON p.permission_codename IN (
        'list_product',
        'list_order',
        'create_order',
        'update_order',
        'list_inventory',
        'update_inventory'
    )
WHERE g.group_name = 'Cajero'
ON CONFLICT DO NOTHING;

-- 3. Mesero: productos (listar), órdenes (listar, crear, actualizar)
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
INNER JOIN permissions p
    ON p.permission_codename IN (
        'list_product',
        'list_order',
        'create_order',
        'update_order'
    )
WHERE g.group_name = 'Mesero'
ON CONFLICT DO NOTHING;

-- 4. Cocina: productos (listar), órdenes (listar, actualizar)
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
INNER JOIN permissions p
    ON p.permission_codename IN (
        'list_product',
        'list_order',
        'update_order'
    )
WHERE g.group_name = 'Cocina'
ON CONFLICT DO NOTHING;

-- 5. Vincular usuarios existentes en la tabla users con su grupo correspondiente en user_groups
INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.group_id
FROM users u
INNER JOIN groups g ON g.group_name = 'Administrador'
WHERE u.is_superuser = TRUE OR LOWER(COALESCE(u.user_type, '')) IN ('admin', 'administrador')
ON CONFLICT DO NOTHING;

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.group_id
FROM users u
INNER JOIN groups g ON g.group_name = 'Cajero'
WHERE u.is_superuser = FALSE AND LOWER(COALESCE(u.user_type, '')) IN ('cajero', 'caja')
ON CONFLICT DO NOTHING;

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.group_id
FROM users u
INNER JOIN groups g ON g.group_name = 'Mesero'
WHERE u.is_superuser = FALSE AND LOWER(COALESCE(u.user_type, '')) IN ('mesero', 'salon', '')
ON CONFLICT DO NOTHING;

INSERT INTO user_groups (user_id, group_id)
SELECT u.id, g.group_id
FROM users u
INNER JOIN groups g ON g.group_name = 'Cocina'
WHERE u.is_superuser = FALSE AND LOWER(COALESCE(u.user_type, '')) IN ('cocina', 'cocinero', 'parrilla')
ON CONFLICT DO NOTHING;

-- 6. Sembrar permisos directos iniciales en user_permissions basados en el grupo de cada usuario
INSERT INTO user_permissions (user_id, permission_id)
SELECT ug.user_id, gp.permission_id
FROM user_groups ug
INNER JOIN group_permissions gp ON gp.group_id = ug.group_id
ON CONFLICT DO NOTHING;
