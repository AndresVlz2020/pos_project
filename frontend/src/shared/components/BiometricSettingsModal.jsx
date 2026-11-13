// frontend/src/shared/components/BiometricSettingsModal.jsx
// Modal opcional para que cualquier usuario (Admin, Cajero, Mesero o Cocina)
// registre, consulte y revoque sus credenciales biométricas WebAuthn por dispositivo.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  Fingerprint,
  Smartphone,
  Trash2,
  X,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
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
  const [capabilities, setCapabilities] = useState({
    supported: false,
    platformAvailable: false,
    secureContext: true,
  });
  const [credentials, setCredentials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deviceLabel, setDeviceLabel] = useState("");
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;

    const fetchInitial = async () => {
      try {
        const [caps, list] = await Promise.all([
          getBiometricCapabilities(),
          listMyBiometricsApi(),
        ]);
        if (!active) return;
        setCapabilities(caps);
        setCredentials(list);
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
    setFeedback(null);
    setLoading(true);
    onClose();
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (enrolling) return;
    setEnrolling(true);
    setFeedback(null);

    try {
      const res = await enrollMyBiometricApi(deviceLabel);
      setDeviceLabel("");
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

  const handleDelete = async (cred) => {
    if (deletingId) return;
    setDeletingId(cred.id);
    setFeedback(null);
    try {
      await deleteMyBiometricApi(cred.id);
      setCredentials((prev) => prev.filter((item) => item.id !== cred.id));
      setFeedback({
        type: "success",
        message: `Dispositivo "${cred.deviceLabel}" desvinculado.`,
      });
    } catch (err) {
      setFeedback({
        type: "error",
        message: err.message || "No se pudo eliminar el dispositivo.",
      });
    } finally {
      setDeletingId(null);
    }
  };

  if (!isOpen) return null;

  const canEnroll = capabilities.supported && capabilities.platformAvailable;

  return createPortal(
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="biometric-settings-title"
    >
      <div className="dpiero-modal-in w-full max-w-lg max-h-[90dvh] flex flex-col overflow-hidden rounded-2xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-800)] p-5 sm:p-6 shadow-2xl text-[var(--color-white)]">
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-3 pb-3 mb-4 border-b border-[var(--color-secondary-800)] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="size-10 rounded-xl bg-[var(--color-primary-500)]/15 border border-[var(--color-primary-500)]/40 flex items-center justify-center shrink-0">
              <Fingerprint className="size-5 text-[var(--color-primary-400)]" />
            </div>
            <div>
              <h3 id="biometric-settings-title" className="text-base sm:text-lg font-bold">
                Datos Biométricos (Opcional)
              </h3>
              <p className="text-xs text-[var(--color-gray-400)]">
                {userName ? `Cuenta: ${userName}` : "Configuración personal de acceso"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCloseModal}
            aria-label="Cerrar configuración biométrica"
            className="text-[var(--color-gray-400)] hover:text-white p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden flex-1 min-h-0 space-y-4 pr-1">
          {/* Explicación contextual según rol */}
          <div className="rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] p-3.5 text-xs text-[var(--color-gray-300)] space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-[var(--color-primary-400)]">
              <ShieldCheck className="size-4 shrink-0" />
              <span>Uso de biometría en tu perfil</span>
            </div>
            <p className="leading-relaxed">
              {isAdmin
                ? "Podrás iniciar sesión con huella en dispositivos compatibles y autorizar acciones críticas del sistema. En equipos sin sensor seguirás usando tu contraseña."
                : "Podrás usar tu huella o Face ID para iniciar tu turno rápidamente en lugar del PIN. Sigue siendo opcional: tu PIN siempre permanece disponible."}
            </p>
          </div>

          {feedback && (
            <div
              className={`rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
                feedback.type === "success"
                  ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200"
                  : feedback.type === "info"
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-100"
                  : "bg-red-500/15 border-red-500/40 text-red-200"
              }`}
            >
              {feedback.message}
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center gap-2 py-8 text-xs text-[var(--color-gray-400)]">
              <Loader2 className="size-4 animate-spin text-[var(--color-primary-400)]" />
              <span>Comprobando sensor y credenciales registradas...</span>
            </div>
          ) : (
            <>
              {/* Bloque de compatibilidad del dispositivo actual */}
              {!capabilities.secureContext ? (
                <div className="rounded-xl bg-amber-500/10 border border-amber-500/40 p-3.5 flex items-start gap-2.5 text-xs text-amber-100">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <p className="font-semibold">Conexión no segura detectada</p>
                    <p className="text-amber-200/90 mt-0.5">
                      Los navegadores solo permiten registrar o leer huellas en{" "}
                      <strong>HTTPS</strong> o <strong>localhost</strong>.
                    </p>
                  </div>
                </div>
              ) : canEnroll ? (
                <form
                  onSubmit={handleEnroll}
                  className="rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] p-4 space-y-3"
                >
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                    <CheckCircle2 className="size-4 shrink-0" />
                    <span>Este dispositivo tiene biometría compatible disponible</span>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-gray-300)] mb-1">
                      Nombre de este dispositivo (opcional)
                    </label>
                    <input
                      type="text"
                      maxLength={80}
                      value={deviceLabel}
                      onChange={(e) => setDeviceLabel(e.target.value)}
                      placeholder="Ej: Celular Caja, Tablet Cocina, Mi iPhone..."
                      className="w-full rounded-xl bg-[var(--color-secondary-900)] border border-[var(--color-secondary-700)] px-3 py-2 text-xs text-white placeholder:text-[var(--color-gray-500)] focus:outline-none focus:border-[var(--color-primary-500)]"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={enrolling}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-600)] text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer disabled:opacity-60"
                  >
                    {enrolling ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Fingerprint className="size-4" />
                    )}
                    <span>
                      {enrolling
                        ? "Toca el sensor de tu dispositivo..."
                        : "Registrar huella de este dispositivo"}
                    </span>
                  </button>
                </form>
              ) : (
                <div className="rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] p-3.5 flex items-start gap-2.5 text-xs text-[var(--color-gray-300)]">
                  <AlertTriangle className="size-4 shrink-0 mt-0.5 text-[var(--color-gray-400)]" />
                  <div>
                    <p className="font-semibold text-white">
                      Este equipo no tiene lector biométrico activo
                    </p>
                    <p className="text-[var(--color-gray-400)] mt-0.5">
                      Puedes abrir tu sesión desde un teléfono o portátil con huella/Face ID
                      para vincularlo aquí, y administrar tus dispositivos registrados debajo.
                    </p>
                  </div>
                </div>
              )}

              {/* Dispositivos vinculados */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-gray-400)]">
                    Dispositivos registrados ({credentials.length})
                  </h4>
                </div>

                {credentials.length === 0 ? (
                  <p className="text-xs text-[var(--color-gray-400)] py-4 text-center rounded-xl border border-dashed border-[var(--color-secondary-800)]">
                    Aún no tienes dispositivos biométricos vinculados.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {credentials.map((cred) => (
                      <li
                        key={cred.id}
                        className="flex items-center justify-between gap-3 rounded-xl bg-[var(--color-secondary-950)] border border-[var(--color-secondary-800)] px-3.5 py-2.5"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Smartphone className="size-4 text-[var(--color-primary-400)] shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">
                              {cred.deviceLabel}
                            </p>
                            <p className="text-[11px] text-[var(--color-gray-400)] truncate">
                              Registrado: {formatDateTime(cred.createdAt)} · Último uso:{" "}
                              {formatDateTime(cred.lastUsedAt)}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleDelete(cred)}
                          disabled={deletingId === cred.id}
                          title="Desvincular este dispositivo"
                          className="p-2 rounded-lg text-[var(--color-gray-400)] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer shrink-0 disabled:opacity-50"
                        >
                          {deletingId === cred.id ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Trash2 className="size-4" />
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
