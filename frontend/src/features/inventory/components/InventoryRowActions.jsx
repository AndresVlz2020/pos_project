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
                className="btn btn-primary"
            >
                <Pencil size={16} />
            </button>
            <button
                onClick={handleDelete}
                className="p-1 rounded hover:bg-gray-100"
            >
                <Trash2 size={16} />
            </button>
        </div>
    );
}
