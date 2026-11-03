import { pool } from "../../config/db.js";

export const authRepository = {
  async findByEmail(userEmail) {
    const query = `
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
        EXISTS (
          SELECT 1
          FROM user_groups ug
          INNER JOIN groups g ON g.group_id = ug.group_id
          WHERE ug.user_id = u.id
            AND g.group_name = 'Administrador'
        ) AS is_admin_group
      FROM users u
      WHERE LOWER(TRIM(u.user_email)) = LOWER(TRIM($1))
         OR LOWER(TRIM(COALESCE(u.corporate_email, ''))) = LOWER(TRIM($1))
      LIMIT 1;
    `;
    const result = await pool.query(query, [userEmail]);
    return result.rows[0];
  },

  async findById(userId) {
    const query = `
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
        EXISTS (
          SELECT 1
          FROM user_groups ug
          INNER JOIN groups g ON g.group_id = ug.group_id
          WHERE ug.user_id = u.id
            AND g.group_name = 'Administrador'
        ) AS is_admin_group
      FROM users u
      WHERE u.id = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [userId]);
    return result.rows[0];
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
