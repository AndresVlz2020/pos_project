-- database/migrations/0032_seed_cajero_create_inventory.sql
-- Otorga al grupo Cajero el permiso create_inventory (completando create, update y disable en inventario).

INSERT INTO group_permissions (group_id, permission_id)
SELECT g.group_id, p.permission_id
FROM groups g
JOIN permissions p ON p.permission_codename = 'create_inventory'
WHERE g.group_name = 'Cajero'
ON CONFLICT DO NOTHING;

INSERT INTO user_permissions (user_id, permission_id)
SELECT ug.user_id, p.permission_id
FROM user_groups ug
JOIN groups g ON g.group_id = ug.group_id AND g.group_name = 'Cajero'
JOIN permissions p ON p.permission_codename = 'create_inventory'
ON CONFLICT DO NOTHING;
