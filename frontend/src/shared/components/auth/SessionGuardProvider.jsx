import {
  Suspense,
  createContext,
  lazy,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Outlet,
  useLocation,
  useNavigate,
  useNavigationType,
} from "react-router-dom";
import ConfirmDialog from "../ConfirmDialog";
import { logout } from "@/services/authService";
import {
  getAuthToken,
  getLastProtectedRoute,
  setLastProtectedRoute,
} from "@/shared/utils/authStorage";

const AdminStepUpModal = lazy(() =>
  import("@/shared/components/AdminStepUpModal")
);

const LogoutConfirmContext = createContext({
  requestLogoutConfirm: () => {},
});

// eslint-disable-next-line react-refresh/only-export-components
export function useLogoutConfirm() {
  return useContext(LogoutConfirmContext);
}

function isAuthPath(pathname = "") {
  const lower = pathname.toLowerCase();
  return lower === "/auth" || lower.startsWith("/auth/") || lower === "/login";
}

export function RootSessionGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  const [confirmState, setConfirmState] = useState({
    open: false,
    reason: "button", // "button" | "back"
    isLoggingOut: false,
  });

  // Recordar la última ruta autenticada para restaurarla si cancela volver al login
  useEffect(() => {
    const token = getAuthToken();
    if (token && !isAuthPath(location.pathname)) {
      setLastProtectedRoute(`${location.pathname}${location.search || ""}`);
    }
  }, [location.pathname, location.search]);

  const requestLogoutConfirm = useCallback((reason = "button") => {
    setConfirmState((prev) => {
      if (prev.open && prev.isLoggingOut) return prev;
      return {
        open: true,
        reason,
        isLoggingOut: false,
      };
    });
  }, []);

  const handleCancel = useCallback(() => {
    setConfirmState((prev) => {
      if (prev.isLoggingOut) return prev;
      return { open: false, reason: "button", isLoggingOut: false };
    });
  }, []);

  const handleConfirm = useCallback(async () => {
    setConfirmState((prev) => ({ ...prev, isLoggingOut: true }));
    try {
      await logout();
    } finally {
      setConfirmState({ open: false, reason: "button", isLoggingOut: false });
      navigate("/Auth", { replace: true });
    }
  }, [navigate]);

  const isBackAttempt = confirmState.reason === "back";
  const hasActiveSession = Boolean(getAuthToken());

  return (
    <LogoutConfirmContext.Provider value={{ requestLogoutConfirm }}>
      <Outlet />

      {hasActiveSession && (
        <Suspense fallback={null}>
          <AdminStepUpModal />
        </Suspense>
      )}

      <ConfirmDialog
        isOpen={confirmState.open}
        title={isBackAttempt ? "¿Cerrar sesión y volver al login?" : "¿Cerrar sesión?"}
        description={
          isBackAttempt
            ? "Estás intentando regresar a la pantalla de inicio de sesión. Si continúas, se cerrará tu sesión actual en el sistema."
            : "¿Estás seguro de que deseas cerrar tu sesión actual? Deberás volver a iniciar sesión para continuar."
        }
        confirmText="Sí, cerrar sesión"
        cancelText="Continuar en sesión"
        isDestructive={true}
        isLoading={confirmState.isLoggingOut}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </LogoutConfirmContext.Provider>
  );
}

/**
 * Envuelve las rutas públicas de autenticación (/Auth, /auth, /login).
 * Si existe sesión activa en sessionStorage, impide renderizar el login y solicita confirmación de cierre de sesión.
 */
export function GuestAuthGuard({ children }) {
  const navigate = useNavigate();
  const navType = useNavigationType();
  const { requestLogoutConfirm } = useLogoutConfirm();
  const handledRef = useRef(false);

  const token = getAuthToken();

  useEffect(() => {
    if (!token) {
      handledRef.current = false;
      return;
    }

    if (handledRef.current) return;
    handledRef.current = true;

    const targetRoute = getLastProtectedRoute();
    requestLogoutConfirm("back");
    // Si llegó por botón Atrás del navegador (POP), volvemos a apilar la ruta protegida sobre /Auth
    // para que un segundo Atrás también quede interceptado si el usuario cancela el diálogo.
    navigate(targetRoute, { replace: navType !== "POP" });
  }, [token, navType, navigate, requestLogoutConfirm]);

  if (token) {
    return (
      <div className="min-h-dvh w-full bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] flex items-center justify-center p-6 text-sm text-[var(--md-sys-color-on-surface-variant)]">
        Verificando sesión activa...
      </div>
    );
  }

  return children;
}
