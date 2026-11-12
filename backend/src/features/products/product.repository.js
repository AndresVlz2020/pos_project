import { pool } from "../../config/db.js";

export const productRepository = {
  async findAll({ activeOnly = false, category = null } = {}) {
    const values = [];
    const conditions = [];

    if (activeOnly) {
      conditions.push("p.is_active = TRUE");
    }

    if (category && category !== "todos") {
      values.push(category.toLowerCase());
      conditions.push(`LOWER(COALESCE(c.name, '')) = $${values.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const query = `
      SELECT
        p.id,
        COALESCE(p.code, CONCAT('PROD-', LPAD(p.id::text, 3, '0'))) AS code,
        p.name AS title,
        p.name,
        p.description,
        p.price::numeric AS price,
        COALESCE(c.name, 'general') AS category,
        p.category_id,
        COALESCE(NULLIF(p.image_url, ''), '/assets/images/punta-de-anca-hd.jpg') AS image,
        COALESCE(NULLIF(p.image_url, ''), '/assets/images/punta-de-anca-hd.jpg') AS image_url,
        p.status,
        p.is_active,
        COALESCE(p.stock, 0)::numeric AS stock,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      ${whereClause}
      ORDER BY p.id ASC;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id) {
    const query = `
      SELECT
        p.id,
        COALESCE(p.code, CONCAT('PROD-', LPAD(p.id::text, 3, '0'))) AS code,
        p.name AS title,
        p.name,
        p.description,
        p.price::numeric AS price,
        COALESCE(c.name, 'general') AS category,
        p.category_id,
        COALESCE(NULLIF(p.image_url, ''), '/assets/images/punta-de-anca-hd.jpg') AS image,
        COALESCE(NULLIF(p.image_url, ''), '/assets/images/punta-de-anca-hd.jpg') AS image_url,
        p.status,
        p.is_active,
        COALESCE(p.stock, 0)::numeric AS stock,
        p.created_at,
        p.updated_at
      FROM products p
      LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.id = $1 OR p.code = $1::text;
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  },

  async create(data) {
    const {
      name,
      title,
      code,
      description,
      price,
      category,
      categoryId,
      imageUrl,
      status = "Disponible",
      isActive = true,
      stock = 0,
    } = data;

    const productName = name || title;

    let targetCategoryId = categoryId || null;
    if (!targetCategoryId && category) {
      const catRes = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1",
        [category]
      );
      if (catRes.rows[0]) {
        targetCategoryId = catRes.rows[0].id;
      }
    }

    const query = `
      INSERT INTO products (
        name,
        code,
        description,
        price,
        category_id,
        image_url,
        status,
        is_active,
        stock
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING
        id,
        COALESCE(code, CONCAT('PROD-', LPAD(id::text, 3, '0'))) AS code,
        name AS title,
        name,
        description,
        price::numeric AS price,
        image_url AS image,
        status,
        is_active,
        stock;
    `;

    const values = [
      productName,
      code || null,
      description || "",
      Number(price) || 0,
      targetCategoryId,
      imageUrl || null,
      status,
      Boolean(isActive),
      Number(stock) || 0,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async update(id, data) {
    const current = await this.findById(id);
    if (!current) return null;

    const name = data.name || data.title || current.name;
    const description = data.description !== undefined ? data.description : current.description;
    const price = data.price !== undefined ? Number(data.price) : current.price;
    const status = data.status || current.status;
    const isActive = data.is_active !== undefined ? Boolean(data.is_active) : (data.isActive !== undefined ? Boolean(data.isActive) : current.is_active);
    const stock = data.stock !== undefined ? Number(data.stock) : current.stock;
    const imageUrl = data.image || data.imageUrl || current.image;

    let categoryId = data.categoryId || current.category_id;
    if (data.category && (!data.categoryId || data.category !== current.category)) {
      const catRes = await pool.query(
        "SELECT id FROM categories WHERE LOWER(name) = LOWER($1) LIMIT 1",
        [data.category]
      );
      if (catRes.rows[0]) {
        categoryId = catRes.rows[0].id;
      }
    }

    const query = `
      UPDATE products
      SET
        name = $1,
        description = $2,
        price = $3,
        category_id = $4,
        image_url = $5,
        status = $6,
        is_active = $7,
        stock = $8,
        updated_at = NOW()
      WHERE id = $9
      RETURNING
        id,
        COALESCE(code, CONCAT('PROD-', LPAD(id::text, 3, '0'))) AS code,
        name AS title,
        name,
        description,
        price::numeric AS price,
        image_url AS image,
        status,
        is_active,
        stock;
    `;

    const values = [
      name,
      description,
      price,
      categoryId,
      imageUrl,
      status,
      isActive,
      stock,
      current.id,
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async updateStatus(id, isActive) {
    const statusText = isActive ? "Disponible" : "Inactivo";
    const query = `
      UPDATE products
      SET
        is_active = $1,
        status = $2,
        updated_at = NOW()
      WHERE id = $3 OR code = $3::text
      RETURNING
        id,
        COALESCE(code, CONCAT('PROD-', LPAD(id::text, 3, '0'))) AS code,
        name AS title,
        name,
        is_active,
        status;
    `;
    const result = await pool.query(query, [Boolean(isActive), statusText, id]);
    return result.rows[0] || null;
  },

  async getCategories() {
    const query = "SELECT id, name, description FROM categories WHERE is_active = TRUE ORDER BY name ASC;";
    const result = await pool.query(query);
    return result.rows;
  },
};
