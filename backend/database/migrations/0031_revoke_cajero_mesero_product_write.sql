-- database/migrations/0031_revoke_cajero_mesero_product_write.sql
-- Asegura que Cajero y Mesero solo puedan listar productos (list_product),
-- revocando cualquier permiso de creación, edición o habilitación/inhabilitación de productos.

DELETE FROM group_permissions gp
USING groups g, permissions p
WHERE gp.group_id = g.group_id
  AND gp.permission_id = p.permission_id
  AND g.group_name IN ('Cajero', 'Mesero')
  AND p.permission_codename IN ('create_product', 'update_product', 'disable_product');

DELETE FROM user_permissions up
USING user_groups ug, groups g, permissions p
WHERE up.user_id = ug.user_id
  AND ug.group_id = g.group_id
  AND up.permission_id = p.permission_id
  AND g.group_name IN ('Cajero', 'Mesero')
  AND p.permission_codename IN ('create_product', 'update_product', 'disable_product');
