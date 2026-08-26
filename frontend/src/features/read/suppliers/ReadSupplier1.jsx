import image from "@/assets/images/supplier.png"
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom"
import { Button } from "@/shared"

export default function ReadSupplier1() {

    const supplier = {
    nit: "900.123.456-1",
    supplierName: "Distribuidora Lácteos del Campo S.A.S.",
    supplierEmail: "ventas@lacteosdelcampo.co",
    supplierPhone: "3001234567",
    status: "Activo",
    };

    return(
        <div className="my-auto">
            <h1 className="text-[length:var(--fs-md)] font-bold place-self-center mt-8">Ver Proveedor</h1>

            <div className="bg-[var(--color-gray-200)] h-130 w-230 mx-auto mt-8 rounded-xl">
                <h1 className="text-[length:var(--fs-md)] font-bold text-center py-6">Informacion</h1>
                <div className="flex justify-center mt-12 gap-12">

                    <div>
                        <img src={image} alt="LT" className="rounded-full border h-70 w-70 object-cover" />
                    </div>

                    <div className="flex flex-col px-16 gap-y-2 bg-[var(--color-gray-300)] rounded-lg">
                        <h1 className="text-[length:var(--fs-sm)] font-bold text-center mt-16 mb-2">{supplier.supplierName}</h1>
                        <div className="text-[length:var(--fs-xs)] flex flex-col gap-2">
                            <p>NIT: <span className="font-bold">{supplier.nit}</span></p>
                            <p className="flex gap-2"><Mail />Correo: <span className="font-bold object-cover">{supplier.supplierEmail}</span></p>
                            <p className="flex gap-2"><Phone /> Telefono: <span className="font-bold">{supplier.supplierPhone}</span></p>
                            <p>Estado: <span className="font-bold text-green-500">{supplier.status}</span></p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-12 gap-4">
                    <Link to="/supplierList">
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