-- database/migrations/0029_order_two_statuses_and_payment_method.sql
-- Reduce el ciclo de vida de la orden a estados finales simples:
--   * "No Pagada" -> la mesa permanece ocupada
--   * "Pagada"    -> la mesa queda libre
--   * "Anulada"   -> la mesa queda libre (estado de cancelación)
-- Además registra el método de pago de la factura en la propia orden.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'No Pagada';

-- Normalización del histórico: todo lo que no esté explícitamente Pagada pasa a No Pagada
UPDATE orders SET status = 'Pagada' WHERE LOWER(TRIM(status)) = 'pagada';
UPDATE orders SET status = 'No Pagada' WHERE LOWER(TRIM(status)) <> 'pagada';
