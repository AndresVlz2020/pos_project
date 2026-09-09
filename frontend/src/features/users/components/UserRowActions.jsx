// Iconos usados en los botones de acciones
import { Pencil, Trash2, Eye } from "lucide-react";

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
                onClick={() => navigate("/edituser")}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Editar usuario"
            >
                <Pencil size={15}/>
            </button>
            {/* Botón de eliminación */}
            <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Eliminar usuario"
            >     
                <Trash2 size={15}/>
            </button>
            <button
                onClick={() => navigate("/readuser")}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Ver usuario"
            >     
                <Eye size={15}/>
            </button>
        </div>

    )


}