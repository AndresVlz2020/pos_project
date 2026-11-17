import { useState, useEffect } from "react";
import { IconButton } from "@/shared";
import M3Icon from "./M3Icon";

export function ThemeToggle({ className = "", hitSize = 40, iconSize = 20 }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "light");
  const isDark = theme === "dark";

  useEffect(() => {
    const root = document.documentElement;
    root.classList.add("m3-theme-switching");
    root.classList.toggle("theme-dark", isDark);
    root.classList.toggle("dark", isDark);
    root.classList.toggle("theme-light", !isDark);
    localStorage.setItem("app_theme", theme);

    let raf2 = 0;
    const raf1 = requestAnimationFrame(() => {
      raf2 = requestAnimationFrame(() => {
        root.classList.remove("m3-theme-switching");
      });
    });
    return () => {
      cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, [theme, isDark]);

  return (
    <IconButton
      hitSize={hitSize}
      iconSize={iconSize}
      variant="tonal"
      ariaLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      title={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={className}
    >
      <M3Icon name={isDark ? "light_mode" : "dark_mode"} size={iconSize} />
    </IconButton>
  );
}

export default ThemeToggle;
