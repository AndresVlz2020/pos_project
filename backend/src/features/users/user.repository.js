// Importamos el pool de conexión a PostgreSQL.
// Este pool es una instancia compartida configurada en la capa de infraestructura.
import { pool } from "../../config/db.js";

// Exportamos el repositorio de usuarios
// El repository encapsula todas las consultas SQL relacionadas con users.
export const userRepository = {
    // Método para crear un nuevo usuario en la base de datos
    // Recibe un objeto con los datos ya validados y procesados por el service.
    async create(userData) {
        // Desestructuramos explícitamente las propiedades esperadas
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

        const isSuper = isSuperuser !== undefined ? isSuperuser : (isSuperUser !== undefined ? isSuperUser : (userType === 'admin' || userType === 'Admin'));
        const staff = isStaff || userType === 'mesero' || userType === 'cajero' || userType === 'cocina';
        const avatar = userAvatarUrl || (typeof userImage === 'string' ? userImage : null);
        const parsedStartDate = startDate && startDate.trim() !== '' ? startDate : null;
        const parsedEndDate = endDate && endDate.trim() !== '' ? endDate : null;

        // Usar placeholders ($1, $2, ...) en la consulta SQL evita inyecciones SQL
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
                is_superuser
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
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
            staff,
            isActive,
            isSuper,
        ];

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Método para actualizar un usuario existente
    async update(id, userData) {
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

        const isSuper = isSuperuser !== undefined ? isSuperuser : (isSuperUser !== undefined ? isSuperUser : (userType === 'admin' || userType === 'Admin'));
        const staff = isStaff || userType === 'mesero' || userType === 'cajero' || userType === 'cocina';
        const avatar = userAvatarUrl || (typeof userImage === 'string' ? userImage : null);
        const parsedStartDate = startDate && startDate.trim() !== '' ? startDate : null;
        const parsedEndDate = endDate && endDate.trim() !== '' ? endDate : null;

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
                    user_avatar_url = COALESCE($12, user_avatar_url),
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
                    is_staff AS "isStaff", 
                    is_active AS "isActive", 
                    is_superuser AS "isSuperUser";
            `;
            values = [
                userName,
                userEmail,
                corporateEmail || userEmail,
                userPhone || null,
                userDocumentTypes || 'CC',
                userDocumentNumber,
                userPassword,
                pin || '1234',
                userType || 'mesero',
                parsedStartDate,
                parsedEndDate,
                avatar,
                staff,
                isActive,
                isSuper,
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
                    user_avatar_url = COALESCE($11, user_avatar_url),
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
                    is_staff AS "isStaff", 
                    is_active AS "isActive", 
                    is_superuser AS "isSuperUser";
            `;
            values = [
                userName,
                userEmail,
                corporateEmail || userEmail,
                userPhone || null,
                userDocumentTypes || 'CC',
                userDocumentNumber,
                pin || '1234',
                userType || 'mesero',
                parsedStartDate,
                parsedEndDate,
                avatar,
                staff,
                isActive,
                isSuper,
                id,
            ];
        }

        const result = await pool.query(query, values);
        return result.rows[0];
    },

    // Método para listar todos los usuarios
    async findAll() {
        const query = `
            SELECT 
                id,
                user_name AS "userName",
                user_name AS "name",
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
                created_at AS "createdAt"
            FROM users
            ORDER BY id ASC;
        `;
        const result = await pool.query(query);
        return result.rows;
    }
};
