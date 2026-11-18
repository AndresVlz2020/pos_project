-- database/migrations/0041_product_recipes_and_inventory_movements.sql
-- Agrega modelo de recetas / escandallo (`producto_insumos`) para cálculo dinámico
-- de stock de platillos preparados y bitácora transaccional (`movimientos_inventario`).

CREATE TABLE IF NOT EXISTS producto_insumos (
  id SERIAL PRIMARY KEY,
  producto_id INT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  insumo_id INT NOT NULL REFERENCES inventory(id) ON DELETE RESTRICT,
  cantidad_requerida NUMERIC(10, 3) NOT NULL CHECK (cantidad_requerida > 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_producto_insumos_pair UNIQUE (producto_id, insumo_id)
);

CREATE INDEX IF NOT EXISTS idx_producto_insumos_producto
  ON producto_insumos (producto_id);

CREATE INDEX IF NOT EXISTS idx_producto_insumos_insumo
  ON producto_insumos (insumo_id);

CREATE TABLE IF NOT EXISTS movimientos_inventario (
  id SERIAL PRIMARY KEY,
  insumo_id INT NOT NULL REFERENCES inventory(id) ON DELETE CASCADE,
  orden_id INT REFERENCES orders(id) ON DELETE SET NULL,
  producto_id INT REFERENCES products(id) ON DELETE SET NULL,
  tipo_movimiento VARCHAR(40) NOT NULL,
  cantidad NUMERIC(12, 3) NOT NULL,
  stock_anterior NUMERIC(12, 3) NOT NULL,
  stock_nuevo NUMERIC(12, 3) NOT NULL,
  observacion TEXT,
  usuario_id INT REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_insumo_fecha
  ON movimientos_inventario (insumo_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_movimientos_inventario_orden
  ON movimientos_inventario (orden_id);
