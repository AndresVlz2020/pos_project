-- Migración 0038: Permitir que un mismo dispositivo se registre en distintas cuentas,
-- bloqueando únicamente registros duplicados dentro de la misma cuenta.

DROP INDEX IF EXISTS idx_biometric_credentials_device_instance_unique;
DROP INDEX IF EXISTS idx_biometric_credentials_public_key_unique;

CREATE UNIQUE INDEX IF NOT EXISTS idx_biometric_credentials_user_public_key_unique
  ON user_biometric_credentials(user_id, public_key);

CREATE UNIQUE INDEX IF NOT EXISTS idx_biometric_credentials_user_device_unique
  ON user_biometric_credentials(user_id, device_instance_id)
  WHERE device_instance_id IS NOT NULL;
