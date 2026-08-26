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
            userPhone,
            userDocumentTypes,
            userDocumentNumber,
            userPassword,
            userAvatarUrl,
            userImage,
            isStaff = false,
            isActive = true,
            isSuperUser,
            isSuperuser,
        } = userData;

        const isSuper = isSuperuser !== undefined ? isSuperuser : (isSuperUser !== undefined ? isSuperUser : false);
        const avatar = userAvatarUrl || (typeof userImage === 'string' ? userImage : null);

        // Usar placeholders ($1, $2, ...) en la consulta SQL evita inyecciones SQL
        // RETURNING permite obtener datos generados por la base de datos
        const query = `
            INSERT INTO users (
                user_name,
                user_email,
                user_phone,
                user_document_types,
                user_document_number,
                user_password,
                user_avatar_url,
                is_staff,
                is_active,
                is_superuser
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING id, user_name, user_email, user_phone, user_document_types, user_document_number, is_staff, is_active, is_superuser, created_at;
        `;

        // Array de valores que se pasan al query
        // El orden coincide EXACTAMENTE con los placeholders en la consulta SQL
        const values = [
            userName,
            userEmail,
            userPhone,
            userDocumentTypes,
            userDocumentNumber,
            userPassword,
            avatar,
            isStaff,
            isActive,
            isSuper,
        ];

        // Ejecutamos la consulta usando el pool
        const result = await pool.query(query, values);

        // Devolvemos el registro retornado
        return result.rows[0];
    },

    // Método para listar todos los usuarios
    async findAll() {
        const query = `
            SELECT 
                id,
                user_name AS "userName",
                user_email AS "userEmail",
                user_phone AS "userPhone",
                user_document_types AS "userDocumentTypes",
                user_document_number AS "userDocumentNumber",
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
