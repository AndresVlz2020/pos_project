import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InventoryRowActions({ item }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        navigate(`/inventory/${item.id}/edit`);
    };

    const handleDelete = () => {
        console.log("Eliminar registro de inventario", item.id);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={handleEdit}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Editar inventario"
            >
                <Pencil size={15} />
            </button>
            <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Eliminar inventario"
            >
                <Trash2 size={15} />
            </button>
        </div>
    );
}
