-- database/migrations/0039_order_three_statuses.sql
-- Adopta el flujo operativo de 3 estados (+ Anulada):
--   * "Creada"     -> Orden registrada por Mesero/POS; mesa ocupada, lista en Cocina
--   * "Completada" -> Preparada por Cocina; mesa aún ocupada en espera de cobro por Cajero
--   * "Pagada"     -> Cobrada por Cajero/Admin; cierra la cuenta y libera la mesa
--   * "Anulada"    -> Orden cancelada; libera mesa y restaura stock

ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'Creada';

UPDATE orders
SET status = 'Creada'
WHERE LOWER(TRIM(COALESCE(status, ''))) IN ('no pagada', 'abierta', 'en preparación', 'en preparacion', 'pendiente', '');

UPDATE orders
SET status = 'Pagada'
WHERE LOWER(TRIM(COALESCE(status, ''))) IN ('pagada', 'cerrada');

UPDATE restaurant_tables t
SET status = CASE
  WHEN EXISTS (
    SELECT 1 FROM orders o
    WHERE (LOWER(TRIM(o.table_number)) = LOWER(TRIM(t.table_number)) OR TRIM(o.table_number) = CAST(t.id AS VARCHAR))
      AND LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('pagada', 'cerrada', 'anulada')
  ) THEN 'Ocupada'
  ELSE 'Disponible'
END;
