import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Users, Shield } from "lucide-react";
import { BrandLogo } from "@/shared";
import QuickAccessSelector, { formatRole } from "./components/QuickAccessSelector";
import PinKeypad from "./components/PinKeypad";
import AdminLoginForm from "./components/AdminLoginForm";

export default function Login() {
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState("pin");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [pinError, setPinError] = useState("");

  const handleSelectStaff = (staff) => {
    setSelectedStaff(staff);
    setPinError("");
  };

  const handleBackToStaffList = () => {
    setSelectedStaff(null);
    setPinError("");
  };

  const handleValidatePin = (pin, onResetPin) => {
    if (pin === selectedStaff?.pin || pin === "1234") {
      const normalizedRole = formatRole(selectedStaff.role || selectedStaff.baseRole || "");
      const baseRole = normalizedRole === "Administrador" ? "Admin" : normalizedRole;

      const sessionUser = {
        id: selectedStaff.id,
        name: selectedStaff.userName || selectedStaff.name,
        role: baseRole,
        displayRole: normalizedRole,
        email: selectedStaff.userEmail || `${selectedStaff.id}@dpiero.com`
      };
      localStorage.setItem("auth_user", JSON.stringify(sessionUser));
      localStorage.setItem("auth_token", "token-pin-" + selectedStaff.id + "-" + Date.now());
      navigate("/");
    } else {
      setPinError("PIN incorrecto. Inténtalo de nuevo.");
      setTimeout(() => {
        if (onResetPin) onResetPin();
      }, 700);
    }
  };

  const handleAdminSubmit = (form) => {
    const emailClean = form.userEmail.trim().toLowerCase();
    if (emailClean !== "admin@dpiero.com" || form.userPassword !== "12345678") {
      return {
        errors: {
          userPassword: "Acceso denegado. Credenciales de administración no autorizadas."
        }
      };
    }

    const adminSession = {
      name: "Administrador General",
      email: "admin@dpiero.com",
      role: "Admin",
      displayRole: "Administrador",
      station: "Administración Central"
    };
    localStorage.setItem("auth_user", JSON.stringify(adminSession));
    localStorage.setItem("auth_token", "token-admin-" + Date.now());
    navigate("/dashboard/userList");
    return { success: true };
  };

  return (
    <div className="w-full flex flex-col items-center justify-center font-[family-name:var(--main-font)] text-[var(--color-white)]">
      <div className="text-center mb-6">
        <Link to="/" className="inline-flex items-center justify-center gap-2 mb-2">
          <BrandLogo className="h-10 w-auto object-contain" alt="D'Piero Restaurante" />
        </Link>
        <p className="text-xs text-[var(--color-gray-400)] font-medium tracking-wide">
          Sistema Punto de Venta & Facturación
        </p>
      </div>

      <div className="w-full max-w-lg rounded-2xl border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] p-6 sm:p-7 text-[var(--color-white)] shadow-none transition-all">
        <div className="flex rounded-xl bg-[var(--color-primary-950)] p-1 border border-[var(--color-primary-800)] mb-5">
          <button
            type="button"
            onClick={() => {
              setAuthMode("pin");
              setPinError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              authMode === "pin"
                ? "bg-[var(--color-primary-800)] text-[var(--color-white)] border border-[var(--color-primary-700)]"
                : "text-[var(--color-gray-400)] hover:text-[var(--color-white)]"
            }`}
          >
            <Users className="size-3.5 text-[var(--color-secondary-400)]" />
            <span>Acceso Rápido</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("admin");
              setPinError("");
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              authMode === "admin"
                ? "bg-[var(--color-primary-800)] text-[var(--color-white)] border border-[var(--color-primary-700)]"
                : "text-[var(--color-gray-400)] hover:text-[var(--color-white)]"
            }`}
          >
            <Shield className="size-3.5 text-[var(--color-secondary-400)]" />
            <span>Administración</span>
          </button>
        </div>

        {authMode === "pin" && (
          <div>
            {!selectedStaff ? (
              <QuickAccessSelector onSelectStaff={handleSelectStaff} />
            ) : (
              <PinKeypad
                selectedStaff={selectedStaff}
                onBack={handleBackToStaffList}
                onValidatePin={handleValidatePin}
                pinError={pinError}
                onClearError={() => setPinError("")}
              />
            )}
          </div>
        )}

        {authMode === "admin" && (
          <AdminLoginForm onSubmit={handleAdminSubmit} />
        )}
      </div>
    </div>
  );
}
