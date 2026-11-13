import { pool } from "../../config/db.js";

const USER_AUTH_SELECT = `
  SELECT
    u.id,
    u.user_name,
    u.user_email,
    u.corporate_email,
    COALESCE(u.user_password, '') AS password,
    u.pin,
    u.user_type,
    u.is_active,
    u.is_staff,
    u.is_superuser,
    COALESCE(u.pin_failed_attempts, 0) AS pin_failed_attempts,
    u.pin_locked_until,
    CASE
      WHEN u.pin_locked_until IS NOT NULL AND u.pin_locked_until > NOW()
        THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (u.pin_locked_until - NOW()))))::int
      ELSE 0
    END AS pin_lock_remaining_seconds,
    EXISTS (
      SELECT 1
      FROM user_groups ug
      INNER JOIN groups g ON g.group_id = ug.group_id
      WHERE ug.user_id = u.id
        AND g.group_name = 'Administrador'
    ) AS is_admin_group
  FROM users u
`;

export const authRepository = {
  async findByEmail(userEmail) {
    const query = `
      ${USER_AUTH_SELECT}
      WHERE LOWER(TRIM(u.user_email)) = LOWER(TRIM($1))
         OR LOWER(TRIM(COALESCE(u.corporate_email, ''))) = LOWER(TRIM($1))
      LIMIT 1;
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows[0];
  },

  async findById(userId) {
    const query = `
      ${USER_AUTH_SELECT}
      WHERE u.id = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
  },

  async recordFailedPinAttempt(userId, maxAttempts = 5, lockSeconds = 60) {
    const query = `
      UPDATE users
      SET
        pin_failed_attempts = CASE
          WHEN pin_locked_until IS NOT NULL AND pin_locked_until <= NOW() THEN 1
          ELSE COALESCE(pin_failed_attempts, 0) + 1
        END,
        pin_locked_until = CASE
          WHEN (
            CASE
              WHEN pin_locked_until IS NOT NULL AND pin_locked_until <= NOW() THEN 1
              ELSE COALESCE(pin_failed_attempts, 0) + 1
            END
          ) >= $2 THEN NOW() + ($3 * INTERVAL '1 second')
          ELSE NULL
        END
      WHERE id = $1
      RETURNING
        pin_failed_attempts,
        pin_locked_until,
        CASE
          WHEN pin_locked_until IS NOT NULL AND pin_locked_until > NOW()
            THEN GREATEST(1, CEIL(EXTRACT(EPOCH FROM (pin_locked_until - NOW()))))::int
          ELSE 0
        END AS pin_lock_remaining_seconds;
    `;
    const result = await pool.query(query, [userId, maxAttempts, lockSeconds]);
    return result.rows[0];
  },

  async resetPinAttempts(userId) {
    await pool.query(
      `UPDATE users SET pin_failed_attempts = 0, pin_locked_until = NULL WHERE id = $1`,
      [userId]
    );
  },

  async updatePassword(userId, hashedPassword) {
    const query = `
      UPDATE users 
      SET user_password = $1 
      WHERE id = $2 
      RETURNING id, user_name, user_email;
    `;
    const result = await pool.query(query, [hashedPassword, userId]);
    return result.rows[0];
  },

  async saveResetCode(userId, email, code, expiresAt) {
    // Invalida códigos anteriores no usados para este usuario
    await pool.query(
      `UPDATE password_reset_codes SET used = true WHERE user_id = $1 AND used = false`,
      [userId]
    );

    const query = `
      INSERT INTO password_reset_codes (user_id, email, code, expires_at)
      VALUES ($1, $2, $3, $4)
      RETURNING id, code, expires_at;
    `;
    const result = await pool.query(query, [userId, email, code, expiresAt]);
    return result.rows[0];
  },

  async findValidResetCode(email, code) {
    const query = `
      SELECT id, user_id, email, code, expires_at
      FROM password_reset_codes
      WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))
        AND code = $2
        AND used = false
        AND expires_at > NOW()
      ORDER BY id DESC
      LIMIT 1;
    `;
    const result = await pool.query(query, [email, String(code).trim()]);
    return result.rows[0];
  },

  async markCodeAsUsed(codeId) {
    await pool.query(
      `UPDATE password_reset_codes SET used = true WHERE id = $1`,
      [codeId]
    );
  }
};
