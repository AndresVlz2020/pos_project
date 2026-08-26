// Importamos la instancia de la aplicacion Express ya configurada
// app.js debe encargarse de middlewares, rutas y configuraciones generales
import app from "./app.js";

// Importamos dotenv para cargar variables de entorno desde un archivo .env
import dotenv from "dotenv";

// Ejecutamos la carga de variables de entorno
// Esto debe hacerse antes de usar process.env  

dotenv.config();

// Definimos el puerto del servidor
// Se prioriza el valor definido en el entorno (producción)
// Y se usa 4000 como valor por defecto en desarrollo

const PORT = process.env.PORT || 4000;

// Iniciamos el servidor HTTP usando la app Express
// Listen levanta el servidor y queda a la espera de las peticiones
app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
}); 