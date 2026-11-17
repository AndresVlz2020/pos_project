import { pool } from "../../config/db.js";

/**
 * Resuelve y bloquea la fila del producto involucrado en la transacción de orden.
 */
async function lockProductForOrder(client, item) {
  const rawProductId = item.productId || item.product_id;
  if (rawProductId) {
    const res = await client.query(
      "SELECT id, name, price, stock, is_active FROM products WHERE id = $1 FOR UPDATE;",
      [rawProductId]
    );
    return res.rows[0] || null;
  }

  if (item.name) {
    const res = await client.query(
      "SELECT id, name, price, stock, is_active FROM products WHERE LOWER(name) = LOWER($1) OR code = $1 LIMIT 1 FOR UPDATE;",
      [item.name]
    );
    return res.rows[0] || null;
  }

  return null;
}

function normalizePersistedOrderStatus(rawStatus) {
  const s = String(rawStatus ?? "").trim().toLowerCase();
  if (s === "pagada" || s === "cerrada") return "Pagada";
  if (s === "entregada") return "Entregada";
  if (s === "completada" || s === "lista") return "Completada";
  if (s === "anulada") return "Anulada";
  return "Creada";
}

function mapOrderRow(row) {
  if (!row) return null;
  const canonicalStatus = normalizePersistedOrderStatus(row.status);
  return {
    ...row,
    status: canonicalStatus,
    orderStatus: canonicalStatus,
    id: row.order_number || String(row.id),
    numericId: row.id,
  };
}

const ORDER_WITH_ITEMS_SELECT = `
  SELECT
    o.id,
    o.order_number,
    o.order_number AS "idCode",
    o.table_number,
    o.table_number AS "tableNumber",
    o.waiter_id,
    COALESCE(u.user_name, 'Sin asignar') AS waiter,
    o.status,
    o.status AS "orderStatus",
    o.observations,
    o.payment_method AS "paymentMethod",
    o.total_amount::numeric AS total,
    o.total_amount::numeric AS "totalAmount",
    TO_CHAR(o.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt",
    o.created_at,
    o.completed_at AS "completedAt",
    o.delivered_at AS "deliveredAt",
    COALESCE(
      json_agg(
        json_build_object(
          'id', oi.id,
          'productId', oi.product_id,
          'code', COALESCE(p.code, CONCAT('PROD-', LPAD(p.id::text, 3, '0'))),
          'name', COALESCE(p.name, 'Platillo'),
          'description', COALESCE(p.description, ''),
          'category', COALESCE(c.name, 'general'),
          'image', NULLIF(p.image_url, ''),
          'price', oi.unit_price::numeric,
          'qty', oi.quantity,
          'subtotal', oi.subtotal::numeric,
          'notes', oi.notes
        )
        ORDER BY oi.id ASC
      ) FILTER (WHERE oi.id IS NOT NULL),
      '[]'
    ) AS items
  FROM orders o
  LEFT JOIN users u ON u.id = o.waiter_id
  LEFT JOIN order_items oi ON oi.order_id = o.id
  LEFT JOIN products p ON p.id = oi.product_id
  LEFT JOIN categories c ON c.id = p.category_id
`;

export const orderRepository = {
  async findAll({ status = null } = {}) {
    const conditions = [];
    const values = [];

    if (status && status !== "todos") {
      values.push(status);
      conditions.push(`LOWER(o.status) = LOWER($${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      ${ORDER_WITH_ITEMS_SELECT}
      ${whereClause}
      GROUP BY o.id, u.user_name
      ORDER BY o.id DESC;
    `;

    const result = await pool.query(query, values);
    return result.rows.map(mapOrderRow);
  },

  async findById(orderIdentifier) {
    const query = `
      ${ORDER_WITH_ITEMS_SELECT}
      WHERE o.order_number = $1 OR (CASE WHEN $1 ~ '^[0-9]+$' THEN o.id = $1::int ELSE FALSE END)
      GROUP BY o.id, u.user_name;
    `;
    const result = await pool.query(query, [String(orderIdentifier)]);
    return mapOrderRow(result.rows[0] || null);
  },

  async create(data) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let orderNumber = data.orderNumber || data.id;
      if (!orderNumber || !orderNumber.startsWith("ORD-")) {
        const seqRes = await client.query("SELECT COALESCE(MAX(id), 0) + 1 AS next_id FROM orders;");
        const nextId = seqRes.rows[0].next_id;
        orderNumber = `ORD-${String(nextId).padStart(3, "0")}`;
      }

      let waiterId = null;
      const rawWaiterId = Number(data.waiterId);
      if (Number.isInteger(rawWaiterId) && rawWaiterId > 0) {
        const userByIdRes = await client.query(
          "SELECT id FROM users WHERE id = $1 LIMIT 1",
          [rawWaiterId]
        );
        if (userByIdRes.rows[0]) waiterId = userByIdRes.rows[0].id;
      }

      if (!waiterId && (data.waiter || data.waiterName)) {
        const waiterText = String(data.waiter || data.waiterName).trim();
        const userRes = await client.query(
          "SELECT id FROM users WHERE LOWER(user_name) LIKE LOWER($1) LIMIT 1",
          [`%${waiterText}%`]
        );
        if (userRes.rows[0]) waiterId = userRes.rows[0].id;
      }

      const tableNumber = data.tableNumber || data.table || "Mesa 1";
      const status = data.status || data.orderStatus || "Creada";
      const paymentMethod = data.paymentMethod || data.payment_method || null;
      const observations = data.observations || "";
      const items = Array.isArray(data.items) ? data.items : [];

      const resolvedItems = [];
      for (const item of items) {
        const prodRow = await lockProductForOrder(client, item);
        if (!prodRow) continue;

        if (!prodRow.is_active) {
          throw new Error(`El platillo "${prodRow.name}" está inhabilitado.`);
        }

        const qty = Math.max(1, Number(item.qty || item.quantity || 1));
        const availableStock = Math.max(0, Number(prodRow.stock || 0));
        if (qty > availableStock) {
          throw new Error(
            `Stock insuficiente para "${prodRow.name}". Disponible: ${Math.floor(availableStock)}.`
          );
        }

        const unitPrice = Number(item.price ?? item.unitPrice ?? 0) || Number(prodRow.price);
        resolvedItems.push({
          productId: prodRow.id,
          qty,
          unitPrice,
          subtotal: Number(item.subtotal || unitPrice * qty),
          notes: item.notes || "",
        });
      }

      let totalAmount = Number(data.total || data.totalAmount || 0);
      if (totalAmount === 0 && resolvedItems.length > 0) {
        totalAmount = resolvedItems.reduce(
          (sum, it) => sum + it.unitPrice * it.qty,
          0
        );
      }

      const orderInsertQuery = `
        INSERT INTO orders (
          order_number,
          table_number,
          waiter_id,
          status,
          observations,
          total_amount,
          payment_method,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
        RETURNING *;
      `;

      const orderResult = await client.query(orderInsertQuery, [
        orderNumber,
        tableNumber,
        waiterId,
        status,
        observations,
        totalAmount,
        paymentMethod,
      ]);

      const createdOrder = orderResult.rows[0];

      for (const item of resolvedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [createdOrder.id, item.productId, item.qty, item.unitPrice, item.subtotal, item.notes]
        );

        await client.query(
          `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2;`,
          [item.qty, item.productId]
        );
      }

      await this.syncTableStatus(client, tableNumber);
      await client.query("COMMIT");
      return await this.findById(createdOrder.order_number);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async update(orderIdentifier, data) {
    const current = await this.findById(orderIdentifier);
    if (!current) return null;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const tableNumber = data.tableNumber || current.table_number;
      const status = data.status || data.orderStatus || current.status;
      const observations = data.observations !== undefined ? data.observations : current.observations;
      const waiterId = data.waiterId ? Number(data.waiterId) : null;
      // Conservar método de pago si no se envía uno nuevo
      const paymentMethod =
        data.paymentMethod !== undefined ? data.paymentMethod
        : data.payment_method !== undefined ? data.payment_method
        : current.paymentMethod ?? current.payment_method ?? null;
      let totalAmount = data.total !== undefined ? Number(data.total) : current.total;

      const items = Array.isArray(data.items) ? data.items : null;
      if (items) {
        const prevItemsRes = await client.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = $1;",
          [current.numericId]
        );
        const prevQtyByProduct = new Map();
        prevItemsRes.rows.forEach((row) => {
          const pid = Number(row.product_id);
          prevQtyByProduct.set(
            pid,
            (prevQtyByProduct.get(pid) || 0) + Number(row.quantity || 0)
          );
        });

        const resolvedUpdateItems = [];
        for (const item of items) {
          const prodRow = await lockProductForOrder(client, item);
          if (!prodRow) continue;

          const qty = Math.max(1, Number(item.qty || item.quantity || 1));
          const prevQty = prevQtyByProduct.get(Number(prodRow.id)) || 0;
          const maxEditable = Math.max(0, Number(prodRow.stock || 0)) + prevQty;
          if (qty > maxEditable) {
            throw new Error(
              `Stock insuficiente para "${prodRow.name}". Disponible máximo: ${Math.floor(maxEditable)}.`
            );
          }

          const unitPrice = Number(item.price ?? item.unitPrice ?? 0) || Number(prodRow.price);
          resolvedUpdateItems.push({
            productId: prodRow.id,
            qty,
            unitPrice,
            subtotal: Number(item.subtotal || unitPrice * qty),
            notes: item.notes || "",
          });
        }

        totalAmount = resolvedUpdateItems.reduce(
          (sum, it) => sum + it.unitPrice * it.qty,
          0
        );

        const nextQtyByProduct = new Map();
        resolvedUpdateItems.forEach((it) => {
          const pid = Number(it.productId);
          nextQtyByProduct.set(pid, (nextQtyByProduct.get(pid) || 0) + it.qty);
        });

        const affectedProductIds = new Set([
          ...prevQtyByProduct.keys(),
          ...nextQtyByProduct.keys(),
        ]);
        for (const pid of affectedProductIds) {
          const diff =
            (prevQtyByProduct.get(pid) || 0) - (nextQtyByProduct.get(pid) || 0);
          if (diff !== 0) {
            await client.query(
              "UPDATE products SET stock = GREATEST(0, stock + $1) WHERE id = $2;",
              [diff, pid]
            );
          }
        }

        await client.query("DELETE FROM order_items WHERE order_id = $1;", [
          current.numericId,
        ]);

        for (const item of resolvedUpdateItems) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [
              current.numericId,
              item.productId,
              item.qty,
              item.unitPrice,
              item.subtotal,
              item.notes,
            ]
          );
        }
      }

      const completedClause =
        status === "Completada" ? ", completed_at = NOW()" : "";
      const deliveredClause =
        status === "Entregada" ? ", delivered_at = NOW()" : "";

      await client.query(
        `UPDATE orders
         SET table_number = $1,
             status = $2,
             observations = $3,
             total_amount = $4,
             payment_method = $5,
             waiter_id = COALESCE(waiter_id, $6),
             updated_at = NOW()
             ${completedClause}
             ${deliveredClause}
         WHERE id = $7;`,
        [tableNumber, status, observations, totalAmount, paymentMethod, waiterId, current.numericId]
      );

      await this.syncTableStatus(client, current.table_number);
      if (tableNumber !== current.table_number) {
        await this.syncTableStatus(client, tableNumber);
      }

      await client.query("COMMIT");
      return await this.findById(current.order_number);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async syncTableStatus(dbClient, tableNumber) {
    if (!tableNumber) return;
    await dbClient.query(
      `UPDATE restaurant_tables t
       SET status = CASE
         WHEN EXISTS (
           SELECT 1 FROM orders o
           WHERE (LOWER(TRIM(o.table_number)) = LOWER(TRIM(t.table_number)) OR TRIM(o.table_number) = CAST(t.id AS VARCHAR))
             AND LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('pagada', 'cerrada', 'anulada')
         ) THEN 'Ocupada'
         ELSE 'Disponible'
       END,
       updated_at = NOW()
       WHERE LOWER(TRIM(t.table_number)) = LOWER(TRIM($1))
          OR CAST(t.id AS VARCHAR) = TRIM($1);`,
      [String(tableNumber)]
    );
  },

  async updateStatus(orderIdentifier, newStatus, waiterId = null) {
    const uid = waiterId ? Number(waiterId) : null;
    const completedClause =
      newStatus === "Completada" ? ", completed_at = NOW()" : "";
    const deliveredClause =
      newStatus === "Entregada" ? ", delivered_at = NOW()" : "";
    const query = `
      UPDATE orders
      SET status = $1,
          waiter_id = COALESCE(waiter_id, $3),
          updated_at = NOW()
          ${completedClause}
          ${deliveredClause}
      WHERE order_number = $2 OR (CASE WHEN $2 ~ '^[0-9]+$' THEN id = $2::int ELSE FALSE END)
      RETURNING *;
    `;
    const result = await pool.query(query, [newStatus, String(orderIdentifier), uid]);
    if (!result.rows[0]) return null;
    await this.syncTableStatus(pool, result.rows[0].table_number);
    return await this.findById(result.rows[0].order_number);
  },

  async getTablesAvailability() {
    const query = `
      SELECT DISTINCT ON (t.id)
        t.id,
        t.table_number,
        t.capacity,
        CASE 
          WHEN o.id IS NOT NULL THEN 'Ocupada'
          ELSE 'Disponible'
        END AS status,
        (o.id IS NULL) AS is_available,
        o.order_number AS active_order_number
      FROM restaurant_tables t
      LEFT JOIN orders o ON (
        (LOWER(TRIM(o.table_number)) = LOWER(TRIM(t.table_number)) OR TRIM(o.table_number) = CAST(t.id AS VARCHAR))
        AND LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('pagada', 'cerrada', 'anulada')
      )
      ORDER BY t.id ASC, o.id DESC;
    `;
    const result = await pool.query(query);
    return result.rows.map((row) => ({
      id: row.id,
      tableNumber: row.table_number,
      capacity: row.capacity,
      status: row.status,
      isAvailable: Boolean(row.is_available),
      activeOrderNumber: row.active_order_number,
    }));
  },
};
