import { useState } from "react";
import { Link } from "react-router-dom";
import { IconButton } from "../components/IconButton";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";
import M3Icon from "../components/M3Icon";
import { useNavigationState } from "@/shared/hooks/useNavigationState";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/avatarHelper";
import { formatDuration } from "@/services/sessionService";
import SessionHistoryModal from "../components/SessionHistoryModal";
import BiometricSettingsModal from "../components/BiometricSettingsModal";
import UserProfileModal from "../components/UserProfileModal";
import NotificationBell from "@/features/notifications/components/NotificationBell";

export default function Navbar() {
  const {
    currentUser,
    isAdmin,
    sessionAnchor,
    elapsedSeconds,
    destinations,
    handleLogout,
  } = useNavigationState();

  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <>
      <nav className="w-full bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] sticky top-0 z-50">
        <div className="w-full px-3 sm:px-6">
          <div className="flex h-16 items-center justify-between gap-2 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shrink-0"
            >
              <BrandLogo
                className="h-6 sm:h-10 w-auto object-contain"
                alt="D'Piero Logo"
              />
            </Link>

            <ul className="hidden lg:flex items-center gap-2">
              {destinations.map((dest) => (
                <li key={dest.id}>
                  <Link
                    to={dest.to}
                    className={`m3-state inline-flex items-center gap-4 h-10 px-4 rounded-full text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                      dest.active
                        ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                        : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                    }`}
                  >
                    <M3Icon name={dest.icon} filled={dest.active} size={18} />
                    <span>{dest.label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="flex items-center gap-2 shrink-0">
              {currentUser && (
                <div className="hidden sm:flex items-center gap-2 text-xs bg-[var(--md-sys-color-surface-container)] pl-1.5 pr-3 py-1 rounded-full border border-[var(--md-sys-color-outline-variant)]">
                  <button
                    type="button"
                    onClick={() => setIsProfileOpen(true)}
                    title="Ver mi perfil"
                    className="m3-state flex items-center gap-2 rounded-full pr-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                  >
                    <img
                      src={getUserAvatar(currentUser)}
                      alt={currentUser.name || "Usuario"}
                      width={32}
                      height={32}
                      decoding="async"
                      className="size-8 rounded-full object-cover border border-[var(--md-sys-color-outline-variant)] shrink-0"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = imgWorkerCarlos;
                      }}
                    />
                    <span className="font-medium text-[var(--md-sys-color-on-surface)] truncate max-w-[140px]">
                      {currentUser.name}
                    </span>
                    <span className="text-label-sm px-2.5 py-0.5 rounded-full bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium">
                      {currentUser.role}
                    </span>
                  </button>
                  {!isAdmin && sessionAnchor && (
                    <button
                      type="button"
                      onClick={() => setIsHistoryOpen(true)}
                      title="Duración de sesión actual (ver historial)"
                      className="inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-mono text-xs font-medium cursor-pointer"
                    >
                      <M3Icon name="schedule" size={14} />
                      {formatDuration(elapsedSeconds)}
                    </button>
                  )}
                </div>
              )}

              <NotificationBell />

              <ThemeToggle hitSize={40} iconSize={20} />

              <IconButton
                hitSize={40}
                iconSize={20}
                variant="standard"
                ariaLabel="Configurar Biometría / Huella"
                title="Configurar Biometría / Huella"
                onClick={() => setIsBiometricsOpen(true)}
              >
                <M3Icon name="fingerprint" size={20} />
              </IconButton>

              <IconButton
                hitSize={40}
                iconSize={20}
                variant="standard"
                ariaLabel={isAdmin ? "Historial de Turnos" : "Mi Historial de Turnos"}
                title={isAdmin ? "Historial de Turnos" : "Mi Historial de Turnos"}
                onClick={() => setIsHistoryOpen(true)}
              >
                <M3Icon name="history" size={20} />
              </IconButton>

              <IconButton
                hitSize={40}
                iconSize={20}
                variant="tonal"
                ariaLabel="Cerrar sesión"
                title="Cerrar sesión"
                onClick={handleLogout}
                className="!text-[var(--md-sys-color-error)]"
              >
                <M3Icon name="logout" size={20} />
              </IconButton>
            </div>
          </div>
        </div>
      </nav>
      <SessionHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        isAdmin={isAdmin}
      />
      <BiometricSettingsModal
        isOpen={isBiometricsOpen}
        onClose={() => setIsBiometricsOpen(false)}
        isAdmin={isAdmin}
        userName={currentUser?.name || currentUser?.email || ""}
      />
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </>
  );
}
