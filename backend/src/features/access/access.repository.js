// backend/src/features/access/access.repository.js

import { pool } from "../../config/db.js";

export const accessRepository = {
  async isSuperUser(userId) {
    const query = `
      SELECT is_superuser
      FROM users
      WHERE id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0]?.is_superuser ?? false;
  },

  async isAdmin(userId) {
    const query = `
      SELECT
        u.is_superuser
        OR LOWER(COALESCE(u.user_type, '')) IN ('admin', 'administrador')
        OR EXISTS (
          SELECT 1
          FROM user_groups ug
          INNER JOIN groups g ON g.group_id = ug.group_id
          WHERE ug.user_id = u.id
            AND g.group_name = 'Administrador'
        ) AS is_admin
      FROM users u
      WHERE u.id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows[0]?.is_admin ?? false;
  },

  async getUserPermissions(userId) {
    const query = `
      SELECT DISTINCT p.permission_codename
      FROM permissions p
      INNER JOIN user_permissions up
        ON up.permission_id = p.permission_id
      WHERE up.user_id = $1

      UNION

      SELECT DISTINCT p.permission_codename
      FROM permissions p
      INNER JOIN group_permissions gp
        ON gp.permission_id = p.permission_id
      INNER JOIN user_groups ug
        ON ug.group_id = gp.group_id
      WHERE ug.user_id = $1;
    `;

    const result = await pool.query(query, [userId]);

    return result.rows.map((row) => row.permission_codename);
  },
};
