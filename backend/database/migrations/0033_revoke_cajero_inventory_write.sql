-- database/migrations/0033_revoke_cajero_inventory_write.sql
-- Revoca create_inventory, update_inventory y disable_inventory al grupo Cajero y a sus usuarios,
-- dejando a Cajero únicamente con list_inventory en el módulo de Inventario.

DELETE FROM group_permissions gp
USING groups g, permissions p
WHERE gp.group_id = g.group_id
  AND gp.permission_id = p.permission_id
  AND g.group_name = 'Cajero'
  AND p.permission_codename IN ('create_inventory', 'update_inventory', 'disable_inventory');

DELETE FROM user_permissions up
USING user_groups ug, groups g, permissions p
WHERE up.user_id = ug.user_id
  AND ug.group_id = g.group_id
  AND up.permission_id = p.permission_id
  AND g.group_name = 'Cajero'
  AND p.permission_codename IN ('create_inventory', 'update_inventory', 'disable_inventory');
