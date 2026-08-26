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
        absolute
        z-50
        mt-1
        min-w-48
        border
        text-text-inverse
        p-1
        dark:bg-neutral-950/80
        backdrop-blur-[1px]
        shadow-lg
        rounded-2xl
        overflow-hidden
        hover:shadow-black
        transition-shadow duration-700
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
        w-full text-left px-3 py-2 rounded-lg
        hover:bg-gray-500 focus:bg-gray-100
        transition-colors
        ${className}
      `}
    >
      {children}
    </button>
  )
}