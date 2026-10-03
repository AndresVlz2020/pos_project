import { userRepository } from "./user.repository.js";
import bcrypt from "bcrypt";

export const userService = {
    // Método para crear un usuario
    async create(data) {
        const isAdmin = Boolean(
            data.isSuperuser || 
            data.isSuperUser || 
            data.userType === "admin" || 
            data.userType === "Admin"
        );

        if (isAdmin) {
            // Administrador: cuenta con contraseña hasheada, sin PIN
            const rawPassword = data.userPassword || "12345678";
            const hashedPassword = await bcrypt.hash(rawPassword, 10);

            return await userRepository.create({
                ...data,
                userPassword: hashedPassword,
                pin: null,
                isSuperuser: true,
                isStaff: true,
            });
        }

        // Personal operativo (mesero, cajero, cocina): acceso por PIN de terminal, sin contraseña
        return await userRepository.create({
            ...data,
            userPassword: null,
            pin: data.pin || "1234",
            isSuperuser: false,
            isStaff: true,
        });
    },

    // Alias compatible
    async createUser(data) {
        return await this.create(data);
    },

    // Método para listar usuarios
    async getAll() {
        return await userRepository.findAll();
    }
};
