// Importamos el pool de conexion a PostgreSQL
// Este pool es una instancia compartida configurada en la capa de infraestructura
import { pool } from "../../config/db.js";

// Exportamos el repositorio de usuarios
// El repository encapsula todos las consultas SQL relacionadas con users.
export const supplierRepository = {

    // Metodo encargado de crear un usuario en la base de datos
    // Recibe un objeto con los datos ya validados y procesados por el service
    async create(supplierData) {

        // Desestructuramos explicitamente las propiedades esperadas
        // Esto hace el contrato de datos claro y evita acceder a propiedades inexistentes
        const {
            supplierNit,
            supplierName,
            supplierEmail,
            supplierPhone,
            supplierDirection,
            supplierObservation,
            isActive = true,
        } = supplierData;

        // Usar placeholders ($1, $2, ...) previene inyecciones SQL
        // RETURNING permite obtener datos generados por la base de datos (id)
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

        // Array de valores que se pasan al query
        // El orden debe coincidir EXACTAMENTE con los placeholders del SQL
        const values = [
            supplierNit,
            supplierName,
            supplierEmail,
            supplierPhone,
            supplierDirection,
            supplierObservation,
            isActive,
        ]

        // Ejecutamos la consulta usando al query
        // pool.query retorna un objeto con metadata y filas resultantes
        const result = await pool.query(query, values);

        // Devolvemos unicamente el primer registro retornado
        // En este caso contiene el id del usuario recien creado
        return result.rows[0];
    },

    async findAll() {
        // Ejemplo con tu conexión a base de datos (PostgreSQL / pool / query)
        const response = await pool.query("SELECT * FROM suppliers ORDER BY id ASC"); // o el nombre de tu tabla
        return response.rows; // o el formato que devuelva tu consulta
    },

    async updateStatus(id, is_active) { // Declara la funcion que recibe los parametros que el service le mando
        // Se ejecuta la sentencia sql para actualizar solo el estado
        const query = `
            UPDATE suppliers
            SET is_active = $1
            WHERE id = $2
            RETURNING *;
        `; // En el arreglo iria en orden, values 1 el estado y 2 el id

        const values = [is_active, id] // Guarda el nuevo estado y el id del usuario
        const result = await pool.query(query, values); // Se le entrega la consulta y los valores a la BD y una vez los entrega de vuelta se guardan en result

        return result.rows[0]; // Para leer el objeto
    }
};