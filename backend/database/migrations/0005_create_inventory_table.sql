CREATE TABLE IF NOT EXISTS inventory (
    id SERIAL PRIMARY KEY,
    item_name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    current_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    min_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    max_stock NUMERIC(10, 2) NOT NULL DEFAULT 0,
    unit_measure VARCHAR(50) NOT NULL,
    supplier_id INT REFERENCES suppliers(id) ON DELETE SET NULL,
    last_updated TIMESTAMP DEFAULT NOW(),
    created_at TIMESTAMP DEFAULT NOW()
);
