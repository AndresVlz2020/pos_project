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
                <button
                    onClick={() => navigate("/readproduct")}
                    className="p-1 rounded hover:bg-gray-100"
                >     
                    <Eye size={16}/> {/* Icono de visualizacion */}
            </button>
        </div>
    );
}
