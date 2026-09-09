import { Pencil, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProductRowActions({ product }) {
    const navigate = useNavigate();

    const handleDelete = () => {
        console.log("Eliminar producto", product.id);
    };

    return (
        <div className="flex gap-2">
            <button
                onClick={() => navigate("/editproduct")}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-500)] text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Editar producto"
            >
                <Pencil size={15} />
            </button>
            <button
                onClick={handleDelete}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-800)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Eliminar producto"
            >
                <Trash2 size={15} />
            </button>
            <button
                onClick={() => navigate("/readproduct")}
                className="p-2 rounded-lg bg-[var(--color-primary-800)] hover:bg-[var(--color-secondary-600)] text-[var(--color-gray-300)] hover:text-[var(--color-white)] transition cursor-pointer border border-[var(--color-primary-700)]"
                title="Ver producto"
            >     
                <Eye size={15}/>
            </button>
        </div>
    );
}
