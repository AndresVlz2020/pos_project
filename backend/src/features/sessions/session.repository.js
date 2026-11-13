import { pool } from "../../config/db.js";

let tableEnsured = false;

export const sessionRepository = {
  async ensureTable() {
    if (tableEnsured) return;
    await pool.query(`
      CREATE TABLE IF NOT EXISTS user_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ended_at TIMESTAMPTZ NULL,
        duration_seconds INTEGER NOT NULL DEFAULT 0
      );
      CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(ended_at, last_seen_at);
    `);
    tableEnsured = true;
  },

  async closeOpenSessionsForUser(userId) {
    await this.ensureTable();
    await pool.query(
      `
      UPDATE user_sessions
      SET
        ended_at = COALESCE(last_seen_at, NOW()),
        duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (COALESCE(last_seen_at, NOW()) - started_at))::INTEGER)
      WHERE user_id = $1 AND ended_at IS NULL
      `,
      [userId]
    );
  },

  async startSession(userId) {
    await this.ensureTable();
    await this.closeOpenSessionsForUser(userId);
    const { rows } = await pool.query(
      `
      INSERT INTO user_sessions (user_id, started_at, last_seen_at, duration_seconds)
      VALUES ($1, NOW(), NOW(), 0)
      RETURNING id, user_id AS "userId", started_at AS "startedAt", last_seen_at AS "lastSeenAt", ended_at AS "endedAt", duration_seconds AS "durationSeconds"
      `,
      [userId]
    );
    return rows[0];
  },

  async getCurrentSession(userId) {
    await this.ensureTable();
    const { rows } = await pool.query(
      `
      SELECT
        id,
        user_id AS "userId",
        started_at AS "startedAt",
        last_seen_at AS "lastSeenAt",
        ended_at AS "endedAt",
        GREATEST(0, EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER) AS "durationSeconds"
      FROM user_sessions
      WHERE user_id = $1
        AND ended_at IS NULL
        AND last_seen_at >= NOW() - INTERVAL '15 minutes'
      ORDER BY started_at DESC
      LIMIT 1
      `,
      [userId]
    );
    return rows[0] || null;
  },

  async heartbeat(userId) {
    await this.ensureTable();
    const { rows } = await pool.query(
      `
      UPDATE user_sessions
      SET
        last_seen_at = NOW(),
        duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER)
      WHERE id = (
        SELECT id FROM user_sessions
        WHERE user_id = $1
          AND ended_at IS NULL
          AND last_seen_at >= NOW() - INTERVAL '15 minutes'
        ORDER BY started_at DESC
        LIMIT 1
      )
      RETURNING
        id,
        user_id AS "userId",
        started_at AS "startedAt",
        last_seen_at AS "lastSeenAt",
        ended_at AS "endedAt",
        duration_seconds AS "durationSeconds"
      `,
      [userId]
    );

    if (rows[0]) return rows[0];
    return this.startSession(userId);
  },

  async endSession(userId) {
    await this.ensureTable();
    const { rows } = await pool.query(
      `
      UPDATE user_sessions
      SET
        ended_at = NOW(),
        last_seen_at = NOW(),
        duration_seconds = GREATEST(0, EXTRACT(EPOCH FROM (NOW() - started_at))::INTEGER)
      WHERE user_id = $1 AND ended_at IS NULL
      RETURNING
        id,
        user_id AS "userId",
        started_at AS "startedAt",
        last_seen_at AS "lastSeenAt",
        ended_at AS "endedAt",
        duration_seconds AS "durationSeconds"
      `,
      [userId]
    );
    return rows[0] || null;
  },

  async getActiveStaffSessions() {
    await this.ensureTable();
    const { rows } = await pool.query(`
      SELECT DISTINCT ON (s.user_id)
        s.id AS "sessionId",
        s.user_id AS "userId",
        u.user_name AS "userName",
        u.user_type AS "userType",
        u.user_avatar_url AS "userAvatarUrl",
        s.started_at AS "startedAt",
        s.last_seen_at AS "lastSeenAt",
        GREATEST(0, EXTRACT(EPOCH FROM (NOW() - s.started_at))::INTEGER) AS "durationSeconds"
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      WHERE s.ended_at IS NULL
        AND s.last_seen_at >= NOW() - INTERVAL '3 minutes'
        AND COALESCE(u.is_superuser, false) = false
        AND LOWER(COALESCE(u.user_type, '')) NOT IN ('admin', 'administrador')
      ORDER BY s.user_id, s.started_at DESC
    `);
    return rows;
  },

  async getHistory({ userId = null, includeAll = false, limit = 100 } = {}) {
    await this.ensureTable();
    const params = [];
    const conditions = [];

    if (!includeAll || userId) {
      params.push(userId);
      conditions.push(`s.user_id = $${params.length}`);
    } else {
      // Para administrador viendo todos: excluir cuentas admin sin contador si se desea, o mostrar todo personal operativo
      conditions.push(`COALESCE(u.is_superuser, false) = false`);
      conditions.push(`LOWER(COALESCE(u.user_type, '')) NOT IN ('admin', 'administrador')`);
    }

    params.push(limit);
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const { rows } = await pool.query(
      `
      SELECT
        s.id,
        s.user_id AS "userId",
        u.user_name AS "userName",
        u.user_type AS "userType",
        u.user_avatar_url AS "userAvatarUrl",
        s.started_at AS "startedAt",
        s.last_seen_at AS "lastSeenAt",
        s.ended_at AS "endedAt",
        CASE
          WHEN s.ended_at IS NULL THEN GREATEST(0, EXTRACT(EPOCH FROM (NOW() - s.started_at))::INTEGER)
          ELSE s.duration_seconds
        END AS "durationSeconds",
        (s.ended_at IS NULL AND s.last_seen_at >= NOW() - INTERVAL '3 minutes') AS "isActive"
      FROM user_sessions s
      JOIN users u ON u.id = s.user_id
      ${whereClause}
      ORDER BY s.started_at DESC
      LIMIT $${params.length}
      `,
      params
    );
    return rows;
  },
};
