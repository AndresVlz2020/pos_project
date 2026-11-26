import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Alert,
  BrandLogo,
  Button,
  IconButton,
  M3Icon,
  ThemeToggle,
  showSuccessAlert,
  useScrollLock,
} from "@/shared";
import { products as fallbackProducts } from "@/features/products/data/products";
import { getProducts } from "@/features/products/services/productServices";
import { getTablesAvailability } from "@/features/orders/services/orderServices";
import {
  PosProductsSection,
  PosProductDetailModal,
} from "@/features/home/components";
import { callWaiterPublic } from "@/features/notifications/services/notificationService";

const COOLDOWN_STORAGE_KEY = "dpiero_public_menu_waiter_cooldown_until";
const COOLDOWN_SECONDS = 180;

function formatCooldown(totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${String(secs).padStart(2, "0")}`;
}

function extractTableNumber(table) {
  const match = String(table?.tableNumber || "").match(/\d+/);
  return match ? match[0] : String(table?.tableNumber || "");
}

function getRemainingCooldown() {
  try {
    const raw = localStorage.getItem(COOLDOWN_STORAGE_KEY);
    const until = Number(raw || 0);
    if (!Number.isFinite(until) || until <= Date.now()) return 0;
    return Math.ceil((until - Date.now()) / 1000);
  } catch {
    return 0;
  }
}

export default function PublicMenuPage() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  const [isTableModalOpen, setIsTableModalOpen] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableError, setTableError] = useState("");
  const [submittingCall, setSubmittingCall] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(() => getRemainingCooldown());
  const [banner, setBanner] = useState(null);

  useScrollLock(isTableModalOpen);

  useEffect(() => {
    let active = true;
    getProducts({ activeOnly: true })
      .then((data) => {
        if (!active) return;
        setProducts(Array.isArray(data) && data.length > 0 ? data : fallbackProducts);
      })
      .catch(() => {
        if (active) setProducts(fallbackProducts);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (cooldownSeconds <= 0) return undefined;
    const timer = setInterval(() => {
      setCooldownSeconds(getRemainingCooldown());
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldownSeconds]);

  useEffect(() => {
    if (!banner) return undefined;
    const timer = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(timer);
  }, [banner]);

  const loadTables = useCallback(async () => {
    setLoadingTables(true);
    setTableError("");
    try {
      const list = await getTablesAvailability();
      setTables(Array.isArray(list) ? list : []);
    } catch {
      setTableError("No pudimos cargar las mesas en este momento. Intenta nuevamente.");
    } finally {
      setLoadingTables(false);
    }
  }, []);

  const handleOpenCallModal = () => {
    if (cooldownSeconds > 0) return;
    setSelectedTable(null);
    setTableError("");
    setIsTableModalOpen(true);
    loadTables();
  };

  const handleCloseCallModal = () => {
    if (submittingCall) return;
    setIsTableModalOpen(false);
    setSelectedTable(null);
    setTableError("");
  };

  const handleConfirmCall = async () => {
    if (!selectedTable || !selectedTable.isAvailable || submittingCall) return;
    setSubmittingCall(true);
    setTableError("");

    try {
      await callWaiterPublic({
        tableNumber: selectedTable.tableNumber,
        tableId: selectedTable.id,
      });

      const until = Date.now() + COOLDOWN_SECONDS * 1000;
      try {
        localStorage.setItem(COOLDOWN_STORAGE_KEY, String(until));
      } catch {
        // ignorar errores de almacenamiento
      }
      setCooldownSeconds(COOLDOWN_SECONDS);
      setIsTableModalOpen(false);

      const num = extractTableNumber(selectedTable);
      setBanner({
        type: "success",
        title: `¡Atención solicitada para Mesa ${num}!`,
        message: "Un mesero fue notificado y se acercará a tu mesa en breve.",
      });
      await showSuccessAlert({
        title: "¡Atención solicitada!",
        text: `Se notificó al mesero para la Mesa #${num}. En breve se acercará a atenderte.`,
      });
    } catch (err) {
      setTableError(err?.message || "No se pudo enviar la solicitud.");
      loadTables();
    } finally {
      setSubmittingCall(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--md-sys-color-surface)] text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]">
      {/* Header público aislado: Logo izquierda, Solicitar atención al centro, Tema derecha */}
      <header className="sticky top-0 z-30 h-16 sm:h-[72px] shrink-0 bg-[var(--md-sys-color-surface-container-low)] border-b border-[var(--md-sys-color-outline-variant)] px-3 sm:px-6 grid grid-cols-[auto_1fr_auto] sm:grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
        <div className="flex items-center justify-start min-w-0">
          <BrandLogo
            className="h-5 sm:h-8 md:h-9 w-auto max-w-[115px] sm:max-w-[200px] md:max-w-none object-contain"
            alt="D'Piero Restaurante"
          />
        </div>

        <div className="flex items-center justify-center min-w-0">
          <Button
            type="button"
            variant={cooldownSeconds > 0 ? "outlined" : "filled"}
            size="md"
            leadingIcon={cooldownSeconds > 0 ? "schedule" : "room_service"}
            disabled={cooldownSeconds > 0}
            onClick={handleOpenCallModal}
            className={
              cooldownSeconds > 0
                ? "!bg-[var(--md-sys-color-surface-container-highest)] !text-[var(--md-sys-color-on-surface-variant)] !border-[var(--md-sys-color-outline-variant)] !opacity-100 cursor-not-allowed tabular-nums !px-3 sm:!px-6 text-xs sm:text-sm"
                : "m3-elevation-1 !px-3 sm:!px-6 text-xs sm:text-sm"
            }
          >
            {cooldownSeconds > 0
              ? `Espera ${formatCooldown(cooldownSeconds)}`
              : "Solicitar atención"}
          </Button>
        </div>

        <div className="flex items-center justify-end">
          <ThemeToggle hitSize={40} iconSize={24} />
        </div>
      </header>

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-4">
        {banner && (
          <Alert
            type={banner.type}
            title={banner.title}
            message={banner.message}
            onClose={() => setBanner(null)}
          />
        )}

        <PosProductsSection
          products={products}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={() => setSearchQuery("")}
          onSelectProduct={(product) => setSelectedProduct(product)}
        />
      </main>

      {/* Modal solo lectura: el cliente únicamente ve la descripción del producto */}
      <PosProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        readOnly={true}
      />

      {/* Overlay de selección de mesa para Solicitar Atención */}
      {isTableModalOpen &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="public-table-call-title"
            onClick={handleCloseCallModal}
            className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs font-[family-name:var(--main-font)]"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="dpiero-modal-in w-full max-w-2xl max-h-[90dvh] flex flex-col overflow-hidden rounded-[28px] bg-[var(--md-sys-color-surface-container-low)] border border-[var(--md-sys-color-outline-variant)] m3-elevation-3 text-[var(--md-sys-color-on-surface)]"
            >
              <div className="px-6 py-5 border-b border-[var(--md-sys-color-outline-variant)] flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div className="size-11 rounded-2xl bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                    <M3Icon name="room_service" size={24} />
                  </div>
                  <div className="min-w-0">
                    <h2
                      id="public-table-call-title"
                      className="text-title-lg font-semibold text-[var(--md-sys-color-on-surface)]"
                    >
                      Selecciona tu Mesa
                    </h2>
                    <p className="text-body-md text-[var(--md-sys-color-on-surface-variant)] mt-1">
                      Elige muy bien tu mesa antes de confirmar para que el mesero llegue al lugar correcto. Las mesas en uso aparecen bloqueadas.
                    </p>
                  </div>
                </div>
                <IconButton
                  ariaLabel="Cerrar selección de mesa"
                  onClick={handleCloseCallModal}
                  disabled={submittingCall}
                >
                  <M3Icon name="close" size={24} />
                </IconButton>
              </div>

              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                {loadingTables ? (
                  <div className="py-12 flex items-center justify-center text-body-md text-[var(--md-sys-color-on-surface-variant)]">
                    Cargando disponibilidad de mesas...
                  </div>
                ) : tables.length === 0 ? (
                  <div className="py-10 text-center text-body-md text-[var(--md-sys-color-on-surface-variant)]">
                    No hay mesas registradas en este momento.
                  </div>
                ) : (
                  <div
                    role="radiogroup"
                    aria-label="Mesas disponibles para solicitar atención"
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                  >
                    {tables.map((t) => {
                      const number = extractTableNumber(t);
                      const isBlocked = !t.isAvailable;
                      const isSelected = selectedTable?.id === t.id;

                      return (
                        <button
                          key={t.id}
                          type="button"
                          role="radio"
                          aria-checked={isSelected}
                          disabled={isBlocked || submittingCall}
                          onClick={() => {
                            if (isBlocked) return;
                            setSelectedTable(t);
                            setTableError("");
                          }}
                          className={`relative flex flex-col items-center justify-center gap-2 p-3.5 rounded-2xl border transition-colors text-center ${
                            isBlocked
                              ? "bg-[var(--md-sys-color-surface-container-highest)]/60 border-[var(--md-sys-color-outline-variant)] opacity-55 cursor-not-allowed"
                              : isSelected
                              ? "bg-[var(--md-sys-color-primary-container)]/40 border-2 border-[var(--md-sys-color-primary)] m3-elevation-1 cursor-pointer"
                              : "bg-[var(--md-sys-color-surface)] border-[var(--md-sys-color-outline-variant)] hover:border-[var(--md-sys-color-primary)] cursor-pointer m3-state"
                          }`}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <M3Icon
                              name={isBlocked ? "lock" : "table_restaurant"}
                              size={24}
                              className={
                                isBlocked
                                  ? "text-[var(--md-sys-color-error)]"
                                  : isSelected
                                  ? "text-[var(--md-sys-color-primary)]"
                                  : "text-[var(--md-sys-color-on-surface-variant)]"
                              }
                            />
                            <span className="text-title-md font-bold text-[var(--md-sys-color-on-surface)] tabular-nums">
                              #{number}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-label-sm font-medium border ${
                              isBlocked
                                ? "bg-[var(--md-sys-color-error-container)]/70 border-[var(--md-sys-color-error)]/40 text-[var(--md-sys-color-on-error-container)]"
                                : "bg-[var(--md-sys-color-primary-container)]/60 border-[var(--md-sys-color-primary)]/40 text-[var(--md-sys-color-on-primary-container)]"
                            }`}
                          >
                            {isBlocked ? "Bloqueada (En uso)" : "Disponible"}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}

                {tableError && (
                  <Alert
                    type="error"
                    title="No se pudo procesar"
                    message={tableError}
                  />
                )}
              </div>

              <div className="px-6 py-4 border-t border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] flex items-center justify-between gap-4 shrink-0">
                <Button
                  type="button"
                  variant="outlined"
                  size="md"
                  onClick={handleCloseCallModal}
                  disabled={submittingCall}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  variant="filled"
                  size="md"
                  leadingIcon="check_circle"
                  disabled={!selectedTable || submittingCall}
                  onClick={handleConfirmCall}
                >
                  {submittingCall ? "Enviando..." : "Confirmar"}
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
