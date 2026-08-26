// Importamos el repositorio de usuarios
// El service depende del repositorio para acceder a la persistencia
// Pero el repository no debe conocer el service
import { userRepository } from "./user.repository.js";

// Servicio encargado de la lógica de negocio de usuarios
export const userService = {
    // Método para crear un usuario
    async create(data) {
        // En este punto se aplican validaciones de negocio, transformaciones, etc.
        return await userRepository.create(data);
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
