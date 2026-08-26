CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    order_id INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    payment_method VARCHAR(50) NOT NULL,
    amount_paid NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    tip NUMERIC(12, 2) DEFAULT 0.00,
    status VARCHAR(50) DEFAULT 'Completado',
    created_at TIMESTAMP DEFAULT NOW()
);
