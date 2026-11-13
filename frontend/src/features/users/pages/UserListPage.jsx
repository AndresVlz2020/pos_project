import { useState, useEffect, useMemo } from "react";
import { DataTable, Button, ConfirmDialog, Alert, showConfirmAlert, showSuccessAlert, showErrorAlert } from "@/shared";
import { getUserColumns } from "../table/UserColumns";
import { users as initialMockUsers } from "../data/users";
import { getUsers, updateUserStatus } from "../../../services/userService";
import { hasPermission } from "@/features/access/services/accessService";
import usePermission from "@/features/access/services/usePermission";
import { Link } from "react-router-dom";
import { ShieldAlert, Shield } from "lucide-react";
import ReportConfigModal from "../reports/components/ReportConfigModal";

export default function UserListPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pendingChange, setPendingChange] = useState(null);
  const [feedback, setFeedback] = useState(null);

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
    currentUser?.role === "Administrador" ||
    !currentUser; // Respaldo para desarrollo en recargas

  const [canViewUsers, setCanViewUsers] = useState(true);
  const [canCreateUsers, setCanCreateUsers] = useState(true);
  const { granted: canToggleStatus } = usePermission("disable_user");

  useEffect(() => {
    if (isAdmin) {
      setCanViewUsers(true);
      setCanCreateUsers(true);
    } else {
      hasPermission("list_user")
        .then((res) => setCanViewUsers(Boolean(res.granted)))
        .catch(() => setCanViewUsers(true));
      hasPermission("create_user")
        .then((res) => setCanCreateUsers(Boolean(res.granted)))
        .catch(() => setCanCreateUsers(true));
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

  // Manejo de solicitud de cambio de estado con confirmación mediante SweetAlert
  const handleRequestStatusChange = async (user, targetState) => {
    const userName = user.userName || user.name || "Usuario";
    const actionText = targetState ? "habilitar" : "inhabilitar";

    const result = await showConfirmAlert({
      title: targetState ? "¿Desea habilitar este usuario?" : "¿Desea inhabilitar este usuario?",
      text: targetState
        ? `¿Desea habilitar al usuario "${userName}"? Podrá volver a iniciar sesión y operar en el sistema.`
        : `¿Está seguro de que desea inhabilitar al usuario "${userName}"? Su acceso al sistema quedará suspendido.`,
      confirmButtonText: targetState ? "Sí, habilitar" : "Sí, inhabilitar",
      cancelButtonText: "Cancelar",
      isDestructive: !targetState,
    });

    if (!result.isConfirmed) return;

    try {
      await updateUserStatus(user.id, targetState);

      setUserList((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isActive: targetState, is_active: targetState } : u
        )
      );

      await showSuccessAlert({
        title: "Estado actualizado",
        text: `El usuario "${userName}" fue ${actionText} exitosamente.`,
      });
    } catch (error) {
      if (error?.isStepUpCancelled) return;
      await showErrorAlert({
        title: "Error al actualizar",
        text: error.message || "No se pudo actualizar el estado del usuario",
      });
    }
  };

  const columns = useMemo(
    () => getUserColumns({ onRequestStatusChange: handleRequestStatusChange, canToggleStatus }),
    [canToggleStatus]
  );

  if (!canViewUsers && !loading) {
    return (
      <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-8 shadow-md text-center max-w-lg mx-auto my-12 text-[var(--color-white)]">
        <div className="size-14 rounded-full bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] flex items-center justify-center mx-auto mb-4 text-[var(--color-warning)]">
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
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] rounded-lg p-4 sm:p-6 shadow-md text-[var(--color-white)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div>
          <h1 className="text-xl font-bold text-[var(--color-white)]">
            Listado de Usuarios
          </h1>
          <p className="text-xs text-[var(--color-gray-400)] mt-1">
            Administración de personal operativo y credenciales de acceso POS
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
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

      {feedback && (
        <div className="mb-4">
          <Alert
            type={feedback.type}
            title={feedback.title}
            message={feedback.message}
            onClose={() => setFeedback(null)}
          />
        </div>
      )}

      <DataTable data={userList} columns={columns} />

      <ReportConfigModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Usuarios del sistema"
        data={userList}
        filePrefix="usuarios"
      />

      {pendingChange && (
        <ConfirmDialog
          isOpen={Boolean(pendingChange)}
          title={pendingChange.title}
          description={pendingChange.description}
          confirmText={pendingChange.targetState ? "Habilitar" : "Inhabilitar"}
          cancelText="Cancelar"
          isDestructive={pendingChange.isDestructive}
          onConfirm={handleConfirmStatusChange}
          onCancel={() => setPendingChange(null)}
        />
      )}
    </div>
  );
}
