import { pool } from "../../config/db.js";

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
      SELECT
        o.id,
        o.order_number,
        o.order_number AS "idCode",
        o.table_number,
        o.table_number AS "tableNumber",
        o.waiter_id,
        COALESCE(u.user_name, 'Mesero General') AS waiter,
        o.status,
        o.status AS "orderStatus",
        o.observations,
        o.payment_method AS "paymentMethod",
        o.total_amount::numeric AS total,
        o.total_amount::numeric AS "totalAmount",
        TO_CHAR(o.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt",
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'name', COALESCE(p.name, 'Platillo'),
              'price', oi.unit_price::numeric,
              'qty', oi.quantity,
              'subtotal', oi.subtotal::numeric,
              'notes', oi.notes
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users u ON u.id = o.waiter_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      ${whereClause}
      GROUP BY o.id, u.user_name
      ORDER BY o.id DESC;
    `;

    const result = await pool.query(query, values);
    return result.rows.map((r) => ({
      ...r,
      id: r.order_number || String(r.id),
      numericId: r.id,
    }));
  },

  async findById(orderIdentifier) {
    const query = `
      SELECT
        o.id,
        o.order_number,
        o.order_number AS "idCode",
        o.table_number,
        o.table_number AS "tableNumber",
        o.waiter_id,
        COALESCE(u.user_name, 'Mesero General') AS waiter,
        o.status,
        o.status AS "orderStatus",
        o.observations,
        o.payment_method AS "paymentMethod",
        o.total_amount::numeric AS total,
        o.total_amount::numeric AS "totalAmount",
        TO_CHAR(o.created_at, 'YYYY-MM-DD HH24:MI:SS') AS "createdAt",
        o.created_at,
        COALESCE(
          json_agg(
            json_build_object(
              'id', oi.id,
              'productId', oi.product_id,
              'name', COALESCE(p.name, 'Platillo'),
              'price', oi.unit_price::numeric,
              'qty', oi.quantity,
              'subtotal', oi.subtotal::numeric,
              'notes', oi.notes
            )
          ) FILTER (WHERE oi.id IS NOT NULL),
          '[]'
        ) AS items
      FROM orders o
      LEFT JOIN users u ON u.id = o.waiter_id
      LEFT JOIN order_items oi ON oi.order_id = o.id
      LEFT JOIN products p ON p.id = oi.product_id
      WHERE o.order_number = $1 OR (CASE WHEN $1 ~ '^[0-9]+$' THEN o.id = $1::int ELSE FALSE END)
      GROUP BY o.id, u.user_name;
    `;
    const result = await pool.query(query, [String(orderIdentifier)]);
    if (!result.rows[0]) return null;
    const r = result.rows[0];
    return {
      ...r,
      id: r.order_number || String(r.id),
      numericId: r.id,
    };
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

      let waiterId = data.waiterId || null;
      if (!waiterId && data.waiter) {
        const userRes = await client.query(
          "SELECT id FROM users WHERE LOWER(user_name) LIKE LOWER($1) LIMIT 1",
          [`%${data.waiter}%`]
        );
        if (userRes.rows[0]) waiterId = userRes.rows[0].id;
      }

      const tableNumber = data.tableNumber || data.table || "Mesa 1";
      const status = data.status || data.orderStatus || "No Pagada";
      const paymentMethod = data.paymentMethod || data.payment_method || null;
      const observations = data.observations || "";
      const items = Array.isArray(data.items) ? data.items : [];

      let totalAmount = Number(data.total || data.totalAmount || 0);
      if (totalAmount === 0 && items.length > 0) {
        totalAmount = items.reduce(
          (sum, it) => sum + (Number(it.price || 0) * Number(it.qty || it.quantity || 1)),
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

      for (const item of items) {
        let productId = item.productId || item.product_id;
        let unitPrice = Number(item.price || 0);

        if (!productId && item.name) {
          const prodRes = await client.query(
            "SELECT id, price FROM products WHERE LOWER(name) = LOWER($1) OR code = $1 LIMIT 1",
            [item.name]
          );
          if (prodRes.rows[0]) {
            productId = prodRes.rows[0].id;
            if (!unitPrice) unitPrice = Number(prodRes.rows[0].price);
          }
        }

        if (productId) {
          const qty = Number(item.qty || item.quantity || 1);
          const subtotal = Number(item.subtotal || (unitPrice * qty));
          const notes = item.notes || "";

          await client.query(
            `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
             VALUES ($1, $2, $3, $4, $5, $6);`,
            [createdOrder.id, productId, qty, unitPrice, subtotal, notes]
          );

          await client.query(
            `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2;`,
            [qty, productId]
          );
        }
      }

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
      // Conservar método de pago si no se envía uno nuevo
      const paymentMethod =
        data.paymentMethod !== undefined ? data.paymentMethod
        : data.payment_method !== undefined ? data.payment_method
        : current.paymentMethod ?? current.payment_method ?? null;
      let totalAmount = data.total !== undefined ? Number(data.total) : current.total;

      const items = Array.isArray(data.items) ? data.items : null;
      if (items) {
        totalAmount = items.reduce(
          (sum, it) => sum + (Number(it.price || 0) * Number(it.qty || it.quantity || 1)),
          0
        );

        await client.query("DELETE FROM order_items WHERE order_id = $1;", [current.numericId]);

        for (const item of items) {
          let productId = item.productId || item.product_id;
          let unitPrice = Number(item.price || 0);

          if (!productId && item.name) {
            const prodRes = await client.query(
              "SELECT id, price FROM products WHERE LOWER(name) = LOWER($1) OR code = $1 LIMIT 1",
              [item.name]
            );
            if (prodRes.rows[0]) {
              productId = prodRes.rows[0].id;
              if (!unitPrice) unitPrice = Number(prodRes.rows[0].price);
            }
          }

          if (productId) {
            const qty = Number(item.qty || item.quantity || 1);
            const subtotal = Number(item.subtotal || (unitPrice * qty));
            const notes = item.notes || "";

            await client.query(
              `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
               VALUES ($1, $2, $3, $4, $5, $6);`,
              [current.numericId, productId, qty, unitPrice, subtotal, notes]
            );
          }
        }
      }

      await client.query(
        `UPDATE orders
         SET table_number = $1, status = $2, observations = $3, total_amount = $4, payment_method = $5, updated_at = NOW()
         WHERE id = $6;`,
        [tableNumber, status, observations, totalAmount, paymentMethod, current.numericId]
      );

      await client.query("COMMIT");
      return await this.findById(current.order_number);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async updateStatus(orderIdentifier, newStatus) {
    const query = `
      UPDATE orders
      SET status = $1, updated_at = NOW()
      WHERE order_number = $2 OR (CASE WHEN $2 ~ '^[0-9]+$' THEN id = $2::int ELSE FALSE END)
      RETURNING *;
    `;
    const result = await pool.query(query, [newStatus, String(orderIdentifier)]);
    if (!result.rows[0]) return null;
    return await this.findById(result.rows[0].order_number);
  },

  async getTablesAvailability() {
    const query = `
      SELECT 
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
        AND LOWER(o.status) = 'no pagada'
      )
      ORDER BY t.id ASC;
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
