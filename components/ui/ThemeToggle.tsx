"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { Moon, Sun } from "lucide-react";

/** Toggle sol/luna con transición suave. Preferencia recordada por next-themes. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={isDark ? "Activar tema claro" : "Activar tema oscuro"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="group relative grid h-10 w-10 place-items-center rounded-xl glass transition-shadow hover:shadow-glow focus-visible:ring-focus"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={mounted ? (isDark ? "moon" : "sun") : "placeholder"}
          initial={{ y: -8, opacity: 0, rotate: -30 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: 8, opacity: 0, rotate: 30 }}
          transition={{ type: "spring", stiffness: 380, damping: 24 }}
          className="absolute"
        >
          {mounted && isDark ? (
            <Moon className="h-[18px] w-[18px] text-brand-glow" />
          ) : (
            <Sun className="h-[18px] w-[18px] text-accent" />
          )}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
