// Importamos el pool de conexión a PostgreSQL.
// Este pool es una instancia compartida configurada en la capa de infraestructura.
import { pool } from "../../config/db.js";
import { parseBooleanFlag } from "../../middlewares/upload.middleware.js";

function resolveGroupNameFromUserType(userType, isSuper) {
    if (isSuper) return "Administrador";
    const t = String(userType || "").toLowerCase();
    if (t.includes("admin")) return "Administrador";
    if (t.includes("caj")) return "Cajero";
    if (t.includes("cocin") || t.includes("parrill")) return "Cocina";
    return "Mesero";
}

// Exportamos el repositorio de usuarios
// El repository encapsula todas las consultas SQL relacionadas con users.
export const userRepository = {
    async syncUserGroup(userId, userType, isSuper) {
        try {
            const groupName = resolveGroupNameFromUserType(userType, isSuper);
            const groupRes = await pool.query(
                `SELECT group_id FROM groups WHERE group_name = $1 LIMIT 1`,
                [groupName]
            );
            const groupId = groupRes.rows[0]?.group_id;
            if (!groupId) return;

            await pool.query(`DELETE FROM user_groups WHERE user_id = $1`, [userId]);
            await pool.query(
                `INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
                [userId, groupId]
            );
            await pool.query(
                `
                INSERT INTO user_permissions (user_id, permission_id)
                SELECT $1, gp.permission_id
                FROM group_permissions gp
                WHERE gp.group_id = $2
                ON CONFLICT DO NOTHING
                `,
                [userId, groupId]
            );
        } catch (err) {
            console.warn("Aviso sincronizando grupo de usuario:", err.message);
        }
    },

    // Método para crear un nuevo usuario en la base de datos
    // Recibe un objeto con los datos ya validados y procesados por el service.
    async create(userData) {
        const {
            userName,
            userEmail,
            corporateEmail,
            userPhone,
            userDocumentTypes,
            userDocumentNumber,
            userPassword,
            pin,
            userType,
            startDate,
            endDate,
            userAvatarUrl,
            userImage,
            isStaff = false,
            isActive = true,
            isSuperUser,
            isSuperuser,
        } = userData;

        const isSuper = isSuperuser !== undefined
            ? parseBooleanFlag(isSuperuser)
            : (isSuperUser !== undefined
                ? parseBooleanFlag(isSuperUser)
                : (userType === 'admin' || userType === 'Admin'));
        const staff =
            (isStaff !== undefined && parseBooleanFlag(isStaff)) ||
            userType === 'mesero' ||
            userType === 'cajero' ||
            userType === 'cocina';
        const avatar = userAvatarUrl || (typeof userImage === 'string' && userImage.trim() ? userImage.trim() : null);
        const parsedStartDate = startDate && startDate.trim() !== '' ? startDate : null;
        const parsedEndDate = endDate && endDate.trim() !== '' ? endDate : null;

        const query = `
            INSERT INTO users (
                user_name,
                user_email,
                corporate_email,
                user_phone,
                user_document_types,
                user_document_number,
                user_password,
                pin,
                user_type,
                start_date,
                end_date,
                user_avatar_url,
                is_staff,
                is_active,
                is_superuser,
                data_consent_accepted_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW())
            RETURNING 
                id, 
                user_name AS "userName", 
                user_email AS "userEmail", 
                corporate_email AS "corporateEmail",
                user_phone AS "userPhone", 
                user_document_types AS "userDocumentTypes", 
                user_document_number AS "userDocumentNumber", 
                pin,
                user_type AS "userType",
                start_date AS "startDate",
                end_date AS "endDate",
                user_avatar_url AS "userAvatarUrl",
                is_staff AS "isStaff", 
                is_active AS "isActive", 
                is_superuser AS "isSuperUser", 
                created_at AS "createdAt";
        `;

        const values = [
            userName,
            userEmail,
            corporateEmail || userEmail,
            userPhone || null,
            userDocumentTypes || 'CC',
            userDocumentNumber,
            userPassword || null,
            pin || '1234',
            userType || 'mesero',
            parsedStartDate,
            parsedEndDate,
            avatar,
            parseBooleanFlag(staff),
            isActive !== undefined ? parseBooleanFlag(isActive) : true,
            parseBooleanFlag(isSuper),
        ];

        const result = await pool.query(query, values);
        const created = result.rows[0];
        if (created?.id) {
            await this.syncUserGroup(created.id, userType, isSuper);
        }
        return created;
    },

    async findAvatarById(id) {
        const result = await pool.query(
            `SELECT user_avatar_url AS "userAvatarUrl" FROM users WHERE id = $1 LIMIT 1`,
            [id]
        );
        return result.rows[0]?.userAvatarUrl || null;
    },

    // Método para actualizar un usuario existente
    // Fusiona los campos recibidos con el registro actual: permite actualización parcial
    // sin pisar datos guardados (antes, un PUT incompleto anulaba user_email → 500).
    async update(id, userData) {
        // 1) Traer el registro actual para fusionar
        const currentResult = await pool.query(
            `SELECT id, user_name, user_email, corporate_email, user_phone,
                    user_document_types, user_document_number, user_password, pin,
                    user_type, start_date, end_date, user_avatar_url,
                    is_staff, is_active, is_superuser
             FROM users WHERE id = $1 LIMIT 1`,
            [id]
        );
        const current = currentResult.rows[0];
        if (!current) return null;

        const parseNullableDate = (incoming, fallback) => {
            if (incoming === undefined) return fallback;   // campo ausente: conservar
            if (incoming === null) return null;            // limpiar explícitamente
            const s = String(incoming).trim();
            return s === '' ? null : s;
        };

        // 2) Fusionar campo a campo (undefined = conservar valor actual)
        const merged = {
            userName: userData.userName ?? current.user_name,
            userEmail: userData.userEmail ?? current.user_email,
            corporateEmail: userData.corporateEmail ?? current.corporate_email,
            userPhone: userData.userPhone ?? current.user_phone,
            userDocumentTypes: userData.userDocumentTypes ?? current.user_document_types,
            userDocumentNumber: userData.userDocumentNumber ?? current.user_document_number,
            pin: userData.pin ?? current.pin,
            userType: userData.userType ?? current.user_type,
            startDate: parseNullableDate(userData.startDate, current.start_date),
            endDate: parseNullableDate(userData.endDate, current.end_date),
            avatar: (() => {
                const hasIncomingAvatar =
                    userData.userAvatarUrl !== undefined || typeof userData.userImage === 'string';
                if (!hasIncomingAvatar) return current.user_avatar_url;
                const rawIncoming =
                    userData.userAvatarUrl !== undefined ? userData.userAvatarUrl : userData.userImage;
                return rawIncoming && String(rawIncoming).trim() ? String(rawIncoming).trim() : null;
            })(),
            isStaff: userData.isStaff !== undefined ? parseBooleanFlag(userData.isStaff) : current.is_staff,
            isActive: userData.isActive !== undefined ? parseBooleanFlag(userData.isActive) : current.is_active,
            isSuper: userData.isSuperuser !== undefined ? parseBooleanFlag(userData.isSuperuser)
                : userData.isSuperUser !== undefined ? parseBooleanFlag(userData.isSuperUser)
                : (userData.userType !== undefined ? (userData.userType === 'admin' || userData.userType === 'Admin') : current.is_superuser),
        };

        const userPassword = userData.userPassword || null;

        let query;
        let values;

        if (userPassword) {
            query = `
                UPDATE users SET
                    user_name = $1,
                    user_email = $2,
                    corporate_email = $3,
                    user_phone = $4,
                    user_document_types = $5,
                    user_document_number = $6,
                    user_password = $7,
                    pin = $8,
                    user_type = $9,
                    start_date = $10,
                    end_date = $11,
                    user_avatar_url = $12,
                    is_staff = $13,
                    is_active = $14,
                    is_superuser = $15
                WHERE id = $16
                RETURNING 
                    id, 
                    user_name AS "userName", 
                    user_email AS "userEmail", 
                    corporate_email AS "corporateEmail",
                    pin,
                    user_type AS "userType",
                    user_avatar_url AS "userAvatarUrl",
                    NULLIF(user_avatar_url, '') AS "photo",
                    is_staff AS "isStaff", 
                    is_active AS "isActive", 
                    is_superuser AS "isSuperUser";
            `;
            values = [
                merged.userName,
                merged.userEmail,
                merged.corporateEmail || merged.userEmail,
                merged.userPhone || null,
                merged.userDocumentTypes || 'CC',
                merged.userDocumentNumber,
                userPassword,
                merged.pin || '1234',
                merged.userType || 'mesero',
                merged.startDate,
                merged.endDate,
                merged.avatar,
                merged.isStaff,
                merged.isActive,
                merged.isSuper,
                id,
            ];
        } else {
            query = `
                UPDATE users SET
                    user_name = $1,
                    user_email = $2,
                    corporate_email = $3,
                    user_phone = $4,
                    user_document_types = $5,
                    user_document_number = $6,
                    pin = $7,
                    user_type = $8,
                    start_date = $9,
                    end_date = $10,
                    user_avatar_url = $11,
                    is_staff = $12,
                    is_active = $13,
                    is_superuser = $14
                WHERE id = $15
                RETURNING 
                    id, 
                    user_name AS "userName", 
                    user_email AS "userEmail", 
                    corporate_email AS "corporateEmail",
                    pin,
                    user_type AS "userType",
                    user_avatar_url AS "userAvatarUrl",
                    NULLIF(user_avatar_url, '') AS "photo",
                    is_staff AS "isStaff", 
                    is_active AS "isActive", 
                    is_superuser AS "isSuperUser";
            `;
            values = [
                merged.userName,
                merged.userEmail,
                merged.corporateEmail || merged.userEmail,
                merged.userPhone || null,
                merged.userDocumentTypes || 'CC',
                merged.userDocumentNumber,
                merged.pin || '1234',
                merged.userType || 'mesero',
                merged.startDate,
                merged.endDate,
                merged.avatar,
                merged.isStaff,
                merged.isActive,
                merged.isSuper,
                id,
            ];
        }

        const result = await pool.query(query, values);
        const updated = result.rows[0];
        if (updated?.id) {
            await this.syncUserGroup(updated.id, merged.userType, merged.isSuper);
        }
        return updated;
    },

    // Método para listar todos los usuarios
    async findAll({ activeOnly = false } = {}) {
        const query = `
            SELECT 
                id,
                user_name AS "userName",
                user_name AS "name",
                user_email AS "userEmail",
                user_email AS "email",
                corporate_email AS "corporateEmail",
                user_phone AS "userPhone",
                user_phone AS "phone",
                user_document_types AS "userDocumentTypes",
                user_document_types AS "document_type",
                user_document_number AS "userDocumentNumber",
                user_document_number AS "document_number",
                pin,
                user_type AS "userType",
                CASE
                    WHEN is_superuser = TRUE OR LOWER(COALESCE(user_type, '')) IN ('admin', 'administrador') THEN 'Administrador'
                    WHEN LOWER(COALESCE(user_type, '')) IN ('cajero', 'caja') THEN 'Cajero'
                    WHEN LOWER(COALESCE(user_type, '')) IN ('cocina', 'cocinero', 'parrilla') THEN 'Cocina'
                    ELSE 'Mesero'
                END AS "role",
                start_date AS "startDate",
                end_date AS "endDate",
                user_avatar_url AS "userAvatarUrl",
                NULLIF(user_avatar_url, '') AS "photo",
                NULLIF(user_avatar_url, '') AS "avatar",
                NULLIF(user_avatar_url, '') AS "image",
                is_staff AS "isStaff",
                COALESCE(is_active, TRUE) AS "isActive",
                is_superuser AS "isSuperUser",
                created_at AS "createdAt"
            FROM users
            WHERE ($1::boolean IS FALSE OR COALESCE(is_active, TRUE) = TRUE)
            ORDER BY id ASC;
        `;
        const result = await pool.query(query, [Boolean(activeOnly)]);
        return result.rows;
    },

    async findById(id) {
        const query = `
            SELECT 
                id,
                user_name AS "userName",
                user_name AS "name",
                user_email AS "userEmail",
                user_email AS "email",
                corporate_email AS "corporateEmail",
                user_phone AS "userPhone",
                user_phone AS "phone",
                user_document_types AS "userDocumentTypes",
                user_document_types AS "document_type",
                user_document_number AS "userDocumentNumber",
                user_document_number AS "document_number",
                pin,
                user_type AS "userType",
                CASE
                    WHEN is_superuser = TRUE OR LOWER(COALESCE(user_type, '')) IN ('admin', 'administrador') THEN 'Administrador'
                    WHEN LOWER(COALESCE(user_type, '')) IN ('cajero', 'caja') THEN 'Cajero'
                    WHEN LOWER(COALESCE(user_type, '')) IN ('cocina', 'cocinero', 'parrilla') THEN 'Cocina'
                    ELSE 'Mesero'
                END AS "role",
                start_date AS "startDate",
                end_date AS "endDate",
                user_avatar_url AS "userAvatarUrl",
                NULLIF(user_avatar_url, '') AS "photo",
                NULLIF(user_avatar_url, '') AS "avatar",
                NULLIF(user_avatar_url, '') AS "image",
                is_staff AS "isStaff",
                COALESCE(is_active, TRUE) AS "isActive",
                is_superuser AS "isSuperUser",
                data_consent_accepted_at AS "dataConsentAcceptedAt",
                created_at AS "createdAt"
            FROM users
            WHERE id = $1;
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0] || null;
    },

    // Actualizar estado activo/inactivo del usuario en PostgreSQL en tiempo real
    async updateStatus(userId, isActive) {
        const query = `
            UPDATE users
            SET is_active = $1,
                updated_at = NOW()
            WHERE id = $2
            RETURNING id, is_active AS "isActive";
        `;
        const result = await pool.query(query, [Boolean(isActive), userId]);
        return result.rows[0];
    },

    // Obtener permisos directos del usuario por ID
    async getPermissionsByUserId(userId) {
        const directQuery = `
            SELECT
                p.permission_id,
                p.permission_name,
                p.permission_codename
            FROM user_permissions up
            INNER JOIN permissions p
                ON p.permission_id = up.permission_id
            WHERE up.user_id = $1
            ORDER BY p.permission_name;
        `;

        const directResult = await pool.query(directQuery, [userId]);

        if (directResult.rows.length > 0) {
            return directResult.rows;
        }

        // Si aún no tiene permisos directos en user_permissions, consultar los heredados de su grupo
        const groupQuery = `
            SELECT DISTINCT
                p.permission_id,
                p.permission_name,
                p.permission_codename
            FROM group_permissions gp
            INNER JOIN user_groups ug
                ON ug.group_id = gp.group_id
            INNER JOIN permissions p
                ON p.permission_id = gp.permission_id
            WHERE ug.user_id = $1
            ORDER BY p.permission_name;
        `;
        const groupResult = await pool.query(groupQuery, [userId]);
        return groupResult.rows;
    },

    // Actualizar permisos directos del usuario
    async updatePermissions(userId, permissionIds) {
        const client = await pool.connect();

        try {
            await client.query("BEGIN");

            await client.query(
                `
                DELETE FROM user_permissions
                WHERE user_id = $1
                `,
                [userId],
            );

            for (const permissionId of permissionIds) {
                await client.query(
                    `
                    INSERT INTO user_permissions (
                        user_id,
                        permission_id
                    )
                    VALUES ($1, $2)
                    `,
                    [userId, permissionId],
                );
            }

            await client.query("COMMIT");
        } catch (error) {
            await client.query("ROLLBACK");
            throw error;
        } finally {
            client.release();
        }
    },
};
