import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  cloneElement
} from "react"

const DropdownContext = createContext(null)

export function Dropdown({
  children,
  open: controlledOpen,
  onOpenChange,
  className = ""
}) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isControlled = controlledOpen !== undefined
  const open = isControlled ? controlledOpen : uncontrolledOpen

  const setOpen = useCallback((value) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setUncontrolledOpen(value)
    }
  }, [isControlled, onOpenChange])

  const containerRef = useRef(null)

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [setOpen])

  // Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") setOpen(false)
    }

    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [setOpen])

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className={`relative inline-block ${className}`}>
        {children}
      </div>
    </DropdownContext.Provider>
  )
}

// Trigger (asChild pattern)
export function DropdownTrigger({ children }) {
  const { open, setOpen } = useContext(DropdownContext)

  if (!children) return null

  return cloneElement(children, {
    onClick: (e) => {
      children.props.onClick?.(e)
      setOpen(!open)
    },
    "aria-expanded": open,
    "aria-haspopup": "menu"
  })
}

// Content
export function DropdownContent({ children, className = "" }) {
  const { open } = useContext(DropdownContext)

  if (!open) return null

  return (
    <div
      role="menu"
      className={`
        dpiero-modal-in
        absolute
        z-50
        mt-1.5
        min-w-48
        border
        border-[var(--color-secondary-700)]
        bg-[var(--color-secondary-900)]
        text-[var(--color-white)]
        p-1.5
        shadow-xl
        rounded-xl
        overflow-hidden
        ${className}
      `}
    >
      {children}
    </div>
  )
}

// Item
export function DropdownItem({
  children,
  onClick,
  className = ""
}) {
  const { setOpen } = useContext(DropdownContext)

  const handleClick = (e) => {
    onClick?.(e)
    setOpen(false)
  }

  return (
    <button
      role="menuitem"
      onClick={handleClick}
      className={`
        w-full min-h-[48px] flex items-center text-left px-3 py-2.5 rounded-lg text-sm font-medium
        hover:bg-[var(--color-secondary-800)] focus:bg-[var(--color-secondary-800)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--color-primary-400)]/50
        text-[var(--color-white)]
        transition-colors cursor-pointer
        ${className}
      `}
    >
      {children}
    </button>
  )
}