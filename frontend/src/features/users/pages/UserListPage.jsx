import { useState } from "react";
import { DataTable, Button } from "@/shared";
import { userColumns } from "../table/UserColumns";
import { users } from "../data/users";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage(){
    const [isReportOpen, setIsReportOpen] = useState(false);

    // Verificar si el usuario activo tiene rol de Administrador
    const currentUser = (() => {
      try {
        return JSON.parse(localStorage.getItem("auth_user") || "null");
      } catch {
        return null;
      }
    })();

    const isAdmin = currentUser?.role === "Admin" || currentUser?.role === "Administrador";

    if (!isAdmin) {
      return (
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-8 shadow-md text-center max-w-lg mx-auto my-12">
          <div className="size-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
            <ShieldAlert className="size-7" />
          </div>
          <h2 className="text-lg font-bold text-[var(--color-white)] mb-2">Acceso Exclusivo de Administrador</h2>
          <p className="text-sm text-[var(--color-gray-400)] leading-relaxed mb-6">
            El módulo de usuarios está reservado exclusivamente para la administración central (<span className="text-[var(--color-secondary-400)] font-medium">admin@dpiero.com</span>). Su rol actual no dispone de permisos de auditoría o administración.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button>Ir al Punto de Venta</Button>
            </Link>
            <Link to="/Auth">
              <Button variant="secondary">Cambiar Operador</Button>
            </Link>
          </div>
        </div>
      );
    }

    return (
        <div className="bg-[var(--color-primary-900)] border border-[var(--color-primary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-xl font-bold text-[var(--color-white)]">Listado de Usuarios</h1>
                <div className="flex gap-2.5">
                    <Button variant="secondary" onClick={() => setIsReportOpen(true)}>
                        Generar reporte
                    </Button>
                    <Link to="/CreateUser">
                        <Button>Crear usuario</Button>
                    </Link>
                </div>
            </div>
            <DataTable data={users} columns={userColumns} />
            <ReportConfigModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
        </div>
    );
}