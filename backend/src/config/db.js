// Importamos el paquete 'pg' usando el sistema de módulos ES
import pkg from 'pg';

// Extraemos la clase Pool desde el paquete
// Pool gestiona un conjunto de conexiones reutilizables a la BD.
const { Pool } = pkg;

// Importamos dotenv para poder leer variables de entorno desde un archivo .env
import dotenv from 'dotenv';

// Cargamos las variables definidas en el archivo .env  
dotenv.config();

// Creamos y exportamos una instancia única del pool de PostgreSQL
// Esta instancia se reutilizará en toda la aplicación
export const pool = new Pool({
    // Host donde se encuentra PostgreSQL (ej: localhost o IP del servidor)
    host: process.env.DB_HOST || 'localhost',

    // Puerto donde se encuentra PostgreSQL
    port: Number(process.env.DB_PORT) || 5432,

    // Usuario con permisos sobre la base de datos
    user: process.env.DB_USER || 'postgres',

    // Contraseña del usuario
    password: process.env.DB_PASSWORD || '',

    // Nombre de la base de datos a la que nos conectamos
    database: process.env.DB_NAME || 'pos_db',

    // Número máximo de conexiones activas en el pool
    max: 10,

    // Tiempo máximo (en ms) que una conexión puede estar inactiva antes de ser cerrada automáticamente 
    idleTimeoutMillis: 30000,
});

// Evento que se dispara cada vez que el pool establece una conexión útil para logs y verificación en desarrollo
pool.on("connect", () => {
    console.log('✅ Conectado a PostgreSQL (POS DB)');
});

// Evento que se dispara cada vez que ocurre un error en el pool
pool.on("error", (err) => {
    console.error('❌ Error en el pool de PostgreSQL:', err.message);
});
    