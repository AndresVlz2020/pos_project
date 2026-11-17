import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo, M3Icon, showErrorAlert } from "@/shared";
import QuickAccessSelector, { formatRole } from "./components/QuickAccessSelector";
import PinKeypad from "./components/PinKeypad";
import AdminLoginForm from "./components/AdminLoginForm";
import { loginApi } from "@/services/authService";
import { loginWithBiometricsApi } from "@/services/biometricService";

function saveSession(token, userObj) {
  localStorage.setItem("auth_token", token);
  localStorage.setItem("auth_user", JSON.stringify(userObj));
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(userObj));
}

export default function Login() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("pin");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pinError, setPinError] = useState("");
  const [pinLockSeconds, setPinLockSeconds] = useState(0);

  // Cuenta regresiva en tiempo real para el bloqueo de 60s por intentos fallidos
  useEffect(() => {
    if (pinLockSeconds <= 0) return;
    const timer = setInterval(() => {
      setPinLockSeconds((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [pinLockSeconds]);

  const completeSessionLogin = (result, fallbackStaff = null) => {
    const normalizedRole = formatRole(
      result.user?.role || fallbackStaff?.role || fallbackStaff?.userType || ""
    );
    const isAdmin = Boolean(
      result.user?.isAdmin ||
        result.user?.isSuperuser ||
        normalizedRole === "Administrador" ||
        result.user?.role === "Admin"
    );
    const baseRole = isAdmin ? "Admin" : normalizedRole;

    const sessionUser = {
      id: result.user?.id || fallbackStaff?.id,
      name:
        result.user?.name ||
        fallbackStaff?.userName ||
        fallbackStaff?.name ||
        "Usuario",
      role: baseRole,
      displayRole: isAdmin ? "Administrador" : normalizedRole,
      email: result.user?.email || fallbackStaff?.userEmail || "",
      isAdmin,
      isSuperuser: Boolean(result.user?.isSuperuser),
    };

    saveSession(result.token, sessionUser);
    navigate("/");
  };

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setPinError("");
    setPinLockSeconds(0);
  };

  const handleBackToStaffList = () => {
    setSelectedStaff(null);
    setPinError("");
    setPinLockSeconds(0);
  };

  const handleValidatePin = async (pin, onResetPin) => {
    try {
      const result = await loginApi({
        userId: selectedStaff.id,
        email: selectedStaff.userEmail || selectedStaff.email,
        pin,
      });

      setPinLockSeconds(0);
      setPinError("");
      completeSessionLogin(result, selectedStaff);
    } catch (err) {
      if (err.status === 429 || err.code === "PIN_LOCKED") {
        setPinLockSeconds(Number(err.retryAfterSeconds) || 60);
        setPinError("");
        if (onResetPin) onResetPin();
        return;
      }

      setPinError(err.message || "PIN incorrecto. Inténtalo de nuevo.");
      setTimeout(() => {
        if (onResetPin) onResetPin();
      }, 700);
    }
  };

  const handleStaffBiometricLogin = async (staff) => {
    const result = await loginWithBiometricsApi({ userId: staff.id });
    setPinLockSeconds(0);
    setPinError("");
    completeSessionLogin(result, staff);
  };

  const handleAdminBiometricLogin = async (email) => {
    const result = await loginWithBiometricsApi({ email });
    const emailClean = String(email || "").trim().toLowerCase();
    localStorage.removeItem(`login_attempts_${emailClean}`);
    completeSessionLogin(result);
  };

  const handleAdminSubmit = async (form) => {
    const emailClean = form.userEmail.trim().toLowerCase();
    const attemptsKey = `login_attempts_${emailClean}`;
    const currentAttempts = parseInt(localStorage.getItem(attemptsKey) || "0", 10);

    // Verificación de bloqueo por 3 intentos fallidos (Rúbrica de seguridad)
    if (currentAttempts >= 3) {
      await showErrorAlert({
        title: "Cuenta bloqueada",
        text: "Se ha bloqueado la cuenta por superar 3 intentos fallidos consecutivos. Contacte al administrador central.",
      });
      return {
        errors: {
          userPassword: "Cuenta bloqueada por múltiples intentos fallidos.",
        },
      };
    }

    try {
      const result = await loginApi({ email: emailClean, password: form.userPassword });
      localStorage.removeItem(attemptsKey);
      completeSessionLogin(result);
      return { success: true };
    } catch (err) {
      console.warn("Backend login failed or unreachable:", err.message);

      if (err.isNetworkError) {
        await showErrorAlert({
          title: "Sin conexión",
          text: "No fue posible conectar con el sistema en este momento. Verifica tu conexión e inténtalo de nuevo.",
        });
        return {
          errors: {
            userPassword: "Servicio temporalmente no disponible. Intenta nuevamente.",
          },
        };
      }

      const newAttempts = currentAttempts + 1;
      localStorage.setItem(attemptsKey, String(newAttempts));

      if (newAttempts >= 3) {
        await showErrorAlert({
          title: "Cuenta bloqueada",
          text: "Ha alcanzado el límite de 3 intentos fallidos. Su cuenta ha sido bloqueada.",
        });
        return {
          errors: {
            userPassword: "Cuenta bloqueada. Se superaron los 3 intentos permitidos.",
          },
        };
      }

      const remaining = 3 - newAttempts;
      return {
        errors: {
          userPassword: `Credenciales inválidas. Le quedan ${remaining} intento(s) antes del bloqueo de la cuenta.`,
        },
      };
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-[family-name:var(--main-font)] text-[var(--md-sys-color-on-surface)]">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] rounded-lg">
          <BrandLogo className="h-10 w-auto object-contain" alt="D'Piero Restaurante" />
        </Link>
        <p className="text-body-sm text-[var(--md-sys-color-on-surface-variant)] font-medium tracking-wide">
          Sistema Punto de Venta & Facturación
        </p>
      </div>

      <div className="dpiero-fade-up w-full max-w-lg rounded-[28px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] p-6 sm:p-8 text-[var(--md-sys-color-on-surface)] m3-elevation-2">
        {/* M3 Segmented Button (40dp pill, outline border, vertical divider, secondary-container selected fill) */}
        <div
          role="tablist"
          aria-label="Modo de acceso"
          className="grid grid-cols-2 rounded-full border border-[var(--md-sys-color-outline)] bg-[var(--md-sys-color-surface)] overflow-hidden divide-x divide-[var(--md-sys-color-outline)] mb-6"
        >
          <button
            type="button"
            role="tab"
            aria-selected={authMode === "pin"}
            onClick={() => {
              setAuthMode("pin");
              setPinError("");
              setPinLockSeconds(0);
            }}
            className={`m3-state min-h-[42px] flex items-center justify-center gap-2 py-2 px-4 text-label-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer ${
              authMode === "pin"
                ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                : "bg-transparent text-[var(--md-sys-color-on-surface)]"
            }`}
          >
            <M3Icon name={authMode === "pin" ? "check" : "group"} size={18} />
            <span>Acceso Rápido</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={authMode === "admin"}
            onClick={() => {
              setAuthMode("admin");
              setPinError("");
              setPinLockSeconds(0);
            }}
            className={`m3-state min-h-[42px] flex items-center justify-center gap-2 py-2 px-4 text-label-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)] cursor-pointer ${
              authMode === "admin"
                ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                : "bg-transparent text-[var(--md-sys-color-on-surface)]"
            }`}
          >
            <M3Icon name={authMode === "admin" ? "check" : "admin_panel_settings"} size={18} />
            <span>Administración</span>
          </button>
        </div>

        {authMode === "pin" && (
          <div>
            {!selectedStaff ? (
              <QuickAccessSelector onSelectStaff={handleSelectStaff} />
            ) : (
              <PinKeypad
                key={selectedStaff.id}
                selectedStaff={selectedStaff}
                onBack={handleBackToStaffList}
                onValidatePin={handleValidatePin}
                onBiometricLogin={handleStaffBiometricLogin}
                pinError={pinError}
                lockSeconds={pinLockSeconds}
                onSyncLockSeconds={setPinLockSeconds}
                onClearError={() => setPinError("")}
              />
            )}
          </div>
        )}

        {authMode === "admin" && (
          <AdminLoginForm
            onSubmit={handleAdminSubmit}
            onBiometricLogin={handleAdminBiometricLogin}
          />
        )}
      </div>
    </div>
  );
}
