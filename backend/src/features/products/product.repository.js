import { pool } from "../../config/db.js";
import { parseBooleanFlag } from "../../middlewares/upload.middleware.js";

const PRODUCT_SELECT_QUERY = `
  SELECT
    p.id,
    COALESCE(p.code, CONCAT('PROD-', LPAD(p.id::text, 3, '0'))) AS code,
    p.name AS title,
    p.name,
    p.description,
    p.price::numeric AS price,
    COALESCE(c.name, 'general') AS category,
    p.category_id,
    NULLIF(p.image_url, '') AS image,
    NULLIF(p.image_url, '') AS image_url,
    p.status,
    p.is_active,
    CASE
      WHEN COALESCE(recipe_calc.recipe_count, 0) > 0
        THEN recipe_calc.calculated_stock
      ELSE COALESCE(p.stock, 0)::numeric
    END AS stock,
    COALESCE(p.stock, 0)::numeric AS "directStock",
    CASE
      WHEN COALESCE(recipe_calc.recipe_count, 0) > 0 THEN 'recipe'
      ELSE 'direct'
    END AS "stockMode",
    (COALESCE(recipe_calc.recipe_count, 0) > 0) AS "hasRecipe",
    COALESCE(recipe_calc.ingredients, '[]'::json) AS ingredients,
    p.created_at,
    p.updated_at
  FROM products p
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN LATERAL (
    SELECT
      COUNT(*)::int AS recipe_count,
      COALESCE(
        MIN(FLOOR(GREATEST(COALESCE(i.current_stock, 0), 0) / pi.cantidad_requerida))::int,
        0
      ) AS calculated_stock,
      json_agg(
        json_build_object(
          'id', pi.id,
          'insumoId', pi.insumo_id,
          'insumo_id', pi.insumo_id,
          'cantidadRequerida', pi.cantidad_requerida::numeric,
          'cantidad_requerida', pi.cantidad_requerida::numeric,
          'code', COALESCE(i.code, CONCAT('INV-', LPAD(i.id::text, 3, '0'))),
          'itemName', i.item_name,
          'unitMeasure', i.unit_measure,
          'currentStock', COALESCE(i.current_stock, 0)::numeric,
          'isActive', COALESCE(i.is_active, TRUE)
        )
        ORDER BY pi.id ASC
      ) AS ingredients
    FROM producto_insumos pi
    INNER JOIN inventory i ON i.id = pi.insumo_id
    WHERE pi.producto_id = p.id
  ) recipe_calc ON TRUE
`;

async function syncProductIngredients(client, productId, ingredients) {
  await client.query("DELETE FROM producto_insumos WHERE producto_id = $1;", [
    productId,
  ]);

  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return;
  }

  const insumoIds = ingredients.map((item) => item.insumoId);
  const existingInv = await client.query(
    "SELECT id FROM inventory WHERE id = ANY($1::int[]);",
    [insumoIds]
  );
  const validSet = new Set(existingInv.rows.map((r) => Number(r.id)));

  for (const item of ingredients) {
    if (!validSet.has(item.insumoId)) {
      throw new Error(
        `El insumo con ID ${item.insumoId} no existe en el inventario.`
      );
    }
    await client.query(
      `INSERT INTO producto_insumos (producto_id, insumo_id, cantidad_requerida, updated_at)
       VALUES ($1, $2, $3, NOW());`,
      [productId, item.insumoId, item.cantidadRequerida]
    );
  }
}

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
      ${PRODUCT_SELECT_QUERY}
      ${whereClause}
      ORDER BY p.id ASC;
    `;

    const result = await pool.query(query, values);
    return result.rows;
  },

  async findById(id, dbClient = pool) {
    const query = `
      ${PRODUCT_SELECT_QUERY}
      WHERE (CASE WHEN $1::text ~ '^[0-9]+$' THEN p.id = $1::int ELSE FALSE END)
         OR p.code = $1::text;
    `;
    const result = await dbClient.query(query, [String(id)]);
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
      ingredients = [],
    } = data;

    const productName = name || title;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let targetCategoryId = categoryId || null;
      if (!targetCategoryId && category) {
        const catRes = await client.query(
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
        RETURNING id;
      `;

      const stock = 0;

      const values = [
        productName,
        code || null,
        description || "",
        Number(price) || 0,
        targetCategoryId,
        imageUrl || null,
        status,
        parseBooleanFlag(isActive),
        stock,
      ];

      const result = await client.query(query, values);
      const createdId = result.rows[0].id;

      if (Array.isArray(ingredients) && ingredients.length > 0) {
        await syncProductIngredients(client, createdId, ingredients);
      }

      await client.query("COMMIT");
      return await this.findById(createdId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  },

  async update(id, data) {
    const current = await this.findById(id);
    if (!current) return null;

    const name = data.name || data.title || current.name;
    const description = data.description !== undefined ? data.description : current.description;
    const price = data.price !== undefined ? Number(data.price) : current.price;
    const status = data.status || current.status;
    const isActive =
      data.is_active !== undefined
        ? parseBooleanFlag(data.is_active)
        : data.isActive !== undefined
        ? parseBooleanFlag(data.isActive)
        : current.is_active;
    const incomingImage = data.imageUrl !== undefined ? data.imageUrl : data.image;
    const imageUrl = incomingImage !== undefined
      ? (incomingImage && String(incomingImage).trim() ? String(incomingImage).trim() : null)
      : (current.image_url || null);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      let categoryId = data.categoryId || current.category_id;
      if (data.category && (!data.categoryId || data.category !== current.category)) {
        const catRes = await client.query(
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
          updated_at = NOW()
        WHERE id = $8;
      `;

      await client.query(query, [
        name,
        description,
        price,
        categoryId,
        imageUrl,
        status,
        isActive,
        current.id,
      ]);

      if (data.shouldSyncRecipe) {
        await syncProductIngredients(client, current.id, data.ingredients || []);
      }

      await client.query("COMMIT");
      return await this.findById(current.id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
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
