-- Migración 0037: Evitar registro duplicado de credenciales biométricas por dispositivo y llave pública

ALTER TABLE user_biometric_credentials
  ADD COLUMN IF NOT EXISTS device_instance_id VARCHAR(120) NULL;

-- Conservar únicamente el registro más antiguo si ya existiera una llave pública repetida
DELETE FROM user_biometric_credentials a
USING user_biometric_credentials b
WHERE a.public_key = b.public_key
  AND a.id > b.id;

CREATE UNIQUE INDEX IF NOT EXISTS idx_biometric_credentials_public_key_unique
  ON user_biometric_credentials(public_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_biometric_credentials_device_instance_unique
  ON user_biometric_credentials(device_instance_id)
  WHERE device_instance_id IS NOT NULL;
