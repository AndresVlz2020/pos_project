import image from "@/assets/images/product.png"
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

            <div className="bg-[var(--color-gray-200)] h-130 w-250 mx-auto mt-8 rounded-xl">
                <h1 className="text-[length:var(--fs-md)] font-bold text-center py-6">Informacion</h1>
                <div className="flex justify-center mt-12 gap-8">

                    <div>
                        <img src={image} alt="LT" className="rounded-lg border h-70 w-70 object-cover" />
                    </div>

                    <div className="flex flex-col px-16 gap-y-2 bg-[var(--color-gray-300)] rounded-lg">
                        <h1 className="text-[length:var(--fs-sm)] font-bold text-center mt-16 mb-2">{product.productName}</h1>
                        <div className="text-[length:var(--fs-xs)] flex flex-col gap-2">
                            <p>Categoria: <span className="font-bold">{product.productCategory}</span></p>
                            <p className="flex gap-2"> Descripcion: <span className="font-bold">{product.productDescription}</span></p>
                            <p className="flex gap-2"><DollarSign />Precio: <span className="font-bold object-cover">{product.productPrice}</span></p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-12 gap-4">
                    <Link to="/productList">
                            <Button
                            variant="secondary"
                            size="md"
                            type="submit"
                        >
                            Volver
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}