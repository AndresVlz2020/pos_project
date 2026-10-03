import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function UserRowActions({ user }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            {/* Botón de edición */}
            <button
                onClick={() => navigate("/edituser", { state: { user } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Editar usuario"
            >
                <Pencil size={15}/>
            </button>
            {/* Botón de visualización */}
            <button
                onClick={() => navigate("/readuser", { state: { user } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver usuario"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}