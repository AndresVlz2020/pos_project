CREATE TABLE IF NOT EXISTS restaurant_tables (
    id SERIAL PRIMARY KEY,
    table_number VARCHAR(50) UNIQUE NOT NULL,
    capacity INT DEFAULT 4,
    status VARCHAR(50) DEFAULT 'Disponible',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
