import { useState } from "react";
import { Link } from "react-router-dom";
import ThemeToggle from "../components/ThemeToggle";
import BrandLogo from "../components/BrandLogo";
import { IconButton } from "../components/IconButton";
import M3Icon from "../components/M3Icon";
import { useNavigationState } from "@/shared/hooks/useNavigationState";
import { getUserAvatar, imgWorkerCarlos } from "@/utils/avatarHelper";
import { formatDuration } from "@/services/sessionService";
import SessionHistoryModal from "../components/SessionHistoryModal";
import BiometricSettingsModal from "../components/BiometricSettingsModal";
import UserProfileModal from "../components/UserProfileModal";
import NotificationBell from "@/features/notifications/components/NotificationBell";
import Footer from "./Footer";
import { useScrollLock } from "../hooks/useScrollLock";

export function AppShell({ children, showFooter = false }) {
  const {
    currentUser,
    isAdmin,
    canCreateOrder,
    sessionAnchor,
    elapsedSeconds,
    destinations,
    handleLogout,
  } = useNavigationState();

  const [railExpanded, setRailExpanded] = useState(
    () => sessionStorage.getItem("m3_rail_expanded") === "1"
  );
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBiometricsOpen, setIsBiometricsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useScrollLock(mobileDrawerOpen);

  const toggleRail = () => {
    setRailExpanded((prev) => {
      const next = !prev;
      sessionStorage.setItem("m3_rail_expanded", next ? "1" : "0");
      return next;
    });
  };

  return (
    <div className="min-h-screen w-full flex bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      {/* Tablet & Desktop M3 Fixed Navigation Rail / Expandable Navigation Drawer (md+) */}
      <aside
        aria-label="Navegación principal M3"
        className={`hidden md:flex flex-col shrink-0 fixed inset-y-0 left-0 h-dvh bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)] transition-[width] duration-200 z-40 ${
          railExpanded ? "w-60 px-3" : "w-[88px] px-2 items-center"
        } py-3 select-none`}
      >
        {/* Cabecera del Rail: botón expandir/colapsar */}
        <div
          className={`flex items-center ${
            railExpanded ? "justify-between px-2" : "justify-center"
          } h-12 mb-3 w-full`}
        >
          {railExpanded && (
            <span className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
              Navegación
            </span>
          )}
          <IconButton
            hitSize={40}
            iconSize={22}
            variant="standard"
            ariaLabel={railExpanded ? "Contraer menú lateral" : "Expandir menú lateral"}
            title={railExpanded ? "Contraer menú lateral" : "Expandir menú lateral"}
            onClick={toggleRail}
          >
            <M3Icon name={railExpanded ? "menu_open" : "menu"} size={22} />
          </IconButton>
        </div>

        {/* FAB / Extended FAB M3 para Nueva Orden */}
        {canCreateOrder && (
          <Link
            to="/CreateOrder"
            title="Crear Nueva Orden"
            className={`m3-state flex items-center justify-center rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] m3-elevation-1 hover:m3-elevation-2 mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              railExpanded ? "w-full h-14 px-4 gap-3 justify-start" : "size-14"
            }`}
          >
            <M3Icon name="add" size={24} />
            {railExpanded && (
              <span className="text-sm font-medium whitespace-nowrap">
                Nueva Orden
              </span>
            )}
          </Link>
        )}

        {/* Destinos M3 con Indicador Píldora e Ícono Filled/Outlined */}
        <nav className="flex-1 w-full flex flex-col gap-1 overflow-y-auto scrollbar-none">
          {destinations.map((dest) => {
            const isActive = dest.active;
            if (railExpanded) {
              return (
                <Link
                  key={dest.id}
                  to={dest.to}
                  aria-current={isActive ? "page" : undefined}
                  className={`m3-state flex items-center gap-3 h-11 px-4 rounded-full text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                    isActive
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                  }`}
                >
                  <M3Icon name={dest.icon} filled={isActive} size={20} />
                  <span className="truncate">{dest.label}</span>
                </Link>
              );
            }

            return (
              <Link
                key={dest.id}
                to={dest.to}
                aria-current={isActive ? "page" : undefined}
                className="group flex flex-col items-center gap-0.5 py-0.5 focus-visible:outline-none"
              >
                <span
                  className={`m3-state flex items-center justify-center w-14 h-8 rounded-full group-focus-visible:ring-2 group-focus-visible:ring-[var(--md-sys-color-primary)] ${
                    isActive
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : "text-[var(--md-sys-color-on-surface-variant)] group-hover:text-[var(--md-sys-color-on-surface)]"
                  }`}
                >
                  <M3Icon name={dest.icon} filled={isActive} size={20} />
                </span>
                <span
                  className={`text-[11px] leading-4 tracking-[0.01em] text-center truncate max-w-[80px] ${
                    isActive
                      ? "font-medium text-[var(--md-sys-color-on-surface)]"
                      : "font-normal text-[var(--md-sys-color-on-surface-variant)]"
                  }`}
                >
                  {dest.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Acciones inferiores del Rail */}
        <div className="pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] w-full flex flex-col gap-1 items-center">
          <button
            type="button"
            onClick={() => setIsHistoryOpen(true)}
            title={isAdmin ? "Historial de Turnos" : "Mi Historial de Turnos"}
            className={`m3-state flex items-center cursor-pointer rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              railExpanded ? "w-full h-10 px-4 gap-3 text-sm font-medium" : "size-10 justify-center"
            }`}
          >
            <M3Icon name="history" size={20} />
            {railExpanded && <span className="truncate">Turnos</span>}
          </button>

          {isAdmin && (
            <Link
              to="/dashboard/access"
              title="Permisos y Control de Acceso"
              aria-label="Permisos"
              className={`m3-state flex items-center rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
                railExpanded ? "w-full h-10 px-4 gap-3 text-sm font-medium" : "size-10 justify-center"
              }`}
            >
              <M3Icon name="admin_panel_settings" size={20} />
              {railExpanded && <span className="truncate">Permisos</span>}
            </Link>
          )}

          <button
            type="button"
            onClick={() => setIsBiometricsOpen(true)}
            title="Configurar Biometría / Huella"
            className={`m3-state flex items-center cursor-pointer rounded-full text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              railExpanded ? "w-full h-10 px-4 gap-3 text-sm font-medium" : "size-10 justify-center"
            }`}
          >
            <M3Icon name="fingerprint" size={20} />
            {railExpanded && <span className="truncate">Biometría</span>}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            aria-label="Cerrar sesión"
            className={`m3-state flex items-center cursor-pointer rounded-full text-[var(--md-sys-color-error)] hover:text-[var(--md-sys-color-error)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] ${
              railExpanded ? "w-full h-10 px-4 gap-3 text-sm font-medium" : "size-10 justify-center"
            }`}
          >
            <M3Icon name="logout" size={20} />
            {railExpanded && <span className="truncate">Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* Columna Principal: Top App Bar + Workspace 100% Ancho y Alto */}
      <div
        className={`flex-1 min-w-0 min-h-screen flex flex-col transition-[padding-left] duration-200 ${
          railExpanded ? "md:pl-60" : "md:pl-[88px]"
        }`}
      >
        {/* M3 Small Top App Bar (64dp) */}
        <header className="sticky top-0 z-30 h-16 shrink-0 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Botón Drawer en Móvil (< md) */}
            <IconButton
              hitSize={40}
              iconSize={22}
              variant="standard"
              ariaLabel="Abrir menú de navegación"
              onClick={() => setMobileDrawerOpen(true)}
              className="md:hidden"
            >
              <M3Icon name="menu" size={22} />
            </IconButton>

            <Link
              to="/"
              className="flex items-center gap-2 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)] shrink-0"
            >
              <BrandLogo
                className="h-6 sm:h-10 w-auto object-contain"
                alt="D'Piero Logo"
              />
            </Link>

          </div>

          {/* Indicador de Turno Móvil Compacto (avatar + nombre opcional + timer siempre visible) */}
          {currentUser && (
            <div className="sm:hidden flex-1 flex justify-end min-w-0">
              <div className={`inline-flex items-center gap-1.5 min-h-[36px] bg-[var(--md-sys-color-surface-container)] p-0.5 ${sessionAnchor ? "pr-1.5" : ""} rounded-full border border-[var(--md-sys-color-outline-variant)]`}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  title="Ver mi perfil"
                  className="m3-state inline-flex items-center gap-1.5 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                >
                  <img
                    src={getUserAvatar(currentUser)}
                    alt={currentUser.name || "Usuario"}
                    title={`${currentUser.name || "Usuario"} (${currentUser.role || ""})`}
                    width={32}
                    height={32}
                    decoding="async"
                    className="size-8 rounded-full object-cover shrink-0"
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = imgWorkerCarlos;
                    }}
                  />
                </button>
                {sessionAnchor && (
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(true)}
                    title="Ver historial de sesiones"
                    className="inline-flex items-center gap-1 min-h-[28px] px-2 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-mono text-xs font-medium shrink-0 cursor-pointer"
                  >
                    <M3Icon name="schedule" size={12} />
                    {formatDuration(elapsedSeconds)}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Controles derechos del Top App Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {currentUser && (
              <div className="hidden sm:flex items-center gap-2 text-xs bg-[var(--md-sys-color-surface-container)] pl-1.5 pr-3 py-1 rounded-full border border-[var(--md-sys-color-outline-variant)]">
                <button
                  type="button"
                  onClick={() => setIsProfileOpen(true)}
                  title="Ver mi perfil"
                  className="m3-state inline-flex items-center gap-2.5 rounded-full pr-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
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
                {sessionAnchor && (
                  <button
                    type="button"
                    onClick={() => setIsHistoryOpen(true)}
                    title="Duración de sesión actual (ver historial)"
                    className="m3-state inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] font-mono text-xs font-medium cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--md-sys-color-primary)]"
                  >
                    <M3Icon name="schedule" size={14} />
                    {formatDuration(elapsedSeconds)}
                  </button>
                )}
              </div>
            )}

            <NotificationBell />

            <ThemeToggle hitSize={40} iconSize={20} />
          </div>
        </header>

        {/* Área de Contenido Fluida PC y Móvil (sin menú inferior redundante) */}
        <main className="flex-1 w-full flex flex-col min-h-0 px-3 sm:px-6 py-4 pb-6">
          {children}
        </main>

        {showFooter && <Footer />}
      </div>

      {/* M3 Modal Navigation Drawer (< md) */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[105] flex bg-[var(--md-sys-color-scrim)] backdrop-blur-xs"
          onClick={() => setMobileDrawerOpen(false)}
        >
          <aside
            aria-label="Menú lateral móvil"
            onClick={(e) => e.stopPropagation()}
            className="dpiero-modal-in w-[300px] max-w-[85vw] h-full bg-[var(--md-sys-color-surface-container-low)] border-r border-[var(--md-sys-color-outline-variant)] rounded-r-2xl p-3 flex flex-col m3-elevation-3"
          >
            <div className="flex items-center justify-between px-3 py-2 mb-2">
              <BrandLogo className="h-8 w-auto object-contain" alt="D'Piero" />
              <IconButton
                ariaLabel="Cerrar menú"
                variant="standard"
                onClick={() => setMobileDrawerOpen(false)}
              >
                <M3Icon name="close" size={20} />
              </IconButton>
            </div>

            {canCreateOrder && (
              <Link
                to="/CreateOrder"
                onClick={() => setMobileDrawerOpen(false)}
                className="m3-state flex items-center gap-3 h-12 px-4 mb-2 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] text-sm font-semibold m3-elevation-1"
              >
                <M3Icon name="add" size={20} />
                <span>Nueva Orden</span>
              </Link>
            )}

            <nav className="flex-1 overflow-y-auto space-y-1">
              {destinations.map((dest) => (
                <Link
                  key={dest.id}
                  to={dest.to}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`m3-state flex items-center gap-3 h-14 px-4 rounded-full text-sm font-medium ${
                    dest.active
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : "text-[var(--md-sys-color-on-surface-variant)] hover:text-[var(--md-sys-color-on-surface)]"
                  }`}
                >
                  <M3Icon name={dest.icon} filled={dest.active} size={22} />
                  <span>{dest.label}</span>
                </Link>
              ))}
            </nav>

            <div className="pt-3 mt-2 border-t border-[var(--md-sys-color-outline-variant)] space-y-1">
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setIsProfileOpen(true);
                }}
                className="m3-state w-full flex items-center gap-3 h-12 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
              >
                <M3Icon name="badge" size={20} />
                <span>Mi Perfil</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setIsBiometricsOpen(true);
                }}
                className="m3-state w-full flex items-center gap-3 h-12 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
              >
                <M3Icon name="fingerprint" size={20} />
                <span>Configurar Biometría / Huella</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  setIsHistoryOpen(true);
                }}
                className="m3-state w-full flex items-center gap-3 h-12 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
              >
                <M3Icon name="history" size={20} />
                <span>{isAdmin ? "Historial de Turnos" : "Mi Historial de Turnos"}</span>
              </button>
              {isAdmin && (
                <Link
                  to="/dashboard/access"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="m3-state w-full flex items-center gap-3 h-12 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-on-surface-variant)] cursor-pointer"
                >
                  <M3Icon name="admin_panel_settings" size={20} />
                  <span>Admin</span>
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setMobileDrawerOpen(false);
                  handleLogout();
                }}
                className="m3-state w-full flex items-center gap-3 h-12 px-4 rounded-full text-sm font-medium text-[var(--md-sys-color-error)] cursor-pointer"
              >
                <M3Icon name="logout" size={20} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

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
    </div>
  );
}

export default AppShell;
