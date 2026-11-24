import { pool } from "../../config/db.js";

const DEFAULT_SUPPORT_EMAIL = "soporte@dpiero.com";

export const settingsRepository = {
  async getSupportEmail() {
    try {
      const { rows } = await pool.query(
        `SELECT value FROM app_settings WHERE key = 'support_email' LIMIT 1;`
      );
      const val = String(rows[0]?.value || "").trim();
      return val || DEFAULT_SUPPORT_EMAIL;
    } catch (err) {
      if (err?.code === "42P01") {
        return DEFAULT_SUPPORT_EMAIL;
      }
      throw err;
    }
  },

  async updateSupportEmail(supportEmail, updatedByUserId = null) {
    const cleanEmail = String(supportEmail || "").trim().toLowerCase();
    const { rows } = await pool.query(
      `INSERT INTO app_settings (key, value, updated_at, updated_by)
       VALUES ('support_email', $1, NOW(), $2)
       ON CONFLICT (key)
       DO UPDATE SET
         value = EXCLUDED.value,
         updated_at = NOW(),
         updated_by = EXCLUDED.updated_by
       RETURNING value AS "supportEmail", updated_at AS "updatedAt";`,
      [cleanEmail, updatedByUserId ? Number(updatedByUserId) : null]
    );
    return rows[0];
  },
};
