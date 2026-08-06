import Andres from "@/assets/images/andres.png"
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom"
import { Button } from "@/shared"

export default function ReadUser1() {

    const user = {
    id: "1",
    userName: "Andrés Vélez",
    userDocumentNumber: "1085678456",
    userPhone: "12323232424",
    userDocumentTypes: "CC",
    userEmail: "santyguitar6@gmail.com",
    status: "Activo",
    };

    return(
        <div className="my-auto">
            <h1 className="text-2xl font-bold text-center mt-6">Ver Usuario</h1>

            <div className="bg-[var(--color-gray-200)] h-130 w-230 mx-auto mt-8 rounded-xl">
                <h1 className="text-2xl font-bold text-center py-6">Informacion</h1>
                <div className="flex justify-center mt-12 gap-12">

                    <div>
                        <img src={Andres} alt="LT" className="rounded-full border h-70 w-70" />
                    </div>

                    <div className="flex flex-col px-16 gap-y-2 bg-[var(--color-gray-300)] rounded-lg">
                        <h1 className="text-2xl font-bold text-center mt-6 mb-2">{user.userName}</h1>
                        <p>Id: <span className="font-bold">{user.id}</span></p>
                        <p>Numero de Documento: <span className="font-bold">{user.userDocumentNumber}</span></p>
                        <p className="flex gap-2"><Phone /> Telefono: <span className="font-bold">{user.userPhone}</span></p>
                        <p>Tipo de Documento: <span className="font-bold">{user.userDocumentTypes}</span></p>
                        <p className="flex gap-2"><Mail />Correo: <span className="font-bold">{user.userEmail}</span></p>
                        <p>Estado: <span className="font-bold text-green-500">{user.status}</span></p>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-12 gap-4">
                    <Link to="/dashboard/userList">
                            <Button
                            variant="secondary"
                            size="md"
                            type="submit"
                        >
                            Volver
                        </Button>
                    </Link>
                    <Link to="/edituser">
                    <Button
                        variant="primary"
                        size="md"
                        type="submit"
                        >
                        Editar
                    </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}