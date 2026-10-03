import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InventoryRowActions({ item }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            <button
                onClick={() => navigate("/CreateInventory", { state: { item } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Editar insumo"
            >
                <Pencil size={15} />
            </button>
            <button
                onClick={() => navigate("/CreateInventory", { state: { item, readOnly: true } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver insumo"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}
