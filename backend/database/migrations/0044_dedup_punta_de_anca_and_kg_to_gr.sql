-- Elimina productos duplicados de "Punta de Anca" conservando el registro canónico
-- y convierte todas las unidades de medida de inventario de 'kg' a 'gr'.

DO $$
DECLARE
  canonical_id INT;
  dup_record RECORD;
BEGIN
  SELECT id INTO canonical_id
  FROM products
  WHERE LOWER(name) LIKE '%punta de anca%'
  ORDER BY
    CASE WHEN LOWER(TRIM(name)) = 'punta de anca angus 400g' THEN 0 ELSE 1 END,
    id ASC
  LIMIT 1;

  IF canonical_id IS NOT NULL THEN
    FOR dup_record IN
      SELECT id
      FROM products
      WHERE LOWER(name) LIKE '%punta de anca%'
        AND id <> canonical_id
      ORDER BY id ASC
    LOOP
      UPDATE order_items
      SET product_id = canonical_id
      WHERE product_id = dup_record.id;

      UPDATE movimientos_inventario
      SET producto_id = canonical_id
      WHERE producto_id = dup_record.id;

      INSERT INTO producto_insumos (producto_id, insumo_id, cantidad_requerida)
      SELECT canonical_id, insumo_id, cantidad_requerida
      FROM producto_insumos
      WHERE producto_id = dup_record.id
      ON CONFLICT (producto_id, insumo_id) DO NOTHING;

      DELETE FROM producto_insumos
      WHERE producto_id = dup_record.id;

      DELETE FROM products
      WHERE id = dup_record.id;
    END LOOP;
  END IF;
END $$;

-- Ajusta recetas y movimientos históricos que dependían de insumos en 'kg' antes de pasar a 'gr'
UPDATE producto_insumos pi
SET cantidad_requerida = pi.cantidad_requerida * 1000,
    updated_at = NOW()
FROM inventory i
WHERE pi.insumo_id = i.id
  AND LOWER(TRIM(i.unit_measure)) = 'kg';

UPDATE movimientos_inventario m
SET cantidad = m.cantidad * 1000,
    stock_anterior = m.stock_anterior * 1000,
    stock_nuevo = m.stock_nuevo * 1000
FROM inventory i
WHERE m.insumo_id = i.id
  AND LOWER(TRIM(i.unit_measure)) = 'kg';

-- Convierte insumos de 'kg' a 'gr'
UPDATE inventory
SET unit_measure = 'gr',
    current_stock = current_stock * 1000,
    min_stock = min_stock * 1000,
    max_stock = max_stock * 1000,
    item_name = REGEXP_REPLACE(item_name, '\(kg\)', '(gr)', 'gi')
WHERE LOWER(TRIM(unit_measure)) = 'kg';
