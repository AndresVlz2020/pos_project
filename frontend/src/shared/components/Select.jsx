import { useState, useRef, useEffect, useId, useCallback } from "react";
import { createPortal } from "react-dom";
import M3Icon from "./M3Icon";

export default function Select({
  label,
  error,
  name,
  value = "",
  onChange,
  options = [],
  placeholder = "Seleccione...",
  includeEmptyOption = true,
  disabled = false,
  size = "lg",
  leadingIcon,
  className = "",
  buttonClassName = "",
  ariaLabel,
  id,
  ...props
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    width: 220,
    maxHeight: 240,
  });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const reactId = useId();
  const selectId = id || name || `select-${reactId}`;
  const listboxId = `${selectId}-listbox`;

  const normalizedOptions = [];
  if (includeEmptyOption && placeholder) {
    normalizedOptions.push({ value: "", label: placeholder, disabled: false });
  }
  for (const opt of options) {
    if (typeof opt === "string" || typeof opt === "number") {
      normalizedOptions.push({ value: String(opt), label: String(opt), disabled: false });
    } else if (opt && typeof opt === "object") {
      normalizedOptions.push({
        value: opt.value ?? opt.id ?? "",
        label: opt.label ?? opt.name ?? String(opt.value ?? ""),
        disabled: Boolean(opt.disabled),
      });
    }
  }

  const selectedOption = normalizedOptions.find(
    (opt) => String(opt.value) === String(value ?? "")
  );

  const displayText = selectedOption ? selectedOption.label : placeholder || "Seleccione...";
  const hasRealSelection =
    selectedOption !== undefined && String(selectedOption.value) !== "";

  const updateMenuPosition = useCallback(() => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(280, openUpward ? spaceAbove : spaceBelow));

    const minWidth = Math.max(rect.width, 140);
    let left = rect.left;
    if (left + minWidth > window.innerWidth - 12) {
      left = Math.max(12, window.innerWidth - minWidth - 12);
    }

    setMenuPos({
      top: openUpward ? undefined : rect.bottom + 4,
      bottom: openUpward ? window.innerHeight - rect.top + 4 : undefined,
      left,
      width: minWidth,
      maxHeight,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updateMenuPosition();

    const handleOutside = (e) => {
      if (triggerRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setIsOpen(false);
    };
    const handleKey = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };
    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleReposition, true);
    window.addEventListener("resize", handleReposition);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleReposition, true);
      window.removeEventListener("resize", handleReposition);
    };
  }, [isOpen, updateMenuPosition]);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) updateMenuPosition();
    setIsOpen((prev) => !prev);
  };

  const handleSelectOption = (opt) => {
    if (opt.disabled) return;
    setIsOpen(false);
    triggerRef.current?.focus();
    onChange?.({
      target: { name: name || "", value: opt.value, type: "select-one" },
      currentTarget: { name: name || "", value: opt.value },
    });
  };

  const sizeClasses =
    size === "sm"
      ? "h-10 px-3 text-sm"
      : size === "md"
      ? "h-12 px-4 text-base"
      : "h-14 px-4 text-base";

  return (
    <div className={`w-full mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => !disabled && triggerRef.current?.focus()}
          className={`block text-xs leading-4 mb-1.5 font-medium ${
            error
              ? "text-[var(--md-sys-color-error)]"
              : isOpen
              ? "text-[var(--md-sys-color-primary)]"
              : "text-[var(--md-sys-color-on-surface-variant)]"
          }`}
        >
          {label}
        </label>
      )}

      {name && <input type="hidden" name={name} value={value ?? ""} />}

      <button
        ref={triggerRef}
        id={selectId}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={ariaLabel || label || placeholder}
        disabled={disabled}
        onClick={handleToggle}
        className={`
          m3-outlined-field w-full ${sizeClasses}
          flex items-center justify-between gap-2 text-left cursor-pointer outline-none
          ${isOpen ? "is-focused" : ""}
          ${error ? "is-error" : ""}
          ${hasRealSelection ? "text-[var(--md-sys-color-on-surface)]" : "text-[var(--md-sys-color-on-surface-variant)]"}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonClassName}
        `}
        {...props}
      >
        <span className="flex items-center gap-2 min-w-0">
          {leadingIcon && (
            <M3Icon
              name={leadingIcon}
              size={18}
              className="text-[var(--md-sys-color-on-surface-variant)] shrink-0"
            />
          )}
          <span className="truncate">{displayText}</span>
        </span>
        <M3Icon
          name="keyboard_arrow_down"
          size={20}
          className={`transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[var(--md-sys-color-primary)]" : "text-[var(--md-sys-color-on-surface-variant)]"
          }`}
        />
      </button>

      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            id={listboxId}
            role="listbox"
            style={{
              position: "fixed",
              top: menuPos.top !== undefined ? `${menuPos.top}px` : undefined,
              bottom: menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
              maxHeight: `${menuPos.maxHeight}px`,
            }}
            className="dpiero-modal-in z-[220] overflow-y-auto rounded-[4px] border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container)] py-1.5 m3-elevation-2 text-[var(--md-sys-color-on-surface)] font-[family-name:var(--main-font)]"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-4 py-3 text-xs text-[var(--md-sys-color-on-surface-variant)]">
                Sin opciones disponibles
              </div>
            ) : (
              normalizedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value ?? "");
                return (
                  <button
                    key={String(opt.value)}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    disabled={opt.disabled}
                    onClick={() => handleSelectOption(opt)}
                    className={`
                      m3-state w-full min-h-[48px] flex items-center justify-between gap-2 text-left px-4 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)]
                      ${
                        opt.disabled
                          ? "opacity-38 cursor-not-allowed text-[var(--md-sys-color-on-surface-variant)]"
                          : isSelected
                          ? "bg-[var(--md-sys-color-secondary-container)] text-[var(--md-sys-color-on-secondary-container)] font-medium cursor-pointer"
                          : "text-[var(--md-sys-color-on-surface)] cursor-pointer"
                      }
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <M3Icon name="check" size={18} />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}

      {error && (
        <span className="block text-xs leading-4 text-[var(--md-sys-color-error)] mt-1">
          {error}
        </span>
      )}
    </div>
  );
}
