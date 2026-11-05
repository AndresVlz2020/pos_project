// Importamos el servicio de usuarios
// El controller NO implementa logica de negocio,
// Solo delega la operacion al service correspondiente
import { supplierService } from "./supplier.service.js";

// Exportamos un objeto controlador.
// Agrupar handlers es un objeto permite escalabilidad
// (create, update, delete, getById, etc.)
export const supplierController = {

    // Metodo encargado de manejar la creacion de un usuario
    // Se asume que este metodo sera usado como handler de una ruta Express
    async create(req, res) {

        // Log del cuerpo de la peticion
        // Util en desarrollo para validar que el frontend envia correctamente los datos
        // En produccion suele reemplazarse por logging estructurado o eliminarse
        console.log("BODY RECIBIDO: ", req.body); // CLAVE

        try {
            // Llamamos al servicio de usuario, pasando los datos recibidos
            // Aqui ocurre la logica real del negocio (validaciones, persistencia, etc.)
            const supplier = await supplierService.createSupplier(req.body);

            // Respuesta HTTP en caso de exito
            // 201: recurso creado correctamente segun el estandar REST
            res.status(201).json({
                // Mensaje informativo para el cliente
                message: "Proveedor creado correctamente",

                // Retornamos unicamente el ID del usuario creado
                // Evita exponer informacion sensible innecesaria
                supplierID: supplier.id,
            });
        } catch (err) {
            // Capturamos cualquier error lanzado por el service o capas inferiores
            // Se registra el error completo para depuracion en backend
            console.error("ERROR BACKEND: ", err);

            // Respuesta HTTP de error generico
            // 500: error interno del servidor
            res.status(500).json({
                // Se envia el mensaje del error para diagnostico
                // En produccion suele mapearse a mensajes controlados
                error: err.message,
            })
        }
    },

    async getAll(req, res) {
        try {
            const suppliers = await supplierService.getAllSuppliers();
            res.status(200).json(suppliers);
        } catch (err) {
            console.error("ERROR BACKEND (GET SUPPLIERS): ", err);
            res.status(500).json({ error: err.message });
        }
    },

    async updateSupplierStatus(req, res) {
        try {
            const { id } = req.params; //  Trae la id que hay en el url del userService
            const { is_active } = req.body; // Trae el valor true o false para ponerlo en la bd

            const updatedSupplier = await supplierService.updateSupplierStatus(id, is_active); // Aqui lae ejecucion salta a lo que ya vimos en userService.js

            return res.status(200).json({
                message: "Estado actualizado",
                supplier: updatedSupplier
            }); // El user service hace su return del data y lo entrega al controlador, se guarda en updateUser y se guarda dentro de res enviandolos al navegador
        } catch (error) {
            return res.status(500).json({ error: error.message }) // Si hay un error lo atrapa, frena la ejecucion y le manda al navegador la respuesta 500 error interno del servidor
        }
    }
}