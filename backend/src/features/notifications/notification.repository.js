import { pool } from "../../config/db.js";

export const notificationRepository = {
  async create({
    type = "order_completed",
    title,
    message,
    orderId = null,
    orderNumber = null,
    tableNumber = null,
    targetRole = "Mesero",
    targetUserId = null,
    createdByUserId = null,
    metadata = {},
  }) {
    const query = `
      INSERT INTO notifications (
        type,
        title,
        message,
        order_id,
        order_number,
        table_number,
        target_role,
        target_user_id,
        created_by_user_id,
        metadata,
        created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb, NOW())
      RETURNING
        id,
        type,
        title,
        message,
        order_id AS "orderId",
        order_number AS "orderNumber",
        table_number AS "tableNumber",
        target_role AS "targetRole",
        target_user_id AS "targetUserId",
        created_by_user_id AS "createdByUserId",
        metadata,
        created_at AS "createdAt";
    `;

    const result = await pool.query(query, [
      type,
      title,
      message,
      orderId,
      orderNumber,
      tableNumber,
      targetRole,
      targetUserId,
      createdByUserId,
      JSON.stringify(metadata || {}),
    ]);
    return result.rows[0] || null;
  },

  async findForUser({
    userId,
    targetRole = "Mesero",
    includeAllRoles = false,
    limit = 60,
  }) {
    const uid = Number(userId);
    const listQuery = `
      SELECT
        n.id,
        n.type,
        n.title,
        n.message,
        n.order_id AS "orderId",
        COALESCE(o.order_number, n.order_number) AS "orderNumber",
        COALESCE(o.table_number, n.table_number) AS "tableNumber",
        n.target_role AS "targetRole",
        n.target_user_id AS "targetUserId",
        COALESCE(uw.user_name, NULLIF(n.metadata->>'waiterName', ''), 'Sin asignar') AS "waiterName",
        n.created_by_user_id AS "createdByUserId",
        o.status AS "currentOrderStatus",
        n.metadata,
        n.created_at AS "createdAt",
        (
          nr.read_at IS NOT NULL
          OR LOWER(TRIM(COALESCE(o.status, ''))) IN ('entregada', 'pagada', 'anulada')
        ) AS "isRead",
        nr.read_at AS "readAt"
      FROM notifications n
      LEFT JOIN notification_reads nr
        ON nr.notification_id = n.id AND nr.user_id = $1
      LEFT JOIN orders o
        ON o.id = n.order_id
      LEFT JOIN users uw
        ON uw.id = o.waiter_id
      WHERE ($2::boolean = TRUE OR LOWER(n.target_role) = LOWER($3))
      ORDER BY n.created_at DESC, n.id DESC
      LIMIT $4;
    `;

    const countQuery = `
      SELECT COUNT(*)::int AS "unreadCount"
      FROM notifications n
      LEFT JOIN notification_reads nr
        ON nr.notification_id = n.id AND nr.user_id = $1
      LEFT JOIN orders o
        ON o.id = n.order_id
      WHERE ($2::boolean = TRUE OR LOWER(n.target_role) = LOWER($3))
        AND nr.read_at IS NULL
        AND LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('entregada', 'pagada', 'anulada');
    `;

    const [listRes, countRes] = await Promise.all([
      pool.query(listQuery, [uid, Boolean(includeAllRoles), targetRole, limit]),
      pool.query(countQuery, [uid, Boolean(includeAllRoles), targetRole]),
    ]);

    return {
      notifications: listRes.rows,
      unreadCount: Number(countRes.rows[0]?.unreadCount || 0),
    };
  },

  async markAsRead(notificationId, userId) {
    const nid = Number(notificationId);
    const uid = Number(userId);
    if (!Number.isInteger(nid) || nid <= 0) return null;

    const existing = await pool.query(
      "SELECT id FROM notifications WHERE id = $1 LIMIT 1;",
      [nid]
    );
    if (!existing.rows[0]) return null;

    await pool.query(
      `INSERT INTO notification_reads (notification_id, user_id, read_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (notification_id, user_id)
       DO UPDATE SET read_at = NOW();`,
      [nid, uid]
    );

    return { notificationId: nid, isRead: true };
  },

  async markAllAsRead({ userId, targetRole = "Mesero", includeAllRoles = false }) {
    const uid = Number(userId);
    await pool.query(
      `INSERT INTO notification_reads (notification_id, user_id, read_at)
       SELECT n.id, $1, NOW()
       FROM notifications n
       WHERE ($2::boolean = TRUE OR LOWER(n.target_role) = LOWER($3))
         AND NOT EXISTS (
           SELECT 1 FROM notification_reads nr
           WHERE nr.notification_id = n.id AND nr.user_id = $1
         )
       ON CONFLICT (notification_id, user_id) DO NOTHING;`,
      [uid, Boolean(includeAllRoles), targetRole]
    );
    return { ok: true };
  },

  async markResolvedByOrder(orderIdentifier) {
    const raw = String(orderIdentifier || "").trim();
    if (!raw) return 0;

    const result = await pool.query(
      `INSERT INTO notification_reads (notification_id, user_id, read_at)
       SELECT DISTINCT n.id, u.id, NOW()
       FROM notifications n
       LEFT JOIN orders o ON o.id = n.order_id
       CROSS JOIN users u
       WHERE (
         n.order_number = $1
         OR o.order_number = $1
         OR (CASE WHEN $1 ~ '^[0-9]+$' THEN n.order_id = $1::int ELSE FALSE END)
       )
         AND (
           u.is_superuser = TRUE
           OR LOWER(COALESCE(u.user_type, '')) IN ('admin', 'administrador', LOWER(COALESCE(n.target_role, 'mesero')))
         )
       ON CONFLICT (notification_id, user_id) DO NOTHING;`,
      [raw]
    );
    return result.rowCount || 0;
  },
};
