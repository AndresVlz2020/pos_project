import { useState, useEffect } from "react";
import { DataTable, Button } from "@/shared";
import { userColumns } from "../table/UserColumns";
import { users as initialMockUsers } from "../data/users";
import { getUsers } from "../../../services/userService";
import { hasPermission } from "@/features/access/services/accessService";
import { Link } from "react-router-dom";
import { ShieldAlert, Shield } from "lucide-react";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verificar si el usuario activo tiene rol de Administrador o permiso list_user
  const currentUser = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("auth_user") ||
          sessionStorage.getItem("user") ||
          "null"
      );
    } catch {
      return null;
    }
  })();

  const isAdmin =
    Boolean(currentUser?.isAdmin || currentUser?.isSuperuser) ||
    currentUser?.role === "Admin" ||
    currentUser?.role === "Administrador";

  const [canViewUsers, setCanViewUsers] = useState(isAdmin);
  const [canCreateUsers, setCanCreateUsers] = useState(isAdmin);

  useEffect(() => {
    if (isAdmin) {
      setCanViewUsers(true);
      setCanCreateUsers(true);
    } else {
      hasPermission("list_user")
        .then((res) => setCanViewUsers(Boolean(res.granted)))
        .catch(() => setCanViewUsers(false));
      hasPermission("create_user")
        .then((res) => setCanCreateUsers(Boolean(res.granted)))
        .catch(() => setCanCreateUsers(false));
    }

    getUsers()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setUserList(data);
        } else {
          setUserList(initialMockUsers);
        }
      })
      .catch((err) => {
        console.warn("Backend users unreachable, using mock data:", err.message);
        setUserList(initialMockUsers);
      })
      .finally(() => setLoading(false));
  }, [isAdmin]);

  if (!canViewUsers && !loading) {
    return (
      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-8 shadow-md text-center max-w-lg mx-auto my-12">
        <div className="size-14 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-4 text-amber-400">
          <ShieldAlert className="size-7" />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-white)] mb-2">
          Acceso Restringido
        </h2>
        <p className="text-sm text-[var(--color-gray-400)] leading-relaxed mb-6">
          Su cuenta actual no dispone del permiso para consultar el listado de
          usuarios del sistema.
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
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-6 shadow-md text-[var(--color-white)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--color-white)]">
          Listado de Usuarios
        </h1>
        <div className="flex flex-wrap gap-2.5">
          {isAdmin && (
            <Link to="/dashboard/access">
              <Button variant="secondary">
                <Shield className="size-4" />
                <span>Permisos</span>
              </Button>
            </Link>
          )}
          <Button variant="primary" onClick={() => setIsReportOpen(true)}>
            Generar reporte
          </Button>
          {canCreateUsers && (
            <Link to="/CreateUser">
              <Button variant="primary">Crear usuario</Button>
            </Link>
          )}
        </div>
      </div>
      <DataTable data={userList} columns={userColumns} />
      <ReportConfigModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />
    </div>
  );
}
