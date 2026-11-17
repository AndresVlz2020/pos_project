import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SuppliersRowActions({ supplier, canEdit = true }) {
    const navigate = useNavigate();

    const handleEdit = () => {
        try {
            sessionStorage.setItem("last_edited_supplier", JSON.stringify(supplier));
        } catch {
            // ignore
        }
        navigate(`/editsupplier?id=${supplier.id}`, { state: { supplier } });
    };

    const handleView = () => {
        try {
            sessionStorage.setItem("last_viewed_supplier", JSON.stringify(supplier));
        } catch {
            // ignore
        }
        navigate(`/readsupplier?id=${supplier.id}`, { state: { supplier } });
    };

    return (
        <div className="flex gap-2">
            {canEdit && (
                <button
                    type="button"
                    onClick={handleEdit}
                    aria-label="Editar proveedor"
                    className="size-10 inline-flex items-center justify-center rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
                    title="Editar proveedor"
                >
                    <Pencil size={18} />
                </button>
            )}
            <button
                type="button"
                onClick={handleView}
                aria-label="Ver proveedor"
                className="size-10 inline-flex items-center justify-center rounded-full bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-on-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/50 transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver proveedor"
            >
                <Eye size={18} />
            </button>
        </div>
    );
}
