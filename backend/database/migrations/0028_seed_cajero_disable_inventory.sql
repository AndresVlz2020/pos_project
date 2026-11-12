-- database/migrations/0028_seed_cajero_disable_inventory.sql
-- Otorga al grupo Cajero el permiso de deshabilitar insumos de inventario,
-- completando su área de gestión (ya listaba y actualizaba inventario).
-- Aplicado a todos los usuarios Cajero existentes y a las copias directas
-- en user_permissions para que el acceso por rol y el directo coincidan.

-- 1. Al grupo completo
INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename = 'disable_inventory'
WHERE g.group_name = 'Cajero'
ON CONFLICT DO NOTHING;

-- 2. Copias directas para los usuarios Cajero ya vinculados a sus grupos
INSERT INTO user_permissions (user_id, permission_id)
SELECT ug.user_id, p.permission_id
FROM user_groups ug
JOIN groups g ON g.group_id = ug.group_id AND g.group_name = 'Cajero'
JOIN permissions p ON p.permission_codename = 'disable_inventory'
ON CONFLICT DO NOTHING;
