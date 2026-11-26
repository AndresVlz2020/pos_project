import { notificationRepository } from "./notification.repository.js";
import { pool } from "../../config/db.js";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

const ttsCache = new Map();
const TTS_CACHE_LIMIT = 50;

function resolveNotificationScope(user) {
  const role = String(user?.role || "").trim().toLowerCase();
  const isAdmin = Boolean(
    user?.isAdmin ||
      user?.isSuperuser ||
      role === "admin" ||
      role === "administrador"
  );
  const isMesero = !isAdmin && (role === "mesero" || role === "salon");
  const targetRole = isMesero ? "Mesero" : "NON_MESERO";
  return { isAdmin, isMesero, targetRole };
}

function buildItemsSummary(items = []) {
  if (!Array.isArray(items) || items.length === 0) return "";
  const preview = items
    .slice(0, 3)
    .map((it) => `${Math.max(1, Number(it.qty || it.quantity || 1))}x ${it.name || "Platillo"}`)
    .join(", ");
  return items.length > 3 ? `${preview} y ${items.length - 3} más` : preview;
}

export const notificationService = {
  async createOrderCompletedNotification(order, actorUser = null) {
    if (!order) return null;

    const orderNumber = order.order_number || order.idCode || String(order.id);
    const tableNumber = order.tableNumber || order.table_number || "Mesa";
    const items = Array.isArray(order.items) ? order.items : [];
    const itemsSummary = buildItemsSummary(items);

    const title = `Orden ${orderNumber} lista en Cocina`;
    const message = itemsSummary
      ? `${tableNumber} · ${itemsSummary} — Lista para entregar en mesa.`
      : `${tableNumber} · Preparada en Cocina y lista para entregar en mesa.`;

    return await notificationRepository.create({
      type: "order_completed",
      title,
      message,
      orderId: Number(order.numericId || order.id) || null,
      orderNumber: String(orderNumber),
      tableNumber: String(tableNumber),
      targetRole: "Mesero",
      targetUserId: Number(order.waiter_id) || null,
      createdByUserId: Number(actorUser?.id) || null,
      metadata: {
        waiterName: order.waiter || "",
        actorName: actorUser?.name || "",
        itemsCount: items.length,
        itemsSummary,
      },
    });
  },

  async listForUser(authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      return { notifications: [], unreadCount: 0 };
    }

    const { isAdmin, targetRole } = resolveNotificationScope(authenticatedUser);

    return await notificationRepository.findForUser({
      userId,
      targetRole,
      includeAllRoles: isAdmin,
    });
  },

  async markAsRead(notificationId, authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      const err = new Error("No autorizado para actualizar esta notificación.");
      err.status = 403;
      throw err;
    }

    const res = await notificationRepository.markAsRead(notificationId, userId);
    if (!res) {
      const err = new Error("Notificación no encontrada.");
      err.status = 404;
      throw err;
    }
    return res;
  },

  async markAllAsRead(authenticatedUser) {
    const userId = Number(authenticatedUser?.id);
    if (!Number.isInteger(userId) || userId <= 0) {
      const err = new Error("No autorizado para actualizar notificaciones.");
      err.status = 403;
      throw err;
    }

    const { isAdmin, targetRole } = resolveNotificationScope(authenticatedUser);

    return await notificationRepository.markAllAsRead({
      userId,
      targetRole,
      includeAllRoles: isAdmin,
    });
  },

  async markResolvedByOrder(orderIdentifier) {
    if (!orderIdentifier) return 0;
    return await notificationRepository.markResolvedByOrder(orderIdentifier);
  },

  async syncInventoryStockAlertsByInsumoIds(insumoIds = [], actorUser = null) {
    const uniqueIds = Array.from(
      new Set(
        (insumoIds || [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0)
      )
    );
    if (uniqueIds.length === 0) return [];

    const { rows } = await pool.query(
      `SELECT
         id,
         COALESCE(code, CONCAT('INV-', LPAD(id::text, 3, '0'))) AS code,
         item_name,
         unit_measure,
         COALESCE(current_stock, 0)::numeric AS current_stock,
         COALESCE(min_stock, 0)::numeric AS min_stock,
         COALESCE(is_active, TRUE) AS is_active
       FROM inventory
       WHERE id = ANY($1::int[]);`,
      [uniqueIds]
    );

    const created = [];
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const row of rows) {
        if (row.is_active === false) continue;

        // Serializa por insumo dentro de la transacción para evitar alertas duplicadas concurrentes
        await client.query("SELECT pg_advisory_xact_lock($1);", [910000 + Number(row.id)]);

        const currentStock = Number(row.current_stock || 0);
        const minStock = Number(row.min_stock || 0);
        const unit = row.unit_measure || "un.";
        const code = row.code || `INV-${row.id}`;

        if (currentStock <= 0) {
          await notificationRepository.resolveStockNotificationsByInsumo(row.id, ["inventory_low_stock"]);
          const existing = await notificationRepository.findActiveStockNotification(row.id, "inventory_out_of_stock");
          if (!existing) {
            const notif = await notificationRepository.create({
              type: "inventory_out_of_stock",
              title: `Sin stock: ${row.item_name}`,
              message: `${code} · Stock agotado (0 ${unit}). Requiere reposición inmediata.`,
              orderId: null,
              orderNumber: code,
              tableNumber: "Inventario",
              targetRole: "NON_MESERO",
              targetUserId: null,
              createdByUserId: Number(actorUser?.id) || null,
              metadata: {
                insumoId: Number(row.id),
                insumoCode: code,
                insumoName: row.item_name,
                currentStock,
                minStock,
                unitMeasure: unit,
                resolved: false,
              },
            });
            if (notif) created.push(notif);
          }
        } else if (minStock > 0 && currentStock <= minStock) {
          await notificationRepository.resolveStockNotificationsByInsumo(row.id, ["inventory_out_of_stock"]);
          const existing = await notificationRepository.findActiveStockNotification(row.id, "inventory_low_stock");
          if (!existing) {
            const notif = await notificationRepository.create({
              type: "inventory_low_stock",
              title: `Poco stock: ${row.item_name}`,
              message: `${code} · Quedan ${currentStock} ${unit} (mínimo: ${minStock} ${unit}). Reabastecer pronto.`,
              orderId: null,
              orderNumber: code,
              tableNumber: "Inventario",
              targetRole: "NON_MESERO",
              targetUserId: null,
              createdByUserId: Number(actorUser?.id) || null,
              metadata: {
                insumoId: Number(row.id),
                insumoCode: code,
                insumoName: row.item_name,
                currentStock,
                minStock,
                unitMeasure: unit,
                resolved: false,
              },
            });
            if (notif) created.push(notif);
          }
        } else {
          await notificationRepository.resolveStockNotificationsByInsumo(row.id);
        }
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    return created;
  },

  async syncLowStockNotificationsForOrder(orderId, actorUser = null) {
    const oid = Number(orderId);
    if (!Number.isInteger(oid) || oid <= 0) return [];
    const { rows } = await pool.query(
      `SELECT DISTINCT pi.insumo_id
       FROM order_items oi
       JOIN producto_insumos pi ON pi.producto_id = oi.product_id
       WHERE oi.order_id = $1;`,
      [oid]
    );
    const insumoIds = rows.map((r) => Number(r.insumo_id));
    return await this.syncInventoryStockAlertsByInsumoIds(insumoIds, actorUser);
  },

  async createWaiterCallNotification({ tableNumber, tableId } = {}) {
    const cleanTable = String(tableNumber || "").trim();
    const numericId = Number(tableId);

    if (!cleanTable && (!Number.isInteger(numericId) || numericId <= 0)) {
      const err = new Error("Debes seleccionar una mesa válida.");
      err.status = 400;
      throw err;
    }

    const { rows } = await pool.query(
      `SELECT
         t.id,
         t.table_number AS "tableNumber",
         EXISTS (
           SELECT 1
           FROM orders o
           WHERE (
             LOWER(TRIM(o.table_number)) = LOWER(TRIM(t.table_number))
             OR TRIM(o.table_number) = CAST(t.id AS VARCHAR)
           )
             AND LOWER(TRIM(COALESCE(o.status, ''))) NOT IN ('pagada', 'cerrada', 'anulada')
         ) AS "hasActiveOrder"
       FROM restaurant_tables t
       WHERE ($1::int IS NOT NULL AND t.id = $1)
          OR ($2::text <> '' AND LOWER(TRIM(t.table_number)) = LOWER(TRIM($2)))
       LIMIT 1;`,
      [Number.isInteger(numericId) && numericId > 0 ? numericId : null, cleanTable]
    );

    const table = rows[0];
    if (!table) {
      const err = new Error("La mesa seleccionada no existe.");
      err.status = 404;
      throw err;
    }

    if (table.hasActiveOrder) {
      const err = new Error("La mesa seleccionada está en uso actualmente.");
      err.status = 409;
      throw err;
    }

    const digitsMatch = String(table.tableNumber || "").match(/\d+/);
    const shortNum = digitsMatch ? digitsMatch[0] : String(table.tableNumber || "").trim();
    const spokenText = `Mesero solicitado a mesa ${shortNum}`;

    // Pre-calentar el audio MP3 en caché para respuesta instantánea al Mesero
    this.synthesizeSpeechBuffer(spokenText).catch(() => {});

    return await notificationRepository.create({
      type: "waiter_call",
      title: `Mesero solicitado a Mesa ${shortNum}`,
      message: `Un cliente solicita atención en la Mesa ${shortNum} desde el menú digital.`,
      tableNumber: String(table.tableNumber),
      targetRole: "Mesero",
      targetUserId: null,
      createdByUserId: null,
      metadata: {
        spokenText,
        tableShortNumber: shortNum,
        source: "public_menu",
        resolved: false,
      },
    });
  },

  async synthesizeSpeechBuffer(rawText) {
    const cleanText = String(rawText || "")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 160);

    if (!cleanText) {
      const err = new Error("Texto inválido.");
      err.status = 400;
      throw err;
    }

    if (ttsCache.has(cleanText)) {
      return ttsCache.get(cleanText);
    }

    const tts = new MsEdgeTTS();
    await tts.setMetadata(
      "es-CO-SalomeNeural",
      OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3
    );
    const { audioStream } = tts.toStream(cleanText, {
      rate: "-5%",
      pitch: "+2Hz",
      volume: "+120%",
    });
    const chunks = [];
    for await (const chunk of audioStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    if (ttsCache.size >= TTS_CACHE_LIMIT) {
      const oldestKey = ttsCache.keys().next().value;
      ttsCache.delete(oldestKey);
    }
    ttsCache.set(cleanText, buffer);
    return buffer;
  },
};
