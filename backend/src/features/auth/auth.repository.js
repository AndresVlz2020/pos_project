import { pool } from "../../config/db.js";

export const authRepository = {
  async findByEmail(userEmail) {
    const query = `
      SELECT id, user_name, user_email, COALESCE(user_password, '') AS password, is_active, is_staff, is_superuser
      FROM users
      WHERE user_email = $1
      LIMIT 1;
    `;
    const result = await pool.query(query, [userEmail]);
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
  }
};
