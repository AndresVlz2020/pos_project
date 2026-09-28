import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";
import { IconButton } from "@/shared";

export function ThemeToggle({ className = "" }) {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("app_theme") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "light") {
      root.classList.add("theme-light");
      root.classList.remove("theme-dark");
    } else {
      root.classList.add("theme-dark");
      root.classList.remove("theme-light");
    }
    localStorage.setItem("app_theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <IconButton
      ariaLabel={theme === "dark" ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
      onClick={toggleTheme}
      className={`text-white hover:bg-[var(--color-primary-800)] border border-[var(--color-primary-700)] ${className}`}
    >
      {theme === "dark" ? (
        <Sun className="size-5 text-[var(--color-secondary-400)]" />
      ) : (
        <Moon className="size-5 text-[var(--color-secondary-400)]" />
      )}
    </IconButton>
  );
}

export default ThemeToggle;

