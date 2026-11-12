-- database/migrations/0030_seed_cajero_update_product.sql
-- Otorga al grupo Cajero el permiso de editar productos (update_product),
-- manteniendo restringido el permiso de habilitar/inhabilitar (disable_product).

-- 1. Al grupo completo
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename = 'update_product'
WHERE g.group_name = 'Cajero'
ON CONFLICT DO NOTHING;

-- 2. Copias directas para los usuarios Cajero ya vinculados a sus grupos
INSERT INTO user_permissions (user_id, permission_id)
SELECT ug.user_id, p.permission_id
FROM user_groups ug
JOIN groups g ON g.group_id = ug.group_id AND g.group_name = 'Cajero'
JOIN permissions p ON p.permission_codename = 'update_product'
ON CONFLICT DO NOTHING;
