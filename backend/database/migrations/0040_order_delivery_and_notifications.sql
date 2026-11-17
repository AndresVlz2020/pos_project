-- database/migrations/0040_order_delivery_and_notifications.sql
-- Agrega estado operativo "Entregada" (Mesero) en el ciclo de órdenes y
-- tabla persistente de notificaciones para avisar al Mesero cuando Cocina completa una orden.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP NULL;

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL DEFAULT 'order_completed',
  title VARCHAR(180) NOT NULL,
  message TEXT NOT NULL,
  order_id INT REFERENCES orders(id) ON DELETE CASCADE,
  order_number VARCHAR(50),
  table_number VARCHAR(50),
  target_role VARCHAR(50) NOT NULL DEFAULT 'Mesero',
  target_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_by_user_id INT REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_role_created
  ON notifications (target_role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_order_id
  ON notifications (order_id);

CREATE TABLE IF NOT EXISTS notification_reads (
  notification_id INT NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, user_id)
);
