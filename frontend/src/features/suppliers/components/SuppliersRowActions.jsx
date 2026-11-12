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
                    onClick={handleEdit}
                    className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                    title="Editar proveedor"
                >
                    <Pencil size={15}/>
                </button>
            )}
            <button
                onClick={handleView}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver proveedor"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}
