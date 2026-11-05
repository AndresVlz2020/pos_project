// El service es la capa donde vive la logica del negocio

// Importamos el repositorio de usuarios.
// El service depende del repository para acceder a la persistencia.

// pero el repository NO debe conocer el service.
import { supplierRepository } from "./supplier.repository.js";

// Exportamos el servicio de usuarios.
// El service representa la capa de lógica de negocio de la palicación.
export const supplierService = {

    // Método encargado de crear un usuario
    // Recibe datos provinientes del controller,
    // idealmente ya validados a nivel estructural (DTO / Schema)
    async createSupplier(data) {
    const supplierData = {
        ...data,
    };

    console.log("SERVICE DATA:", supplierData);
        // En este punto, en una arquitectura real, deberián, ocurrir:
        // - Validaciones de reglas de negocio
        // - Transformaciones de datos (ej: hash de password)
        // - Verificaciones de unicidad (email, documento, etc.)
        // - Decisiones de negocio (roles, flags, estados iniciales)

        // Actualmente, el método solo delega directamente al repository,
        // sin agregar ninguna lógica adicional
        return await supplierRepository.create(supplierData);
    },
    
// 🚀 NUEVO: Método encargado de obtener todos los usuarios
    async getAllSuppliers() {
        // Aquí puedes aplicar reglas de negocio adicionales si lo necesitas
        // (por ejemplo, filtrar datos sensibles o formatear fechas antes de devolverlos)
        
        // Llamamos al repositorio para traer los registros de la base de datos
        // Nota: Revisa si en tu userRepository el método se llama 'findAll', 'getAll' o 'find'
        const suppliers = await supplierRepository.findAll(); 
        
        return suppliers;
    },

    async updateSupplierStatus(id, is_active) { // Se declara la funcion que recibe dos parametros, id y el estado
        // Se llama a la bd para actualizar el estado
        const updated = await supplierRepository.updateStatus(id, is_active); // Le pasa los datos al repository
        return updated; // Aqui regresa con los datos y se guardan en updated para entregarselos al controller
    }
};