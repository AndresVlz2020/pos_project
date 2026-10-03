-- Actualizar tabla users para soportar el flujo real del sistema POS
ALTER TABLE users ADD COLUMN IF NOT EXISTS pin VARCHAR(10);
ALTER TABLE users ADD COLUMN IF NOT EXISTS user_type VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS corporate_email VARCHAR(150);
ALTER TABLE users ADD COLUMN IF NOT EXISTS start_date DATE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS end_date DATE;
ALTER TABLE users ALTER COLUMN user_password DROP NOT NULL;
