import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function InventoryRowActions({ item, canEdit = true }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            {canEdit && (
                <button
                    type="button"
                    onClick={() => navigate("/CreateInventory", { state: { item } })}
                    aria-label="Editar insumo"
                    className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
                    title="Editar insumo"
                >
                    <Pencil size={15} />
                </button>
            )}
            <button
                type="button"
                onClick={() => navigate("/readinventory", { state: { item } })}
                aria-label="Ver insumo"
                className="size-9 inline-flex items-center justify-center rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver insumo"
            >
                <Eye size={15} />
            </button>
        </div>
    );
}
