import { Mail, Phone, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/shared";

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

  return (
    <div className="my-auto">
      <h1 className="text-[length:var(--fs-md)] font-bold place-self-center mt-8 text-[var(--color-white)]">Ver Usuario</h1>

      <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] max-w-3xl mx-auto mt-6 rounded-lg p-6 shadow-md text-[var(--color-white)]">
        <h2 className="text-[length:var(--fs-sm)] font-bold text-center py-2 text-[var(--color-secondary-500)]">Información del Usuario</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center mt-6 gap-8">
          <div className="flex items-center justify-center size-44 rounded-full bg-[var(--color-primary-950)] border-2 border-[var(--color-primary-700)] text-[var(--color-gray-400)] shadow-inner">
            <User className="size-20 text-[var(--color-secondary-500)]" />
          </div>

          <div className="flex flex-col px-8 py-6 gap-y-2.5 bg-[var(--color-primary-950)] border border-[var(--color-primary-800)] rounded-md flex-1">
            <h3 className="text-lg font-bold text-[var(--color-white)] mb-1">{user.userName}</h3>
            <div className="text-sm flex flex-col gap-2 text-[var(--color-gray-400)]">
              <p>ID: <span className="font-bold text-[var(--color-white)] font-mono">#{user.id}</span></p>
              <p>Documento ({user.userDocumentTypes}): <span className="font-bold text-[var(--color-white)] font-mono">{user.userDocumentNumber}</span></p>
              <p className="flex items-center gap-2"><Phone className="size-4 text-[var(--color-secondary-500)]" />Teléfono: <span className="font-mono text-[var(--color-white)]">{user.userPhone}</span></p>
              <p className="flex items-center gap-2"><Mail className="size-4 text-[var(--color-secondary-500)]" />Correo: <span className="font-medium text-[var(--color-white)]">{user.userEmail}</span></p>
              <p>Estado: <span className="font-bold text-emerald-600">{user.status}</span></p>
            </div>
          </div>
        </div>
        <div className="w-full flex justify-center mt-8 gap-4">
          <Link to="/dashboard/userList">
            <Button variant="secondary" size="md">
              Volver al Listado
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}