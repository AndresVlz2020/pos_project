import { pool } from "../../config/db.js";

function roundQty3(value) {
  return Math.round(Number(value || 0) * 1000) / 1000;
}

async function getProductRecipesMap(client, productIds) {
  const uniqueIds = [
    ...new Set(
      (productIds || []).map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    ),
  ];
  const map = new Map();
  if (uniqueIds.length === 0) return map;

  const res = await client.query(
    `SELECT
       pi.producto_id,
       pi.insumo_id,
       pi.cantidad_requerida::numeric AS cantidad_requerida
     FROM producto_insumos pi
     WHERE pi.producto_id = ANY($1::int[])
     ORDER BY pi.id ASC;`,
    [uniqueIds]
  );

  for (const row of res.rows) {
    const pid = Number(row.producto_id);
    if (!map.has(pid)) map.set(pid, []);
    map.get(pid).push({
      insumo_id: Number(row.insumo_id),
      cantidad_requerida: Number(row.cantidad_requerida),
    });
  }
  return map;
}

async function lockInventoryRows(client, insumoIds) {
  const uniqueIds = [
    ...new Set(
      (insumoIds || []).map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0)
    ),
  ].sort((a, b) => a - b);

  const map = new Map();
  if (uniqueIds.length === 0) return map;

  const res = await client.query(
    `SELECT
       id,
       item_name,
       unit_measure,
       COALESCE(current_stock, 0)::numeric AS current_stock
     FROM inventory
     WHERE id = ANY($1::int[])
     ORDER BY id ASC
     FOR UPDATE;`,
    [uniqueIds]
  );

  for (const row of res.rows) {
    map.set(Number(row.id), {
      id: Number(row.id),
      itemName: row.item_name,
      unitMeasure: row.unit_measure,
      currentStock: roundQty3(row.current_stock),
    });
  }
  return map;
}

function computeRecipePortions(recipeRows, lockedInvMap) {
  if (!Array.isArray(recipeRows) || recipeRows.length === 0) return 0;
  let minPortions = Infinity;
  for (const ing of recipeRows) {
    const inv = lockedInvMap.get(Number(ing.insumo_id));
    const available = inv ? Math.max(0, Number(inv.currentStock)) : 0;
    const required = Number(ing.cantidad_requerida);
    const portions = required > 0 ? Math.floor(available / required) : 0;
    if (portions < minPortions) minPortions = portions;
  }
  return Number.isFinite(minPortions) ? minPortions : 0;
}

async function applyInventoryMovement(
  client,
  {
    insumoId,
    lockedInvMap,
    delta,
    ordenId = null,
    productoId = null,
    tipoMovimiento,
    observacion = "",
    usuarioId = null,
  }
) {
  const numDelta = roundQty3(delta);
  if (numDelta === 0) return;

  const inv = lockedInvMap.get(Number(insumoId));
  if (!inv) {
    throw new Error(`El insumo ${insumoId} no se encontró en el inventario.`);
  }

  const prevStock = roundQty3(inv.currentStock);
  const rawNext = roundQty3(prevStock + numDelta);
  if (numDelta < 0 && rawNext < -0.0001) {
    throw new Error(
      `Stock insuficiente de insumo "${inv.itemName}". Disponible: ${prevStock} ${inv.unitMeasure || "un."}.`
    );
  }
  const nextStock = Math.max(0, rawNext);
  inv.currentStock = nextStock;

  await client.query(
    "UPDATE inventory SET current_stock = $1, last_updated = NOW() WHERE id = $2;",
    [nextStock, insumoId]
  );

  await client.query(
    `INSERT INTO movimientos_inventario (
       insumo_id,
       orden_id,
       producto_id,
       tipo_movimiento,
       cantidad,
       stock_anterior,
       stock_nuevo,
       observacion,
       usuario_id
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);`,
    [
      insumoId,
      ordenId,
      productoId,
      tipoMovimiento,
      numDelta,
      prevStock,
      nextStock,
      observacion,
      usuarioId || null,
    ]
  );
}

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
      const actorUserId = Number(data.actorUserId || waiterId) || null;

      const lockedEntries = [];
      const lockedProductsMap = new Map();
      for (const item of items) {
        const prodRow = await lockProductForOrder(client, item);
        if (!prodRow) continue;

        if (!prodRow.is_active) {
          throw new Error(`El platillo "${prodRow.name}" está inhabilitado.`);
        }

        const pid = Number(prodRow.id);
        if (!lockedProductsMap.has(pid)) {
          lockedProductsMap.set(pid, {
            ...prodRow,
            availableDirectStock: Math.max(0, Number(prodRow.stock || 0)),
          });
        }

        const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
        const unitPrice = Number(item.price ?? item.unitPrice ?? 0) || Number(prodRow.price);
        lockedEntries.push({
          productId: pid,
          productName: prodRow.name,
          qty,
          unitPrice,
          subtotal: Number(item.subtotal || unitPrice * qty),
          notes: item.notes || "",
        });
      }

      const recipesMap = await getProductRecipesMap(
        client,
        lockedEntries.map((it) => it.productId)
      );
      const requiredInsumoIds = [];
      for (const recipeRows of recipesMap.values()) {
        for (const ing of recipeRows) {
          requiredInsumoIds.push(ing.insumo_id);
        }
      }
      const lockedInvMap = await lockInventoryRows(client, requiredInsumoIds);

      let totalAmount = Number(data.total || data.totalAmount || 0);
      if (totalAmount === 0 && lockedEntries.length > 0) {
        totalAmount = lockedEntries.reduce(
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

      for (const item of lockedEntries) {
        const recipeRows = recipesMap.get(item.productId) || [];

        if (recipeRows.length > 0) {
          const availablePortions = computeRecipePortions(recipeRows, lockedInvMap);
          if (item.qty > availablePortions) {
            throw new Error(
              `Stock insuficiente para "${item.productName}". Disponible: ${availablePortions}.`
            );
          }

          for (const ing of recipeRows) {
            const consumed = roundQty3(item.qty * Number(ing.cantidad_requerida));
            await applyInventoryMovement(client, {
              insumoId: ing.insumo_id,
              lockedInvMap,
              delta: -consumed,
              ordenId: createdOrder.id,
              productoId: item.productId,
              tipoMovimiento: "SALIDA_ORDEN",
              observacion: `Consumo orden ${orderNumber} (${item.qty}x ${item.productName})`,
              usuarioId: actorUserId,
            });
          }
        } else {
          const trackedProd = lockedProductsMap.get(item.productId);
          if (item.qty > trackedProd.availableDirectStock) {
            throw new Error(
              `Stock insuficiente para "${item.productName}". Disponible: ${Math.floor(trackedProd.availableDirectStock)}.`
            );
          }
          trackedProd.availableDirectStock = Math.max(
            0,
            trackedProd.availableDirectStock - item.qty
          );
          await client.query(
            `UPDATE products SET stock = GREATEST(0, stock - $1) WHERE id = $2;`,
            [item.qty, item.productId]
          );
        }

        await client.query(
          `INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal, notes)
           VALUES ($1, $2, $3, $4, $5, $6);`,
          [
            createdOrder.id,
            item.productId,
            item.qty,
            item.unitPrice,
            item.subtotal,
            item.notes,
          ]
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
      const actorUserId = Number(data.actorUserId || waiterId) || null;
      if (items) {
        const prevItemsRes = await client.query(
          "SELECT product_id, quantity FROM order_items WHERE order_id = $1 FOR UPDATE;",
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

        const nextAggByProduct = new Map();
        for (const item of items) {
          const resolvedId = Number(item.productId || item.product_id);
          const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
          if (Number.isInteger(resolvedId) && resolvedId > 0) {
            nextAggByProduct.set(
              resolvedId,
              (nextAggByProduct.get(resolvedId) || 0) + qty
            );
          }
        }

        const allProductIds = [
          ...new Set([
            ...prevQtyByProduct.keys(),
            ...nextAggByProduct.keys(),
          ]),
        ].sort((a, b) => a - b);

        const lockedProductsMap = new Map();
        if (allProductIds.length > 0) {
          const prodLockRes = await client.query(
            "SELECT id, name, price, stock, is_active FROM products WHERE id = ANY($1::int[]) ORDER BY id ASC FOR UPDATE;",
            [allProductIds]
          );
          for (const row of prodLockRes.rows) {
            lockedProductsMap.set(Number(row.id), row);
          }
        }

        const resolvedUpdateItems = [];
        for (const item of items) {
          let prodRow = item.productId || item.product_id
            ? lockedProductsMap.get(Number(item.productId || item.product_id))
            : null;
          if (!prodRow) {
            prodRow = await lockProductForOrder(client, item);
            if (prodRow && !lockedProductsMap.has(Number(prodRow.id))) {
              lockedProductsMap.set(Number(prodRow.id), prodRow);
            }
          }
          if (!prodRow) continue;

          const pid = Number(prodRow.id);
          const qty = Math.max(1, Math.floor(Number(item.qty || item.quantity || 1)));
          const unitPrice = Number(item.price ?? item.unitPrice ?? 0) || Number(prodRow.price);
          resolvedUpdateItems.push({
            productId: pid,
            productName: prodRow.name,
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

        const affectedProductIds = [
          ...new Set([
            ...prevQtyByProduct.keys(),
            ...nextQtyByProduct.keys(),
          ]),
        ];

        const recipesMap = await getProductRecipesMap(client, affectedProductIds);
        const insumoIds = [];
        for (const recipeRows of recipesMap.values()) {
          for (const ing of recipeRows) {
            insumoIds.push(ing.insumo_id);
          }
        }
        const lockedInvMap = await lockInventoryRows(client, insumoIds);

        // Procesar primero devoluciones (delta < 0) para liberar insumos compartidos antes de nuevos descuentos
        const productDeltas = affectedProductIds
          .map((pid) => ({
            pid,
            prevQty: prevQtyByProduct.get(pid) || 0,
            nextQty: nextQtyByProduct.get(pid) || 0,
            deltaQty: (nextQtyByProduct.get(pid) || 0) - (prevQtyByProduct.get(pid) || 0),
          }))
          .filter((d) => d.deltaQty !== 0)
          .sort((a, b) => a.deltaQty - b.deltaQty);

        for (const { pid, prevQty, deltaQty } of productDeltas) {
          const prodRow = lockedProductsMap.get(pid);
          const prodName = prodRow?.name || `Producto #${pid}`;
          const recipeRows = recipesMap.get(pid) || [];

          if (recipeRows.length > 0) {
            if (deltaQty > 0) {
              const extraAvailable = computeRecipePortions(recipeRows, lockedInvMap);
              if (deltaQty > extraAvailable) {
                throw new Error(
                  `Stock insuficiente para "${prodName}". Disponible máximo: ${prevQty + extraAvailable}.`
                );
              }
            }

            for (const ing of recipeRows) {
              const invDelta = -roundQty3(deltaQty * Number(ing.cantidad_requerida));
              await applyInventoryMovement(client, {
                insumoId: ing.insumo_id,
                lockedInvMap,
                delta: invDelta,
                ordenId: current.numericId,
                productoId: pid,
                tipoMovimiento: "AJUSTE_ORDEN",
                observacion: `Ajuste orden ${current.order_number} (${deltaQty > 0 ? `+${deltaQty}` : deltaQty}x ${prodName})`,
                usuarioId: actorUserId,
              });
            }
          } else {
            const currentDirect = Math.max(0, Number(prodRow?.stock || 0));
            if (deltaQty > currentDirect) {
              throw new Error(
                `Stock insuficiente para "${prodName}". Disponible máximo: ${Math.floor(currentDirect + prevQty)}.`
              );
            }
            const nextDirectStock = Math.max(0, currentDirect - deltaQty);
            await client.query(
              "UPDATE products SET stock = $1 WHERE id = $2;",
              [nextDirectStock, pid]
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

  async cancelWithStockRestore(orderIdentifier, actorUserId = null) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const orderRes = await client.query(
        `SELECT * FROM orders
         WHERE order_number = $1
            OR (CASE WHEN $1 ~ '^[0-9]+$' THEN id = $1::int ELSE FALSE END)
         FOR UPDATE;`,
        [String(orderIdentifier)]
      );
      const orderRow = orderRes.rows[0];
      if (!orderRow) {
        await client.query("ROLLBACK");
        return null;
      }

      if (normalizePersistedOrderStatus(orderRow.status) === "Anulada") {
        await client.query("COMMIT");
        return await this.findById(orderRow.order_number);
      }

      const itemsRes = await client.query(
        `SELECT oi.product_id, oi.quantity, p.name AS product_name
         FROM order_items oi
         LEFT JOIN products p ON p.id = oi.product_id
         WHERE oi.order_id = $1;`,
        [orderRow.id]
      );

      const productIds = itemsRes.rows
        .map((r) => Number(r.product_id))
        .filter((id) => Number.isInteger(id) && id > 0);
      const recipesMap = await getProductRecipesMap(client, productIds);

      const insumoIds = [];
      for (const recipeRows of recipesMap.values()) {
        for (const ing of recipeRows) {
          insumoIds.push(ing.insumo_id);
        }
      }
      const lockedInvMap = await lockInventoryRows(client, insumoIds);

      for (const row of itemsRes.rows) {
        const pid = Number(row.product_id);
        const qty = Math.max(0, Number(row.quantity || 0));
        if (qty <= 0 || !pid) continue;

        const recipeRows = recipesMap.get(pid) || [];
        if (recipeRows.length > 0) {
          for (const ing of recipeRows) {
            const restored = roundQty3(qty * Number(ing.cantidad_requerida));
            await applyInventoryMovement(client, {
              insumoId: ing.insumo_id,
              lockedInvMap,
              delta: restored,
              ordenId: orderRow.id,
              productoId: pid,
              tipoMovimiento: "ENTRADA_ANULACION",
              observacion: `Reverso por anulación orden ${orderRow.order_number} (${qty}x ${row.product_name || "Platillo"})`,
              usuarioId: actorUserId,
            });
          }
        } else {
          await client.query(
            "UPDATE products SET stock = COALESCE(stock, 0) + $1 WHERE id = $2;",
            [qty, pid]
          );
        }
      }

      await client.query(
        "UPDATE orders SET status = 'Anulada', updated_at = NOW() WHERE id = $1;",
        [orderRow.id]
      );

      await this.syncTableStatus(client, orderRow.table_number);
      await client.query("COMMIT");
      return await this.findById(orderRow.order_number);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
