import { Pencil, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductRowActions({ product, canEdit = true }) {
    const navigate = useNavigate();

    return (
        <div className="flex gap-2">
            {canEdit && (
                <button
                    onClick={() => navigate("/editproduct", { state: { product } })}
                    className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                    title="Editar producto"
                >
                    <Pencil size={15} />
                </button>
            )}
            <button
                onClick={() => navigate("/readproduct", { state: { product } })}
                className="p-2 rounded-lg bg-[var(--color-secondary-800)] hover:bg-[var(--color-primary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-secondary-700)]"
                title="Ver producto"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}
