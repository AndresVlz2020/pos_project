// backend/src/features/groups/groups.repository.js

import { pool } from "../../config/db.js";

export const groupsRepository = {
  async getAll() {
    const query = `
      SELECT
        group_id,
        group_name,
        is_active
      FROM groups
      ORDER BY group_id ASC;
    `;

    const result = await pool.query(query);

    return result.rows;
  },

  // Obtener permisos de grupo por ID
  async getPermissionsByGroupId(groupId) {
    const query = `
      SELECT
        p.permission_id,
        p.permission_name,
        p.permission_codename
      FROM group_permissions gp
      INNER JOIN permissions p
        ON p.permission_id = gp.permission_id
      WHERE gp.group_id = $1
      ORDER BY p.permission_name;
    `;

    const result = await pool.query(query, [groupId]);

    return result.rows;
  },

  // Actualizar permisos del grupo
  async updatePermissions(groupId, permissionIds) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      await client.query(
        `
        DELETE FROM group_permissions
        WHERE group_id = $1
      `,
        [groupId],
      );

      for (const permissionId of permissionIds) {
        await client.query(
          `
          INSERT INTO group_permissions (
            group_id,
            permission_id
          )
          VALUES ($1, $2)
        `,
          [groupId, permissionId],
        );
      }

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },
};
