import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function SuppliersRowActions({ supplier }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            <button
                onClick={() => navigate("/editsupplier", { state: { supplier } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Editar proveedor"
            >
                <Pencil size={15}/>
            </button>
            <button
                onClick={() => navigate("/readsupplier", { state: { supplier } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver proveedor"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}