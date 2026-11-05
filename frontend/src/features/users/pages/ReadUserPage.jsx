import { Mail, Phone, Shield} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/shared";

export default function ReadUser1() {
    const location = useLocation();

    const user = location.state?.user || {
        id: "1",
        userName: "Andrés Vélez",
        userDocumentNumber: "1085678456",
        userPhone: "3001234567",
        userDocumentTypes: "CC",
        userEmail: "andres.velez@dpiero.com",
        role: "Administrador",
        status: "Activo",
    };

    const userPhoto = user?.photo || `https://api.dicebear.com/7.x/initials/svg?seed=${user?.userName || 'Usuario'}`;
    const roleName = user.role || user.userType || (user.isSuperUser ? "Administrador" : "Mesero");
    const statusText = user.status || (user.isActive ?? true ? "Activo" : "Inactivo");

    return(
        <div className="my-auto">
            <h1 className="text-[length:var(--fs-md)] font-bold place-self-center mt-8">Ver Usuario</h1>

            <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] max-w-3xl mx-auto mt-6 rounded-lg p-6 shadow-md text-[var(--color-white)]">
                <h2 className="text-[length:var(--fs-sm)] font-bold text-center py-2 text-[var(--color-primary-300)]">Información del Usuario</h2>
                <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-8">

                    <div>
                        <img 
                            src={userPhoto} 
                            alt={user.userName} 
                            className="rounded-full border-2 border-[var(--color-secondary-700)] size-44 object-cover shadow-md" />
                    </div>

                    <div className="flex flex-col px-8 py-6 gap-y-2.5 bg-[var(--color-secondary-800)]/70 border border-[var(--color-secondary-700)] rounded-md flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-white)] mb-1">{user.userName}</h3>
                        <div className="text-sm flex flex-col gap-2 text-[var(--color-gray-300)]">
                            <p>ID: <span className="font-bold text-[var(--color-white)] font-mono">#{user.id}</span></p>
                            <p>Documento ({user.userDocumentTypes}): <span className="font-bold text-[var(--color-white)] font-mono">{user.userDocumentNumber}</span></p>
                            <p className="flex items-center gap-2"><Shield className="size-4 text-[var(--color-primary-400)]" />Rol: <span className="font-semibold text-[var(--color-white)]">{roleName}</span></p>
                            <p className="flex items-center gap-2"><Phone className="size-4 text-[var(--color-primary-400)]" />Teléfono: <span className="font-mono text-[var(--color-gray-200)]">{user.userPhone || "No registrado"}</span></p>
                            <p className="flex items-center gap-2"><Mail className="size-4 text-[var(--color-primary-400)]" />Correo: <span className="font-medium text-[var(--color-gray-200)]">{user.userEmail}</span></p>
                            <p>Estado: <span className="font-bold text-[var(--color-primary-300)]">{statusText}</span></p>
                        </div>
                    </div>
                </div>
                <div className="w-full flex justify-center mt-8 gap-4">
                    <Link to="/dashboard/userList">
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