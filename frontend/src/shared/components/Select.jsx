import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export default function Select({
  label,
  name,
  id,
  htmlFor,
  value,
  error,
  onChange,
  disabled = false,
  options = [],
  placeholder = "Seleccione una opción",
  includeEmptyOption = true,
  size = "md",
  className = "",
  buttonClassName = "",
  ariaLabel,
  ...props
}) {
  const autoId = useId();
  const selectId = id || htmlFor || name || autoId;
  const listboxId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [menuPos, setMenuPos] = useState({
    top: 0,
    left: 0,
    width: 200,
    maxHeight: 240,
  });

  const triggerRef = useRef(null);
  const menuRef = useRef(null);

  const normalizedOptions = useMemo(() => {
    const mapped = (Array.isArray(options) ? options : []).map((opt) => ({
      value: opt?.value ?? "",
      label: opt?.label ?? String(opt?.value ?? ""),
      disabled: Boolean(opt?.disabled),
    }));

    const hasEmpty = mapped.some((opt) => String(opt.value) === "");
    if (includeEmptyOption && !hasEmpty) {
      return [{ value: "", label: placeholder, disabled: false }, ...mapped];
    }
    return mapped;
  }, [options, includeEmptyOption, placeholder]);

  const selectedOption = useMemo(
    () =>
      normalizedOptions.find((opt) => String(opt.value) === String(value ?? "")) ||
      null,
    [normalizedOptions, value]
  );

  const displayText = selectedOption?.label || placeholder;
  const hasRealSelection =
    selectedOption !== null && String(selectedOption.value) !== "";

  const updatePosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 10;
    const spaceAbove = rect.top - 10;
    const openUpward = spaceBelow < 180 && spaceAbove > spaceBelow;
    const maxHeight = Math.min(
      240,
      Math.max(120, openUpward ? spaceAbove : spaceBelow)
    );
    const width = Math.max(rect.width, 130);
    const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));

    setMenuPos({
      top: openUpward ? undefined : rect.bottom + 6,
      bottom: openUpward ? window.innerHeight - rect.top + 6 : undefined,
      left,
      width,
      maxHeight,
    });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleClickOutside = (e) => {
      if (
        triggerRef.current?.contains(e.target) ||
        menuRef.current?.contains(e.target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    const handleScrollOrResize = (e) => {
      if (menuRef.current && e?.target instanceof Node && menuRef.current.contains(e.target)) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleScrollOrResize);
    window.addEventListener("scroll", handleScrollOrResize, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleScrollOrResize);
      window.removeEventListener("scroll", handleScrollOrResize, true);
    };
  }, [isOpen, updatePosition]);

  const handleToggle = () => {
    if (disabled) return;
    setIsOpen((prev) => {
      const next = !prev;
      if (next) updatePosition();
      return next;
    });
  };

  const handleSelectOption = (opt) => {
    if (disabled || opt.disabled) return;
    setIsOpen(false);
    triggerRef.current?.focus();

    onChange?.({
      target: {
        name: name || "",
        value: opt.value,
        type: "select-one",
      },
      currentTarget: {
        name: name || "",
        value: opt.value,
      },
    });
  };

  const sizeClasses =
    size === "sm"
      ? "h-10 px-3 text-sm rounded-lg"
      : size === "md"
      ? "h-12 px-4 text-base rounded-lg"
      : "h-14 px-4 text-base rounded-lg";

  return (
    <div className={`w-full mb-3 ${className}`}>
      {label && (
        <label
          htmlFor={selectId}
          onClick={() => !disabled && triggerRef.current?.focus()}
          className={`block text-xs mb-1.5 font-medium ${
            error ? "text-[var(--color-error)]" : "text-[var(--color-gray-200)]"
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
          w-full
          ${sizeClasses}
          border
          flex items-center justify-between gap-2 text-left
          transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary-400)]/30 cursor-pointer
          ${
            error
              ? "border-[var(--color-error)] focus:border-[var(--color-error)]"
              : isOpen
              ? "border-[var(--color-primary-400)]"
              : "border-[var(--color-secondary-700)] hover:border-[var(--color-secondary-600)] focus:border-[var(--color-primary-400)]"
          }
          bg-[var(--color-secondary-900)]
          ${hasRealSelection ? "text-[var(--color-white)]" : "text-[var(--color-gray-300)]"}
          disabled:opacity-50 disabled:cursor-not-allowed
          ${buttonClassName}
        `}
        {...props}
      >
        <span className="truncate">{displayText}</span>
        <ChevronDown
          className={`size-4 shrink-0 text-[var(--color-gray-400)] transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[var(--color-primary-400)]" : ""
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
              bottom:
                menuPos.bottom !== undefined ? `${menuPos.bottom}px` : undefined,
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
              maxHeight: `${menuPos.maxHeight}px`,
            }}
            className="dpiero-modal-in z-[220] overflow-y-auto rounded-xl border border-[var(--color-secondary-700)] bg-[var(--color-secondary-900)] p-1.5 shadow-2xl text-[var(--color-white)] font-[family-name:var(--main-font)]"
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-[var(--color-gray-400)]">
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
                      w-full min-h-[48px] flex items-center justify-between gap-2 text-left px-3 py-2.5 rounded-lg text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-400)]/50
                      ${
                        opt.disabled
                          ? "opacity-45 cursor-not-allowed text-[var(--color-gray-500)]"
                          : isSelected
                          ? "bg-[var(--color-primary-500)]/15 text-[var(--color-primary-400)] font-semibold cursor-pointer"
                          : "text-[var(--color-white)] hover:bg-[var(--color-secondary-800)] cursor-pointer"
                      }
                    `}
                  >
                    <span className="truncate">{opt.label}</span>
                    {isSelected && <Check className="size-3.5 shrink-0" />}
                  </button>
                );
              })
            )}
          </div>,
          document.body
        )}

      {error && (
        <p className="text-xs leading-4 text-[var(--color-error)] mt-1">{error}</p>
      )}
    </div>
  );
}
