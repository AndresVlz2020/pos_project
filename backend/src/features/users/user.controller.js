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
            const user = await userService.create(req.body);

            res.status(201).json({
                success: true,
                message: "Usuario creado correctamente",
                userID: user.id,
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
            const activeOnly =
                req.query.active === "true" || req.query.activeOnly === "true";
            const users = await userService.getAll({ activeOnly });

            res.status(200).json(users);
        } catch (err) {
            console.error("❌ [Backend Error]:", err.message);

            res.status(500).json({
                success: false,
                message: "Error al obtener usuarios",
                error: err.message,
            });
        }
    },

    // Actualizar estado activo/inactivo de usuario en tiempo real
    async updateStatus(req, res) {
        try {
            const userId = Number(req.params.userId || req.params.id);
            const { isActive } = req.body;

            if (!userId || Number.isNaN(userId)) {
                return res.status(400).json({
                    error: "ID de usuario inválido",
                });
            }

            const updated = await userService.updateStatus(userId, Boolean(isActive));

            if (!updated) {
                return res.status(404).json({
                    error: "Usuario no encontrado",
                });
            }

            res.status(200).json({
                message: "Estado del usuario actualizado correctamente",
                user: updated,
            });
        } catch (error) {
            console.error("❌ [Backend Error UPDATE STATUS]:", error);
            res.status(500).json({
                error: "Error actualizando el estado del usuario",
            });
        }
    },

    // Permisos de usuario
    async getPermissionsByUserId(req, res) {
        try {
            const userId = Number(req.params.userId || req.params.id);
            const permissions = await userService.getPermissionsByUserId(userId);
            res.json(permissions);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Error obteniendo permisos del usuario",
            });
        }
    },

    // Actualizar permisos de usuario
    async updatePermissions(req, res) {
        try {
            const userId = Number(req.params.userId || req.params.id);
            const { permissionIds } = req.body;

            await userService.updatePermissions(userId, permissionIds);

            res.status(200).json({
                message: "Permisos del usuario actualizados correctamente",
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                error: "Error actualizando permisos del usuario",
            });
        }
    },
};
