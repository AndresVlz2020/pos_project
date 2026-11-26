import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import M3Icon from "./M3Icon";
import Button from "./Button";
import { IconButton } from "./IconButton";
import Input from "./Input";
import { ConfirmDialog } from "./ConfirmDialog";
import DataConsentField from "./DataConsentField";
import { useScrollLock } from "../hooks/useScrollLock";
import {
  getBiometricCapabilities,
  listMyBiometricsApi,
  enrollMyBiometricApi,
  deleteMyBiometricApi,
} from "@/services/biometricService";

function formatDateTime(value) {
  if (!value) return "Nunca usado";
  try {
    return new Date(value).toLocaleString("es-CO", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return String(value);
  }
}

export default function BiometricSettingsModal({
  isOpen,
  onClose,
  isAdmin = false,
  userName = "",
}) {
  useScrollLock(isOpen);

  const [capabilities, setCapabilities] = useState({
    supported: false,
    platformAvailable: false,
    secureContext: true,
    isDesktop: false,
    isWindows: false,
    reason: "",
  });
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [credToDelete, setCredToDelete] = useState(null);
  const [biometricConsent, setBiometricConsent] = useState(false);
  const [consentError, setConsentError] = useState("");
  const [deviceLabel, setDeviceLabel] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    const fetchInitial = async () => {
      try {
        const [capsResult, listResult] = await Promise.allSettled([
          getBiometricCapabilities(),
          listMyBiometricsApi(),
        ]);
        if (!active) return;

        if (capsResult.status === "fulfilled") {
          setCapabilities(capsResult.value);
        }

        if (listResult.status === "fulfilled") {
          setCredentials(listResult.value);
        } else {
          setFeedback({
            type: "error",
            message:
              listResult.reason?.message ||
              "No se pudieron cargar tus datos biométricos.",
          });
        }
      } catch (err) {
        if (!active) return;
        setFeedback({
          type: "error",
          message: err.message || "No se pudieron cargar tus datos biométricos.",
        });
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchInitial();
    return () => {
      active = false;
    };
  }, [isOpen]);

  const handleCloseModal = () => {
    setDeviceLabel("");
    setBiometricConsent(false);
    setConsentError("");
    setCredToDelete(null);
    setFeedback(null);
    setLoading(true);
    onClose();
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (enrolling) return;
    if (!biometricConsent) {
      setConsentError(
        "Debes autorizar el tratamiento de datos biométricos antes de vincular este dispositivo."
      );
      return;
    }
    setConsentError("");
    setEnrolling(true);
    setFeedback(null);

    try {
      const res = await enrollMyBiometricApi(deviceLabel);
      setDeviceLabel("");
      setBiometricConsent(false);
      setFeedback({
        type: "success",
        message: res?.message || "Dispositivo biométrico vinculado correctamente.",
      });
      const updated = await listMyBiometricsApi();
      setCredentials(updated);
    } catch (err) {
      setFeedback({
        type: err?.isUserCancelled ? "info" : "error",
        message: err.message || "No se pudo registrar este dispositivo.",
      });
    } finally {
      setEnrolling(false);
    }
  };

  const handleRequestDelete = (cred) => {
    if (deletingId) return;
    setCredToDelete(cred);
  };

  const handleConfirmDelete = async () => {
    if (!credToDelete || deletingId) return;
    const target = credToDelete;
    setDeletingId(target.id);
    setFeedback(null);
    try {
      await deleteMyBiometricApi(target.id);
      setCredentials((prev) => prev.filter((item) => item.id !== target.id));
      setFeedback({
        type: "success",
        message: `Dispositivo "${target.deviceLabel}" desvinculado.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "No se pudo eliminar el dispositivo.",
      });
    } finally {
      setDeletingId(null);
      setCredToDelete(null);
    }
  };

  if (!isOpen) return null;

  const canEnroll =
    capabilities.secureContext &&
    capabilities.supported &&
    capabilities.platformAvailable;
  const currentDeviceCred = credentials.find((cred) => cred.isCurrentDevice) || null;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-settings-title"
    >
      <div className="dpiero-modal-in w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)]">
        <div className="flex items-start justify-between gap-3 pb-4 mb-4 border-b border-[var(--md-sys-color-outline-variant)] shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
              <M3Icon name="fingerprint" size={22} />
            </div>
            <div className="min-w-0">
              <h3
                id="biometric-settings-title"
                className="text-2xl leading-8 font-medium text-[var(--md-sys-color-on-surface)]"
              >
                Datos Biométricos (Opcional)
              </h3>
              <p className="text-xs leading-4 text-[var(--md-sys-color-on-surface-variant)]">
                {userName ? `Cuenta: ${userName}` : "Configuración personal de acceso"}
              </p>
            </div>
          </div>

          <IconButton
            ariaLabel="Cerrar configuración biométrica"
            variant="standard"
            onClick={handleCloseModal}
          >
            <M3Icon name="close" size={20} />
          </IconButton>
        </div>

        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 space-y-4 pr-1">
          <div className="rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-4 text-xs text-[var(--md-sys-color-on-surface-variant)] space-y-1">
            <div className="flex items-center gap-1.5 font-medium text-[var(--md-sys-color-primary)]">
              <M3Icon name="verified_user" size={18} />
              <span>Uso de biometría en tu perfil</span>
            </div>
            <p className="leading-4">
              {isAdmin
                ? "Opcional: vincula Windows Hello (sensor de huella en PC), Touch ID o tu huella/Face ID móvil para iniciar sesión y confirmar acciones administrativas."
                : "Opcional: puedes seguir usando tu PIN siempre, o vincular Windows Hello (huella en PC), Huella o Face ID desde tu dispositivo compatible."}
            </p>
          </div>

          {feedback && (
            <div
              className={`rounded-xl px-4 py-3 text-xs font-medium border ${
                feedback.type === "success"
                  ? "bg-[var(--md-sys-color-primary-container)] border-[var(--md-sys-color-outline-variant)] text-[var(--md-sys-color-on-primary-container)]"
                  : feedback.type === "info"
                  ? "bg-[var(--color-warning-bg)] border-[var(--color-warning-border)] text-[var(--color-warning)]"
                  : "bg-[var(--md-sys-color-error-container)] border-[var(--color-error-border)] text-[var(--md-sys-color-on-error-container)]"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--md-sys-color-on-surface-variant)]">
              <M3Icon name="progress_activity" size={18} className="animate-spin text-[var(--md-sys-color-primary)]" />
              <span>Comprobando sensor y credenciales registradas...</span>
            </div>
          ) : (
            <>
              {!capabilities.secureContext ? (
                <div className="rounded-xl bg-[var(--color-warning-bg)] border border-[var(--color-warning-border)] p-4 flex items-start gap-2.5 text-xs text-[var(--md-sys-color-on-surface)]">
                  <M3Icon name="warning" filled size={18} className="mt-0.5 text-[var(--color-warning)]" />
                  <div>
                    <p className="font-medium text-[var(--color-warning)]">
                      Conexión no segura detectada
                    </p>
                    <p className="text-[var(--md-sys-color-on-surface-variant)] mt-0.5">
                      Los navegadores solo permiten registrar o leer huellas en{" "}
                      <strong>HTTPS</strong> o <strong>localhost</strong>.
                    </p>
                  </div>
                </div>
              ) : currentDeviceCred ? (
                <div className="rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-primary)]/40 p-4 space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 font-medium text-[var(--md-sys-color-primary)]">
                    <M3Icon name="check_circle" filled size={18} />
                    <span>Este dispositivo ya está vinculado</span>
                  </div>
                  <p className="text-[var(--md-sys-color-on-surface-variant)] leading-4">
                    Tu huella o Face ID de{" "}
                    <strong className="text-[var(--md-sys-color-on-surface)]">
                      {currentDeviceCred.deviceLabel}
                    </strong>{" "}
                    ya está registrado en tu cuenta. Si deseas volver a registrarlo, primero desvincula el registro actual abajo.
                  </p>
                </div>
              ) : canEnroll ? (
                <form
                  onSubmit={handleEnroll}
                  className="rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-medium text-[var(--md-sys-color-primary)]">
                    <M3Icon name="check_circle" filled size={18} />
                    <span>Este dispositivo admite Huella o Face ID</span>
                  </div>

                  <Input
                    label="Nombre de este dispositivo (opcional)"
                    type="text"
                    size="md"
                    maxLength={80}
                    value={deviceLabel}
                    onChange={(e) => setDeviceLabel(e.target.value)}
                    placeholder={
                      capabilities.isWindows
                        ? "Ej: Portátil Caja Windows Hello, PC Gerencia..."
                        : "Ej: Celular Caja, Tablet Cocina, Mi iPhone..."
                    }
                  />

                  <DataConsentField
                    id="biometric-data-consent"
                    name="biometricConsent"
                    checked={biometricConsent}
                    onChange={(e) => {
                      setBiometricConsent(e.target.checked);
                      if (consentError) setConsentError("");
                    }}
                    label="Autorizo el tratamiento de datos biométricos personales para autenticación en D'Piero."
                    error={consentError}
                  />

                  <Button
                    type="submit"
                    variant="filled"
                    size="lg"
                    disabled={enrolling}
                    leadingIcon={enrolling ? "progress_activity" : "fingerprint"}
                    className="w-full"
                  >
                    {enrolling
                      ? "Confirma con tu huella o Face ID..."
                      : capabilities.isWindows
                        ? "Registrar huella con Windows Hello"
                        : "Registrar huella o Face ID de este dispositivo"}
                  </Button>
                </form>
              ) : (
                <div className="rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] p-4 flex items-start gap-2.5 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                  <M3Icon name="warning" filled size={18} className="mt-0.5 text-[var(--color-warning)]" />
                  <div>
                    <p className="font-medium text-[var(--md-sys-color-on-surface)]">
                      Este dispositivo no tiene sensor biométrico disponible
                    </p>
                    <p className="mt-0.5 leading-4">
                      {capabilities.isWindows
                        ? "Verifica que Windows Hello con huella esté configurado en tu equipo, o continúa usando tu contraseña o PIN."
                        : "Puedes continuar usando tu contraseña o PIN en este equipo, y administrar abajo cualquier dispositivo registrado."}
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)]">
                    Dispositivos registrados ({credentials.length})
                  </h4>
                </div>

                {credentials.length === 0 ? (
                  <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] py-5 text-center rounded-xl border border-dashed border-[var(--md-sys-color-outline-variant)]">
                    Aún no tienes dispositivos biométricos vinculados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {credentials.map((cred) => (
                      <li
                        key={cred.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[var(--md-sys-color-surface-container)] border border-[var(--md-sys-color-outline-variant)] px-4 py-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <M3Icon name="devices" size={18} className="text-[var(--md-sys-color-primary)]" />
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <p className="text-sm font-medium text-[var(--md-sys-color-on-surface)] truncate">
                                {cred.deviceLabel}
                              </p>
                              {cred.isCurrentDevice && (
                                <span className="text-label-sm font-medium px-2 py-0.5 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] shrink-0">
                                  Este dispositivo
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] truncate">
                              Registrado: {formatDateTime(cred.createdAt)} · Último uso:{" "}
                              {formatDateTime(cred.lastUsedAt)}
                            </p>
                          </div>
                        </div>

                        <IconButton
                          variant="standard"
                          ariaLabel={`Desvincular ${cred.deviceLabel}`}
                          title="Desvincular este dispositivo"
                          disabled={deletingId === cred.id}
                          onClick={() => handleRequestDelete(cred)}
                          className="hover:text-[var(--md-sys-color-error)]"
                        >
                          <M3Icon
                            name={deletingId === cred.id ? "progress_activity" : "delete"}
                            size={18}
                            className={deletingId === cred.id ? "animate-spin" : ""}
                          />
                        </IconButton>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(credToDelete)}
        title="Confirmar eliminación de huella"
        description={
          credToDelete
            ? `¿Estás seguro de que deseas desvincular la huella registrada en "${credToDelete.deviceLabel}"? Tendrás que volver a registrarla si deseas usarla en ese equipo.`
            : ""
        }
        confirmText="Sí, eliminar huella"
        cancelText="Cancelar"
        isDestructive={true}
        isLoading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!deletingId) setCredToDelete(null);
        }}
      />
    </div>,
    document.body
  );
}
