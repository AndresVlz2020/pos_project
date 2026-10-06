// Importamos el servicio de usuarios
// El controller no implementa lógica de negocio,
// Solo delega la operación al service correspondiente.
import { userService } from "./user.service.js";

// Exportamos un objeto controlador con handlers escalables
export const userController = {
    // Método encargado de manejar la creación de un usuario
    async create(req, res) {
        console.log("📥 [Backend] POST /api/users - Datos recibidos:", req.body);

        try {
            // Llamamos al servicio de usuario con los datos recibidos
            const user = await userService.create(req.body);

            // Respuesta HTTP 201 (Created)
            res.status(201).json({
                success: true,
                message: "Usuario creado correctamente",
                data: user,
            });

        } catch (err) {
            console.error("❌ [Backend Error]:", err.message);

            res.status(500).json({
                success: false,
                message: "Error al crear el usuario",
                error: err.message,
            });
        }
    },

    // Método encargado de actualizar un usuario existente
    async update(req, res) {
        const { id } = req.params;
        console.log(`📥 [Backend] PUT /api/users/${id} - Datos recibidos:`, req.body);

        try {
            const user = await userService.update(id, req.body);

            res.status(200).json({
                success: true,
                message: "Usuario actualizado correctamente",
                data: user,
            });
        } catch (err) {
            console.error("❌ [Backend Error]:", err.message);

            res.status(500).json({
                success: false,
                message: "Error al actualizar el usuario",
                error: err.message,
            });
        }
    },

    // Método encargado de listar todos los usuarios
    async getAll(req, res) {
        console.log("📥 [Backend] GET /api/users");

        try {
            const users = await userService.getAll();

            res.status(200).json({
                success: true,
                data: users,
            });

        } catch (err) {
            console.error("❌ [Backend Error]:", err.message);

            res.status(500).json({
                success: false,
                message: "Error al obtener usuarios",
                error: err.message,
            });
        }
    }
};
