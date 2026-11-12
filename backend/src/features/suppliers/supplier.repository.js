import { pool } from "../../config/db.js";

export const supplierRepository = {
    async create(supplierData) {
        const {
            supplierNit,
            supplierName,
            supplierEmail,
            supplierPhone,
            supplierDirection,
            supplierObservation,
            isActive = true,
        } = supplierData;

        const query = `
            INSERT INTO suppliers (
                nit,
                company_name,
                email,
                phone,
                address,
                observation,
                is_active
            )
            VALUES ($1,$2,$3,$4,$5,$6,$7)
            RETURNING *;
        `;

        const values = [
            supplierNit,
            supplierName,
            supplierEmail,
            supplierPhone,
            supplierDirection,
            supplierObservation,
            isActive,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async findAll() {
        const response = await pool.query("SELECT * FROM suppliers ORDER BY id ASC");
        return response.rows;
    },

    async findById(id) {
        const result = await pool.query(
            "SELECT * FROM suppliers WHERE id::text = $1::text OR nit = $1::text",
            [String(id)]
        );
        return result.rows[0] || null;
    },

    async update(id, data) {
        const {
            supplierNit,
            supplierName,
            supplierEmail,
            supplierPhone,
            supplierDirection,
            supplierObservation,
            isActive
        } = data;

        const query = `
            UPDATE suppliers
            SET nit = COALESCE($1, nit),
                company_name = COALESCE($2, company_name),
                email = COALESCE($3, email),
                phone = COALESCE($4, phone),
                address = COALESCE($5, address),
                observation = COALESCE($6, observation),
                is_active = COALESCE($7, is_active)
            WHERE id::text = $8::text OR nit = $8::text
            RETURNING *;
        `;
        const values = [
            supplierNit || data.nit || null,
            supplierName || data.company_name || null,
            supplierEmail || data.email || null,
            supplierPhone || data.phone || null,
            supplierDirection || data.address || null,
            supplierObservation || data.observation || null,
            isActive ?? data.is_active ?? null,
            String(id)
        ];
        const result = await pool.query(query, values);
        return result.rows[0];
    },

    async updateStatus(id, is_active) {
        const query = `
            UPDATE suppliers
            SET is_active = $1,
                updated_at = NOW()
            WHERE id::text = $2::text OR nit = $2::text
            RETURNING *;
        `;

        const values = [Boolean(is_active), String(id)];
        const result = await pool.query(query, values);
        return result.rows[0];
    }
};
