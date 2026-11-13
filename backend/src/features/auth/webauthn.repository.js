// backend/src/features/auth/webauthn.repository.js
// Acceso a PostgreSQL para credenciales WebAuthn y retos efímeros

import { pool } from "../../config/db.js";

export const webauthnRepository = {
  async listByUserId(userId) {
    const query = `
      SELECT
        id,
        user_id,
        credential_id,
        public_key,
        counter,
        transports,
        device_type,
        backed_up,
        device_label,
        created_at,
        last_used_at
      FROM user_biometric_credentials
      WHERE user_id = $1
      ORDER BY created_at DESC, id DESC;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows;
  },

  async countByUserId(userId) {
    const result = await pool.query(
      `SELECT COUNT(*)::int AS total FROM user_biometric_credentials WHERE user_id = $1`,
      [userId]
    );
    return Number(result.rows[0]?.total || 0);
  },

  async findByCredentialIdAndUserId(credentialId, userId) {
    const query = `
      SELECT
        id,
        user_id,
        credential_id,
        public_key,
        counter,
        transports,
        device_type,
        backed_up,
        device_label
      FROM user_biometric_credentials
      WHERE credential_id = $1 AND user_id = $2
      LIMIT 1;
    `;
    const result = await pool.query(query, [credentialId, userId]);
    return result.rows[0];
  },

  async createCredential({
    userId,
    credentialId,
    publicKey,
    counter = 0,
    transports = [],
    deviceType = "singleDevice",
    backedUp = false,
    deviceLabel = "Dispositivo biométrico",
  }) {
    const query = `
      INSERT INTO user_biometric_credentials (
        user_id,
        credential_id,
        public_key,
        counter,
        transports,
        device_type,
        backed_up,
        device_label
      )
      VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)
      RETURNING
        id,
        user_id,
        credential_id,
        counter,
        transports,
        device_type,
        backed_up,
        device_label,
        created_at,
        last_used_at;
    `;
    const result = await pool.query(query, [
      userId,
      credentialId,
      Buffer.from(publicKey),
      Number(counter) || 0,
      JSON.stringify(Array.isArray(transports) ? transports : []),
      deviceType || "singleDevice",
      Boolean(backedUp),
      String(deviceLabel || "Dispositivo biométrico").trim().slice(0, 120),
    ]);
    return result.rows[0];
  },

  async updateCredentialCounter(credentialRowId, newCounter) {
    await pool.query(
      `UPDATE user_biometric_credentials SET counter = $1, last_used_at = NOW() WHERE id = $2`,
      [Number(newCounter) || 0, credentialRowId]
    );
  },

  async deleteByIdAndUserId(id, userId) {
    const result = await pool.query(
      `DELETE FROM user_biometric_credentials WHERE id = $1 AND user_id = $2 RETURNING id, credential_id, device_label`,
      [id, userId]
    );
    return result.rows[0];
  },

  async saveChallenge({ challenge, userId = null, purpose, rpId, origin, ttlSeconds = 300 }) {
    // Limpiar retos expirados ocasionalmente y persistir el reto efímero
    await pool.query(`DELETE FROM webauthn_challenges WHERE expires_at < NOW() - INTERVAL '1 hour'`);
    const query = `
      INSERT INTO webauthn_challenges (challenge, user_id, purpose, rp_id, origin, expires_at)
      VALUES ($1, $2, $3, $4, $5, NOW() + ($6 * INTERVAL '1 second'))
      RETURNING id, challenge, user_id, purpose, rp_id, origin, expires_at;
    `;
    const result = await pool.query(query, [
      challenge,
      userId,
      purpose,
      rpId,
      origin,
      Number(ttlSeconds) || 300,
    ]);
    return result.rows[0];
  },

  async consumeChallenge({ challenge, purpose, userId = null }) {
    const query = `
      UPDATE webauthn_challenges
      SET used = TRUE
      WHERE challenge = $1
        AND purpose = $2
        AND used = FALSE
        AND expires_at > NOW()
        AND ($3::int IS NULL OR user_id IS NULL OR user_id = $3)
      RETURNING id, challenge, user_id, purpose, rp_id, origin, expires_at;
    `;
    const result = await pool.query(query, [challenge, purpose, userId]);
    return result.rows[0];
  },
};
