import { Moon, Sun } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      onClick={toggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-fluent
        border border-ms-border dark:border-navy-600
        text-ms-neutral dark:text-navy-300
        bg-ms-surface dark:bg-navy-800
        hover:bg-ms-gray dark:hover:bg-navy-700
        transition-all duration-150 text-xs font-semibold"
      title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}
    >
      {theme === "light"
        ? <><Moon size={13} /> Dark mode</>
        : <><Sun size={13} /> Light mode</>
      }
    </button>
  );
}