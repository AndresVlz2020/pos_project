-- database/migrations/0042_app_settings_and_user_consent.sql
-- Agrega configuración global de la aplicación (correo de soporte editable por Admin)
-- y marca de aceptación de tratamiento de datos personales en usuarios.

CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by INT REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO app_settings (key, value)
VALUES ('support_email', 'soporte@dpiero.com')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS data_consent_accepted_at TIMESTAMPTZ NULL;

UPDATE users
SET data_consent_accepted_at = COALESCE(data_consent_accepted_at, created_at, NOW())
WHERE data_consent_accepted_at IS NULL;
