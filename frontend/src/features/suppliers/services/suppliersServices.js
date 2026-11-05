// URL base del endpoint de usuarios en el backend
// En desarrollo apunta al servidor Express local
// En produccion deberia provenir de variables de entorno

//Funcion para crear un usuario en el backend 
import { API_URL } from "@/features/config"
// recibe un objeto con lo datos del usuario
const SUPPLIERS_URL = `${API_URL}/suppliers`;
// Retorna la respuesta JSON del servidor
export async function createSupplier(supplierData) {
    // Obtenemos el JWT almacenado en sessionStorage
    const token = sessionStorage.getItem("token");
    // Realizamos la peticion HTTP usando fetch 
    const response = await fetch(SUPPLIERS_URL,{
        // Metodo HTTP segun convencion REST
        method: "POST",
        // Cabeceras de la peticion 
        // Indicamos que enviamos JSON y añadimos el token de autorización
        headers: {
            "Content-Type" :  "application/json",
            "Authorization": `Bearer ${token}`,
        },
        // Convertimos el objeto userData a JSON
        body: JSON.stringify(supplierData),
    });
    // Verificamos si la respuesta NO fue exitosa (status!= 2xx)
    if (!response.ok){
    // Leemos el cuerpo de la respuesta error
        const error = await response.json();
        // Lanzamos una excepcion con el mensaje de error 
        // Esto permite que el componente que llama maneje el error con try/catch
        throw new Error (error.error || "Error al crear el proveedor")
    }
        // Si la petición fue exitosa, retornamos la respuesta parseada como json
        return response.json();
}

// Funcion para consultar todos los usuarios del backend
export async function getAllSuppliers() {
    // Obtenemos el JWT almacenado en sessionStorage
    const token = sessionStorage.getItem("token");

    // Realizamos la peticion HTTP
    const response = await fetch(SUPPLIERS_URL, {
        // Metodo HTTP para consultar usuarios
        method: "GET",
        // Cabeceras de la peticion
        headers: {
            "Authorization": `Bearer ${token}`,
        },
    });

    // Verificamos si la respuesta NO fue exitosa
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Error al consultar los proveedores");
    }

    // Retornamos los usuarios en formato JSON
    return response.json();
}

export async function updateSupplierStatus(id, is_active) {
    const token = sessionStorage.getItem("token"); // Se exporta la funcion que recibe 2 parametros id y el estado que puede ser true o false
    const response = await fetch(`${SUPPLIERS_URL}/${id}`, { // Le pega el id del usuario al final de la direccion
        method: "PATCH", // Le decimos al servidor que venimos a editar algo en especifico (cambiar el estado)
        headers: { "Content-type": "application/json", 
                   "Authorization" : `Bearer ${token}`
        }, // Le avisamos al servidor que el paquete viene en formato JSON 
        body: JSON.stringify({ is_active }) // Aqui va el valor del estado (true o false) en una cadena de texto en formato json para viajar por internet
    });

    const data = await response.json(); // El navegador recibe el paquete result.rows[0] enviado por el back listo para usarse

    if (!response.ok) {
        console.error("Detalle del error del backend:", data);
        throw new Error("Error al cambiar el estado"); // Si hay error todo se frena y si no se hace el cambio exitosamente
    }
    return data; // Es para que el cambio que hizo el servidor se vea reflejado en el front, lo recibe el componente de userColums y se ve estado del switch
}