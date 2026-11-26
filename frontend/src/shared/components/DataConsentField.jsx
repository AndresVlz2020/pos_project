import { useState } from "react";
import { createPortal } from "react-dom";
import Checkbox from "./Checkbox";
import Button from "./Button";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";
import { useScrollLock } from "../hooks/useScrollLock";

/**
 * Checkbox reutilizable de autorización de tratamiento de datos personales (Ley 1581 de 2012)
 * con modal informativo ligero sobre finalidad y derechos del titular.
 */
export default function DataConsentField({
  id = "data-consent-checkbox",
  name = "dataConsentAccepted",
  checked = false,
  onChange,
  error = "",
  label = "Autorizo el tratamiento de datos personales conforme a la política de privacidad.",
  disabled = false,
  className = "",
}) {
  const [showPolicy, setShowPolicy] = useState(false);

  useScrollLock(showPolicy);

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="rounded-xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] px-3.5 py-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Checkbox
            id={id}
            name={name}
            label={label}
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className="!min-h-[38px] !py-1 text-xs sm:text-sm"
          />
          <button
            type="button"
            onClick={() => setShowPolicy(true)}
            className="text-xs font-semibold text-[var(--md-sys-color-primary)] hover:underline px-2 py-1 rounded-full cursor-pointer shrink-0"
          >
            Ver política
          </button>
        </div>
      </div>

      {error && (
        <p className="text-xs leading-4 text-[var(--md-sys-color-error)] flex items-center gap-1 px-1">
          <M3Icon name="error" size={14} />
          <span>{error}</span>
        </p>
      )}

      {showPolicy &&
        createPortal(
          <div
            className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-[var(--md-sys-color-scrim)] backdrop-blur-xs font-[family-name:var(--main-font)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="data-policy-modal-title"
            onClick={() => setShowPolicy(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              className="dpiero-modal-in w-full max-w-lg rounded-[28px] bg-[var(--md-sys-color-surface-container-high)] border border-[var(--md-sys-color-outline-variant)] p-5 sm:p-6 m3-elevation-3 text-[var(--md-sys-color-on-surface)] space-y-4"
            >
              <div className="flex items-start justify-between gap-3 border-b border-[var(--md-sys-color-outline-variant)] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="size-10 rounded-full bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)] flex items-center justify-center shrink-0">
                    <M3Icon name="verified_user" size={20} />
                  </div>
                  <div>
                    <h3
                      id="data-policy-modal-title"
                      className="text-lg font-semibold text-[var(--md-sys-color-on-surface)]"
                    >
                      Tratamiento de Datos Personales
                    </h3>
                    <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                      Política de Protección de Datos · D&apos;Piero POS
                    </p>
                  </div>
                </div>
                <IconButton
                  ariaLabel="Cerrar política"
                  variant="standard"
                  onClick={() => setShowPolicy(false)}
                >
                  <M3Icon name="close" size={20} />
                </IconButton>
              </div>

              <div className="text-xs sm:text-sm leading-relaxed text-[var(--md-sys-color-on-surface-variant)] space-y-2.5 max-h-[55dvh] overflow-y-auto pr-1">
                <p>
                  En cumplimiento de la Ley 1581 de 2012 y el Decreto 1377 de 2013, los datos personales
                  suministrados (nombre, documento de identidad, teléfono, correo electrónico, fotografía
                  de perfil y credenciales de acceso biométrico opcionales) son recolectados y tratados por{" "}
                  <strong className="text-[var(--md-sys-color-on-surface)]">D&apos;Piero Restaurante</strong>{" "}
                  exclusivamente para fines operativos, autenticación segura, control de turnos, trazabilidad
                  de órdenes e inventario y soporte técnico.
                </p>
                <p>
                  Las llaves biométricas WebAuthn / Windows Hello no almacenan imágenes ni plantillas de tu
                  huella en el servidor: únicamente se guarda la llave pública criptográfica verificada por tu
                  propio dispositivo.
                </p>
                <p>
                  Como titular, tienes derecho a conocer, actualizar y rectificar tu información solicitándolo
                  al Administrador del sistema o mediante el correo de soporte publicado en la plataforma.
                </p>
              </div>

              <div className="flex justify-end pt-2 border-t border-[var(--md-sys-color-outline-variant)]">
                <Button variant="filled" size="md" onClick={() => setShowPolicy(false)}>
                  Entendido
                </Button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
