// Iconos usados en los botones de acciones
import { Pencil, Trash2 } from "lucide-react";

// Hook de react router para navegar programáticamente ennntre rutas
import { useNavigate } from "react-router-dom";

// Componente que renderiza las acciones de cada fila de usuario
// Recibe como prop el objeto user
export default function UserRowActions({ user }) {
    
    // const handleEdit = () => {
    // console.log("Editar usuario", user.id)
    // };

    // Hook que permite redirigir a otra ruta desde código
    const navigate = useNavigate();

    // Acción para editar el usuario
    // Redirige a la página de edición usando el id del usuario
    const handleEdit = () => {       
         navigate(`/users/${user.id}/edit`);
        
    };
    
    // Acción para eliminar el usuario
    // Actualmente solo se imprime en consola
    // Redirige a la página de edición usando el id del usuario
    const handleDelete = () => {       
        console.log("Eliminar usuario", user.id);
    };

    return (
        // Contenedor de botones de acciones
        <div className="flex gap-2">
            {/* Botón de edición */}
            <button
                onClick={handleEdit} // Ejecuta la acción de edición
                className="btn btn-primary" 
            >
                <Pencil size={16}/> {/* Icono de edición */}
            </button>
            {/* Botón de eliminación */}
            <button
                onClick={handleDelete} // Ejecuta la acción de eliminación
                className="p-1 rounded hover:bg-gray-100"
            >     
            <Trash2 size={16}/> {/* Icono de eliminación */}
            </button>
        </div>

    )


}