import { useState, useEffect, useMemo } from "react";
import {
  DataTable,
  Button,
  Alert,
  M3Icon,
  showConfirmAlert,
  showSuccessAlert,
  showErrorAlert,
} from "@/shared";
import { getUserColumns } from "../table/UserColumns";
import { users as initialMockUsers } from "../data/users";
import { getUsers, updateUserStatus } from "../../../services/userService";
import { hasPermission } from "@/features/access/services/accessService";
import usePermission from "@/features/access/services/usePermission";
import { Link } from "react-router-dom";
import ReportConfigModal from "../reports/components/ReportConfigModal";
import { getStoredAuthUser } from "@/shared/utils/authStorage";

export default function UserListPage() {
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  // Verificar si el usuario activo tiene rol de Administrador o permiso list_user
  const currentUser = getStoredAuthUser();

  const isAdmin =
    Boolean(currentUser?.isAdmin || currentUser?.isSuperuser) ||
    currentUser?.role === "Admin" ||
    currentUser?.role === "Administrador" ||
    !currentUser; // Respaldo para desarrollo en recargas

  const [canViewUsers, setCanViewUsers] = useState(true);
  const [canCreateUsers, setCanCreateUsers] = useState(true);
  const { granted: canToggleStatus } = usePermission("disable_user");

  useEffect(() => {
    let active = true;

    if (!isAdmin) {
      hasPermission("list_user")
        .then((res) => {
          if (active) setCanViewUsers(Boolean(res.granted));
        })
        .catch(() => {
          if (active) setCanViewUsers(true);
        });
      hasPermission("create_user")
        .then((res) => {
          if (active) setCanCreateUsers(Boolean(res.granted));
        })
        .catch(() => {
          if (active) setCanCreateUsers(true);
        });
    }

    getUsers()
      .then((data) => {
        if (!active) return;
        if (Array.isArray(data) && data.length > 0) {
          setUserList(data);
        } else {
          setUserList(initialMockUsers);
        }
      })
      .catch((err) => {
        console.warn("Backend users unreachable, using mock data:", err.message);
        if (active) setUserList(initialMockUsers);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
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
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] rounded-[28px] p-6 sm:p-8 m3-elevation-1 text-center max-w-lg w-full text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
          <div className="size-14 rounded-full bg-[var(--md-sys-color-error-container)] border border-[var(--md-sys-color-error)]/40 flex items-center justify-center mx-auto mb-4 text-[var(--md-sys-color-on-error-container)]">
            <M3Icon name="warning" size={28} />
          </div>
          <h2 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)] mb-2">
            Acceso Restringido
          </h2>
          <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)] leading-relaxed mb-6">
            Su cuenta actual no dispone del permiso para consultar el listado de
            usuarios del sistema.
          </p>
          <div className="flex justify-center gap-3">
            <Link to="/">
              <Button variant="filled" leadingIcon="home">
                Ir al Punto de Venta
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col w-full rounded-2xl bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-1 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5">
        <div>
          <h1 className="text-headline-sm font-semibold text-[var(--md-sys-color-on-surface)]">
            Listado de Usuarios
          </h1>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Button
            variant="tonal"
            leadingIcon="download"
            onClick={() => setIsReportOpen(true)}
          >
            Generar reporte
          </Button>
          {canCreateUsers && (
            <Link to="/CreateUser">
              <Button variant="filled" leadingIcon="add">
                Crear usuario
              </Button>
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

      <DataTable className="flex-1" data={userList} columns={columns} />

      <ReportConfigModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Usuarios del sistema"
        data={userList}
        filePrefix="usuarios"
      />
    </div>
  );
}
