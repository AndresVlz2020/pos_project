import image from "@/assets/images/punta-de-anca-hd.jpg";
import { DollarSign } from "lucide-react";
import { Link } from "react-router-dom"
import { Button } from "@/shared"

export default function ReadProduct1() {

    const product = {
    productName: "Punta de Anca",
    productCategory: "Plato Fuerte",
    productPrice: "56.000",
    productDescription: "Punta de anca acompañada de guarnición de la casa",
    };

    return(
        <div className="my-auto">
            <h1 className="text-[length:var(--fs-md)] font-bold place-self-center mt-8">Ver Producto</h1>

            <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] max-w-3xl mx-auto mt-6 rounded-lg p-6 shadow-md text-[var(--color-white)]">
                <h2 className="text-[length:var(--fs-sm)] font-bold text-center py-2 text-[var(--color-secondary-300)]">Detalle del Producto</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-8">

                    <div>
                        <img src={image} alt={product.productName} className="rounded-md border border-[var(--color-primary-700)] h-56 w-56 object-cover shadow-md" />
                    </div>

                    <div className="flex flex-col px-8 py-6 gap-y-2.5 bg-[var(--color-primary-800)]/70 border border-[var(--color-primary-700)] rounded-md flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-white)] mb-1">{product.productName}</h3>
                        <div className="text-sm flex flex-col gap-2 text-[var(--color-gray-300)]">
                            <p>Categoría: <span className="font-bold text-[var(--color-white)]">{product.productCategory}</span></p>
                            <p>Descripción: <span className="font-medium text-[var(--color-gray-200)]">{product.productDescription}</span></p>
                            <p className="flex items-center gap-1">Precio: <span className="font-bold text-[var(--color-secondary-300)] text-base">${product.productPrice}</span></p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-8 gap-4">
                    <Link to="/productList">
                        <Button
                            variant="secondary"
                            size="md"
                        >
                            Volver al Listado
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}