import { pool } from "../../config/db.js";

export const inventoryRepository = {
  async findAll({ activeOnly = false, category = null } = {}) {
    const conditions = [];
    const values = [];

    if (activeOnly) {
      conditions.push("COALESCE(i.is_active, TRUE) = TRUE");
    }

    if (category) {
      values.push(category);
      conditions.push(`LOWER(i.category) = LOWER($${values.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT
        i.id,
        COALESCE(i.code, CONCAT('INV-', LPAD(i.id::text, 3, '0'))) AS code,
        i.item_name AS "productName",
        i.item_name,
        i.category AS "productCategory",
        i.category,
        COALESCE(i.brand, 'Genérica') AS brand,
        COALESCE(i.status, 'Activo') AS status,
        COALESCE(i.is_active, TRUE) AS "isActive",
        COALESCE(i.is_active, TRUE) AS is_active,
        i.current_stock::numeric AS "currentStock",
        i.current_stock::numeric AS current_stock,
        i.min_stock::numeric AS "minStock",
        i.min_stock::numeric AS min_stock,
        i.max_stock::numeric AS "maxStock",
        i.max_stock::numeric AS max_stock,
        i.unit_measure AS "unitMeasure",
        i.unit_measure,
        i.supplier_id,
        COALESCE(s.company_name, 'Proveedor no asignado') AS supplier,
        COALESCE(s.company_name, 'Proveedor no asignado') AS "supplierName",
        s.nit AS "supplierNit",
        i.location,
        COALESCE(i.price_buy, 0)::numeric AS "priceBuy",
        i.batch_number AS "numberBatch",
        i.batch_number,
        TO_CHAR(i.expiration_date, 'YYYY-MM-DD') AS "expirationDate",
        TO_CHAR(i.last_updated, 'YYYY-MM-DD') AS "lastUpdated",
        i.created_at
      FROM inventory i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      ${whereClause}
      ORDER BY i.id ASC;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const query = `
      SELECT
        i.id,
        COALESCE(i.code, CONCAT('INV-', LPAD(i.id::text, 3, '0'))) AS code,
        i.item_name AS "productName",
        i.item_name,
        i.category AS "productCategory",
        i.category,
        COALESCE(i.brand, 'Genérica') AS brand,
        COALESCE(i.status, 'Activo') AS status,
        COALESCE(i.is_active, TRUE) AS "isActive",
        COALESCE(i.is_active, TRUE) AS is_active,
        i.current_stock::numeric AS "currentStock",
        i.min_stock::numeric AS "minStock",
        i.max_stock::numeric AS "maxStock",
        i.unit_measure AS "unitMeasure",
        i.supplier_id,
        COALESCE(s.company_name, 'Proveedor no asignado') AS supplier,
        i.location,
        COALESCE(i.price_buy, 0)::numeric AS "priceBuy",
        i.batch_number AS "numberBatch",
        TO_CHAR(i.expiration_date, 'YYYY-MM-DD') AS "expirationDate",
        TO_CHAR(i.last_updated, 'YYYY-MM-DD') AS "lastUpdated"
      FROM inventory i
      LEFT JOIN suppliers s ON s.id = i.supplier_id
      WHERE i.id = $1 OR i.code = $1::text;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const {
      itemName,
      productName,
      category = "Insumos Secos",
      brand = "Genérica",
      currentStock = 0,
      minStock = 0,
      maxStock = 0,
      unitMeasure = "unidad",
      supplierId = null,
      supplierName = null,
      location = "Almacén Central",
      priceBuy = 0,
      batchNumber = null,
      expirationDate = null,
      code = null,
      status = "Activo",
      isActive = true,
    } = data;

    let targetSupplierId = supplierId;
    if (!targetSupplierId && supplierName) {
      const supRes = await pool.query(
        "SELECT id FROM suppliers WHERE LOWER(company_name) = LOWER($1) OR nit = $1 LIMIT 1",
        [supplierName]
      );
      if (supRes.rows[0]) targetSupplierId = supRes.rows[0].id;
    }

    const query = `
      INSERT INTO inventory (
        code,
        item_name,
        category,
        brand,
        current_stock,
        min_stock,
        max_stock,
        unit_measure,
        supplier_id,
        location,
        price_buy,
        batch_number,
        expiration_date,
        status,
        is_active,
        last_updated
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
      RETURNING
        id,
        COALESCE(code, CONCAT('INV-', LPAD(id::text, 3, '0'))) AS code,
        item_name AS "productName",
        item_name,
        category,
        brand,
        current_stock::numeric AS "currentStock",
        status,
        is_active AS "isActive";
    `;

    const values = [
      code,
      itemName || productName,
      category,
      brand,
      Number(currentStock) || 0,
      Number(minStock) || 0,
      Number(maxStock) || 0,
      unitMeasure,
      targetSupplierId,
      location,
      Number(priceBuy) || 0,
      batchNumber,
      expirationDate ? new Date(expirationDate) : null,
      status,
      Boolean(isActive),
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async update(id, data) {
    const current = await this.findById(id);
    if (!current) return null;

    const itemName = data.itemName || data.productName || current.productName;
    const category = data.category || data.productCategory || current.category;
    const brand = data.brand || current.brand;
    const currentStock = data.currentStock !== undefined ? Number(data.currentStock) : current.currentStock;
    const minStock = data.minStock !== undefined ? Number(data.minStock) : current.minStock;
    const maxStock = data.maxStock !== undefined ? Number(data.maxStock) : current.maxStock;
    const unitMeasure = data.unitMeasure || current.unitMeasure;
    const location = data.location || current.location;
    const priceBuy = data.priceBuy !== undefined ? Number(data.priceBuy) : current.priceBuy;
    const batchNumber = data.batchNumber || data.numberBatch || current.numberBatch;
    const expirationDate = data.expirationDate || current.expirationDate;
    const status = data.status || current.status;
    const isActive = data.isActive !== undefined ? Boolean(data.isActive) : (data.is_active !== undefined ? Boolean(data.is_active) : current.isActive);

    let supplierId = data.supplierId !== undefined ? data.supplierId : current.supplier_id;
    if (data.supplier && data.supplier !== current.supplier) {
      const supRes = await pool.query(
        "SELECT id FROM suppliers WHERE LOWER(company_name) = LOWER($1) OR nit = $1 LIMIT 1",
        [data.supplier]
      );
      if (supRes.rows[0]) supplierId = supRes.rows[0].id;
    }

    const query = `
      UPDATE inventory
      SET
        item_name = $1,
        category = $2,
        brand = $3,
        current_stock = $4,
        min_stock = $5,
        max_stock = $6,
        unit_measure = $7,
        supplier_id = $8,
        location = $9,
        price_buy = $10,
        batch_number = $11,
        expiration_date = $12,
        status = $13,
        is_active = $14,
        last_updated = NOW()
      WHERE id = $15
      RETURNING
        id,
        COALESCE(code, CONCAT('INV-', LPAD(id::text, 3, '0'))) AS code,
        item_name AS "productName",
        current_stock::numeric AS "currentStock",
        status,
        is_active AS "isActive";
    `;

    const values = [
      itemName,
      category,
      brand,
      currentStock,
      minStock,
      maxStock,
      unitMeasure,
      supplierId,
      location,
      priceBuy,
      batchNumber,
      expirationDate ? new Date(expirationDate) : null,
      status,
      isActive,
      current.id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateStatus(id, isActive) {
    const statusText = isActive ? "Activo" : "Inactivo";
    const query = `
      UPDATE inventory
      SET
        is_active = $1,
        status = $2,
        last_updated = NOW()
      WHERE id = $3 OR code = $3::text
      RETURNING
        id,
        COALESCE(code, CONCAT('INV-', LPAD(id::text, 3, '0'))) AS code,
        item_name,
        item_name AS "productName",
        is_active,
        is_active AS "isActive",
        status;
    `;
    const result = await pool.query(query, [Boolean(isActive), statusText, id]);
    return result.rows[0] || null;
  },
};
