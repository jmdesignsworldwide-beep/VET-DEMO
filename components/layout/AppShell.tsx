"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";
import { UserChip } from "./UserChip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PulseDot } from "@/components/motion/PulseDot";

/**
 * Estructura base de la app: sidebar fijo en escritorio, drawer con
 * hamburguesa (☰) en móvil, header con toggle de tema. Lista para colgar
 * los módulos en {children}.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh">
      {/* ── Sidebar escritorio ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col gap-6 border-r border-hairline/10 px-4 py-6 lg:flex">
        <Brand className="px-2" />
        <div className="mt-2 flex-1">
          <SidebarNav />
        </div>
        <UserChip />
      </aside>

      {/* ── Drawer móvil ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col gap-6 glass-strong px-4 py-6 lg:hidden"
            >
              <div className="flex items-center justify-between px-2">
                <Brand />
                <button
                  type="button"
                  aria-label="Cerrar menú"
                  onClick={() => setOpen(false)}
                  className="grid h-9 w-9 place-items-center rounded-xl glass"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <SidebarNav onNavigate={() => setOpen(false)} />
              </div>
              <UserChip />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Contenido ── */}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline/10 px-4 backdrop-blur-xl sm:px-6">
          <button
            type="button"
            aria-label="Abrir menú"
            onClick={() => setOpen(true)}
            className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <PulseDot tone="brand" label="En vivo" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
