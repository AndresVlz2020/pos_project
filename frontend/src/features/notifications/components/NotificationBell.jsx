import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, IconButton, M3Icon } from "@/shared";
import { getOrderStatusBadgeMeta, normalizeOrderStatus } from "@/features/orders/utils/orderFormHelpers";
import { useOrderNotifications } from "../hooks/useOrderNotifications";
import { playWaiterCallVoice } from "../utils/voiceAlert";

function formatRelativeNotificationTime(isoString) {
  if (!isoString) return "";
  const ts = new Date(isoString).getTime();
  if (Number.isNaN(ts)) return "";
  const mins = Math.max(0, Math.floor((Date.now() - ts) / 60000));
  if (mins < 1) return "Justo ahora";
  if (mins < 60) return `Hace ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Hace ${hrs} h`;
  return new Date(ts).toLocaleString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Campanita superior con historial persistente + bandeja de alertas flotantes en zona superior.
 * Diseñada para no bloquear al usuario (sin SweetAlert).
 */
export default function NotificationBell() {
  const navigate = useNavigate();
  const {
    enabled,
    notifications,
    unreadCount,
    topBanners,
    markRead,
    markAllRead,
    dismissBanner,
  } = useOrderNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [filterMode, setFilterMode] = useState("all"); // "all" | "unread"
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    window.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      window.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const visibleNotifications = useMemo(() => {
    if (filterMode === "unread") {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterMode]);

  if (!enabled) return null;

  const handleOpenNotification = (notification) => {
    setIsOpen(false);
    markRead(notification.id);

    if (notification.type === "waiter_call") {
      return;
    }

    if (
      notification.type === "inventory_low_stock" ||
      notification.type === "inventory_out_of_stock"
    ) {
      navigate("/inventoryList", {
        state: {
          highlightInsumoId: notification.metadata?.insumoId || null,
          fromNotificationId: notification.id,
        },
      });
      return;
    }

    navigate("/orders", {
      state: {
        highlightOrderId: notification.orderNumber || String(notification.orderId || ""),
        fromNotificationId: notification.id,
      },
    });
  };

  return (
    <>
      <div ref={containerRef} className="relative shrink-0">
        <div className="relative inline-flex items-center">
          <IconButton
            hitSize={40}
            iconSize={21}
            variant={unreadCount > 0 ? "tonal" : "standard"}
            ariaLabel={`Notificaciones de órdenes (${unreadCount} sin leer)`}
            title="Notificaciones de cocina y órdenes"
            onClick={() => setIsOpen((prev) => !prev)}
            className={
              unreadCount > 0
                ? "!bg-[var(--md-sys-color-primary-container)] !text-[var(--md-sys-color-on-primary-container)]"
                : ""
            }
          >
            <M3Icon
              name={unreadCount > 0 ? "notifications_active" : "notifications"}
              filled={unreadCount > 0}
              size={21}
            />
          </IconButton>

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] text-[10px] font-bold leading-[18px] text-center shadow-sm tabular-nums"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        {/* Popover desplegable superior donde se van guardando todas las notificaciones */}
        {isOpen && (
          <div
            role="dialog"
            aria-label="Centro de notificaciones"
            className="dpiero-modal-in fixed sm:absolute right-3 sm:right-0 top-[68px] sm:top-12 w-[calc(100vw-1.5rem)] sm:w-[390px] max-h-[75dvh] flex flex-col rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] m3-elevation-3 z-[80] overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-title-md font-semibold truncate">
                    Notificaciones
                  </h2>
                  <span className="px-2 py-0.5 rounded-full text-label-sm font-semibold bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] tabular-nums">
                    {unreadCount} nuevas
                  </span>
                </div>
                <p className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                  Avisos de cocina y órdenes completadas
                </p>
              </div>

              {notifications.length > 0 && unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="m3-state inline-flex items-center gap-1 min-h-[32px] px-2.5 rounded-full text-xs font-medium text-[var(--md-sys-color-primary)] hover:bg-[var(--md-sys-color-primary)]/10 cursor-pointer shrink-0"
                >
                  <M3Icon name="done_all" size={15} />
                  <span>Leer todo</span>
                </button>
              )}
            </div>

            <div className="px-4 py-2 border-b border-[var(--md-sys-color-outline-variant)] flex items-center gap-2 bg-[var(--md-sys-color-surface)]">
              {[
                { id: "all", label: `Todas (${notifications.length})` },
                { id: "unread", label: `Sin leer (${unreadCount})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilterMode(tab.id)}
                  className={`m3-state min-h-[30px] px-3 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                    filterMode === tab.id
                      ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)]"
                      : "text-[var(--md-sys-color-on-surface-variant)]"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto overscroll-contain divide-y divide-[var(--md-sys-color-outline-variant)]/70">
              {visibleNotifications.length === 0 ? (
                <div className="py-10 px-4 text-center space-y-1.5">
                  <div className="size-11 mx-auto rounded-full bg-[var(--md-sys-color-surface-container)] flex items-center justify-center text-[var(--md-sys-color-on-surface-variant)]">
                    <M3Icon name="notifications" size={22} />
                  </div>
                  <p className="text-body-sm font-medium text-[var(--md-sys-color-on-surface)]">
                    {filterMode === "unread"
                      ? "No tienes notificaciones sin leer"
                      : "Aún no hay notificaciones registradas"}
                  </p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                    Cuando Cocina complete una orden aparecerá guardada aquí al instante.
                  </p>
                </div>
              ) : (
                visibleNotifications.map((notif) => {
                  const isOutOfStock = notif.type === "inventory_out_of_stock";
                  const isLowStock = notif.type === "inventory_low_stock";
                  const isStockAlert = isOutOfStock || isLowStock;

                  const canonicalOrderStatus = normalizeOrderStatus(
                    notif.currentOrderStatus || "Completada"
                  );
                  const orderMeta = getOrderStatusBadgeMeta(canonicalOrderStatus);
                  const relTime = formatRelativeNotificationTime(notif.createdAt);

                  const iconWrapperClass = isOutOfStock
                    ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                    : isLowStock
                    ? "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]"
                    : canonicalOrderStatus === "Completada"
                    ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                    : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface-variant)]";

                  const badgeClass = isOutOfStock
                    ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)] border border-[var(--md-sys-color-error)]/40"
                    : isLowStock
                    ? "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)] border border-[var(--md-sys-color-outline-variant)]"
                    : orderMeta.className;

                  const badgeLabel = isOutOfStock
                    ? "Sin stock"
                    : isLowStock
                    ? "Poco stock"
                    : orderMeta.label;

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleOpenNotification(notif)}
                      className={`p-3.5 transition-colors cursor-pointer flex items-start gap-3 ${
                        notif.isRead
                          ? "bg-[var(--md-sys-color-surface)] hover:bg-[var(--md-sys-color-surface-container-low)]"
                          : "bg-[var(--md-sys-color-primary-container)]/25 hover:bg-[var(--md-sys-color-primary-container)]/40"
                      }`}
                    >
                      <div
                        className={`size-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${iconWrapperClass}`}
                      >
                        <M3Icon
                          name={
                            isOutOfStock
                              ? "error"
                              : isLowStock
                              ? "warning"
                              : canonicalOrderStatus === "Entregada"
                              ? "room_service"
                              : "notifications_active"
                          }
                          size={18}
                        />
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-xs sm:text-sm font-semibold text-[var(--md-sys-color-on-surface)] leading-snug">
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span
                              title="Sin leer"
                              className="size-2.5 rounded-full bg-[var(--md-sys-color-primary)] shrink-0 mt-1"
                            />
                          )}
                        </div>

                        <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] line-clamp-2">
                          {notif.message}
                        </p>

                        <div className="flex flex-wrap items-center justify-between gap-1.5 pt-0.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${badgeClass}`}
                            >
                              {badgeLabel}
                            </span>
                            {relTime && (
                              <span className="text-[11px] text-[var(--md-sys-color-on-surface-variant)]">
                                {relTime}
                              </span>
                            )}
                          </div>

                          <span className="text-[11px] font-semibold text-[var(--md-sys-color-primary)]">
                            {isStockAlert
                              ? "Ir a inventario →"
                              : canonicalOrderStatus === "Completada"
                              ? "Ir a entregar →"
                              : "Ver orden →"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* Banners no bloqueantes en la zona superior (NO SweetAlert) cuando Cocina completa órdenes */}
      {topBanners.length > 0 && (
        <aside
          aria-live="polite"
          aria-label="Alertas recientes de cocina"
          className="fixed top-[68px] left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-6 z-[75] w-[calc(100vw-1.5rem)] max-w-md flex flex-col gap-2 pointer-events-none"
        >
          {topBanners.map((banner) => {
            const isOutOfStock = banner.type === "inventory_out_of_stock";
            const isLowStock = banner.type === "inventory_low_stock";
            const isWaiterCall = banner.type === "waiter_call";
            const isStockAlert = isOutOfStock || isLowStock;

            return (
              <div
                key={banner.id}
                className={`dpiero-modal-in pointer-events-auto rounded-2xl border-2 ${
                  isOutOfStock
                    ? "border-[var(--md-sys-color-error)]"
                    : isLowStock
                    ? "border-[var(--md-sys-color-tertiary)]"
                    : "border-[var(--md-sys-color-primary)]"
                } bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] px-4 py-3 m3-elevation-3 flex items-start gap-3`}
              >
                <div
                  className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isOutOfStock
                      ? "bg-[var(--md-sys-color-error-container)] text-[var(--md-sys-color-on-error-container)]"
                      : isLowStock
                      ? "bg-[var(--md-sys-color-tertiary-container)] text-[var(--md-sys-color-on-tertiary-container)]"
                      : "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                  }`}
                >
                  <M3Icon
                    name={isOutOfStock ? "error" : isLowStock ? "warning" : "room_service"}
                    size={20}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[var(--md-sys-color-on-surface)] leading-tight">
                    {banner.title}
                  </p>
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-0.5 line-clamp-2">
                    {banner.message}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      type="button"
                      variant="filled"
                      size="sm"
                      onClick={() => handleOpenNotification(banner)}
                    >
                      {isStockAlert ? "Ver inventario" : isWaiterCall ? "Atender mesa" : "Ver / Entregar"}
                    </Button>
                    {isWaiterCall && (
                      <Button
                        type="button"
                        variant="tonal"
                        size="sm"
                        leadingIcon="volume_up"
                        onClick={() =>
                          playWaiterCallVoice(
                            banner.metadata?.spokenText ||
                              `Mesero solicitado a ${banner.tableNumber || "mesa"}`
                          )
                        }
                      >
                        Repetir voz
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      onClick={() => dismissBanner(banner.id)}
                    >
                      Ocultar aviso
                    </Button>
                  </div>
                </div>

                <IconButton
                  ariaLabel="Cerrar aviso"
                  title="Cerrar aviso (permanece guardado en la campanita)"
                  variant="standard"
                  hitSize={34}
                  iconSize={18}
                  className="-mt-1 -mr-1 shrink-0"
                  onClick={() => dismissBanner(banner.id)}
                >
                  <M3Icon name="close" size={18} />
                </IconButton>
              </div>
            );
          })}
        </aside>
      )}
    </>
  );
}
