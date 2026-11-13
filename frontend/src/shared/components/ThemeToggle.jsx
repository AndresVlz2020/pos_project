import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "@/shared";

export function ThemeToggle({ className = "", hitSize = 48, iconSize = 24 }) {
  const [theme, setTheme] = useState(() => localStorage.getItem("app_theme") || "dark");
  const isDark = theme === "dark";

  useEffect(() => {
    document.documentElement.classList.toggle("theme-dark", isDark);
    document.documentElement.classList.toggle("theme-light", !isDark);
    localStorage.setItem("app_theme", theme);
  }, [theme, isDark]);

  const Icon = isDark ? Sun : Moon;

  return (
    <IconButton
      hitSize={hitSize}
      iconSize={iconSize}
      ariaLabel={isDark ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`text-white hover:bg-[var(--color-secondary-800)] border border-[var(--color-secondary-700)] ${className}`}
    >
      <Icon className="size-4.5 sm:size-5 text-[var(--color-primary-400)]" />
    </IconButton>
  );
}

export default ThemeToggle;


