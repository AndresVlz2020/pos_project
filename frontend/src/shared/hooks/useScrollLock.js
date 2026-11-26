import { useEffect } from "react";

let activeLockCount = 0;
let previousHtmlOverflow = "";
let previousBodyOverflow = "";
let previousHtmlOverscroll = "";
let previousBodyOverscroll = "";

/**
 * Bloquea el scroll del documento (html y body) mientras haya al menos un overlay activo.
 * Usa conteo de referencias para soportar modales apilados sin desbloquear el fondo antes de tiempo.
 */
export function useScrollLock(isLocked = true) {
  useEffect(() => {
    if (!isLocked || typeof document === "undefined") return;

    if (activeLockCount === 0) {
      previousHtmlOverflow = document.documentElement.style.overflow;
      previousBodyOverflow = document.body.style.overflow;
      previousHtmlOverscroll = document.documentElement.style.overscrollBehavior;
      previousBodyOverscroll = document.body.style.overscrollBehavior;

      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
      document.documentElement.style.overscrollBehavior = "none";
      document.body.style.overscrollBehavior = "none";
    }

    activeLockCount += 1;

    return () => {
      activeLockCount = Math.max(0, activeLockCount - 1);
      if (activeLockCount === 0) {
        document.documentElement.style.overflow = previousHtmlOverflow;
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overscrollBehavior = previousHtmlOverscroll;
        document.body.style.overscrollBehavior = previousBodyOverscroll;
      }
    };
  }, [isLocked]);
}
