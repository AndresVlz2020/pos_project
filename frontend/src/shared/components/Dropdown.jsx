import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  cloneElement,
} from "react";
import M3Icon from "./M3Icon";

const DropdownContext = createContext(null);

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  className = "",
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : uncontrolledOpen;

  const setOpen = useCallback(
    (value) => {
      if (isControlled) {
        onOpenChange?.(value);
      } else {
        setUncontrolledOpen(value);
      }
    },
    [isControlled, onOpenChange]
  );

  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setOpen]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [setOpen]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ children }) {
  const { open, setOpen } = useContext(DropdownContext);
  if (!children) return null;

  return cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e);
      setOpen(!open);
    },
    "aria-expanded": open,
    "aria-haspopup": "menu",
  });
}

export function DropdownContent({ children, className = "" }) {
  const { open } = useContext(DropdownContext);
  if (!open) return null;

  return (
    <div
      role="menu"
      className={`
        dpiero-modal-in absolute right-0 mt-2 min-w-[224px] py-1.5
        bg-[var(--md-sys-color-surface-container)]
        border border-[var(--md-sys-color-outline-variant)]
        rounded-[4px] m3-elevation-2 z-50
        text-[var(--md-sys-color-on-surface)]
        ${className}
      `}
    >
      {children}
    </div>
  );
}

export function DropdownItem({ children, icon, onClick, className = "" }) {
  const { setOpen } = useContext(DropdownContext);

  const handleClick = (e) => {
    onClick?.(e);
    setOpen(false);
  };

  return (
    <button
      role="menuitem"
      type="button"
      onClick={handleClick}
      className={`
        m3-state w-full min-h-[48px] flex items-center gap-3 text-left px-4 py-2 text-sm font-normal
        text-[var(--md-sys-color-on-surface)]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--md-sys-color-primary)]
        cursor-pointer
        ${className}
      `}
    >
      {icon && (
        <M3Icon
          name={icon}
          size={20}
          className="text-[var(--md-sys-color-on-surface-variant)]"
        />
      )}
      <span className="flex-1 truncate">{children}</span>
    </button>
  );
}
