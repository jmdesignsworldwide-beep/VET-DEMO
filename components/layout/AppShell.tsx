"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Clock } from "lucide-react";
import { Brand } from "./Brand";
import { SidebarNav } from "./SidebarNav";
import { UserChip } from "./UserChip";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { PulseDot } from "@/components/motion/PulseDot";

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  return Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 86400000);
}

/**
 * Estructura base de la app: sidebar fijo en escritorio, drawer con
 * hamburguesa (☰) en móvil, header con toggle de tema. La navegación de
 * administración solo aparece para el rol admin.
 */
export function AppShell({
  children,
  isAdmin,
  username,
  role,
  expiresAt,
}: {
  children: React.ReactNode;
  isAdmin: boolean;
  username: string;
  role: string;
  expiresAt: string | null;
}) {
  const [open, setOpen] = useState(false);
  const left = !isAdmin ? daysLeft(expiresAt) : null;
  const expiringSoon = left != null && left >= 0 && left <= 3;

  return (
    <div className="min-h-dvh">
      {/* ── Sidebar escritorio ── */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[264px] flex-col gap-6 border-r border-hairline/10 px-4 py-6 lg:flex">
        <Brand className="px-2" />
        <div className="mt-2 flex-1">
          <SidebarNav isAdmin={isAdmin} />
        </div>
        <UserChip username={username} role={role} />
      </aside>

      {/* ── Drawer móvil ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col gap-6 glass-strong px-4 py-6 lg:hidden"
            >
              <div className="flex items-center justify-between px-2">
                <Brand />
                <button type="button" aria-label="Cerrar menú" onClick={() => setOpen(false)} className="grid h-9 w-9 place-items-center rounded-xl glass">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex-1">
                <SidebarNav isAdmin={isAdmin} onNavigate={() => setOpen(false)} />
              </div>
              <UserChip username={username} role={role} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Contenido ── */}
      <div className="lg:pl-[264px]">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-hairline/10 px-4 backdrop-blur-xl sm:px-6">
          <button type="button" aria-label="Abrir menú" onClick={() => setOpen(true)} className="grid h-10 w-10 place-items-center rounded-xl glass lg:hidden">
            <Menu className="h-5 w-5" />
          </button>

          <div className="hidden items-center gap-2 lg:flex">
            <PulseDot tone="brand" label="En vivo" />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
          </div>
        </header>

        {expiringSoon && (
          <div className="flex items-center justify-center gap-2 border-b border-accent/20 bg-accent/10 px-4 py-2 text-center text-xs font-medium text-accent">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            Tu acceso vence {left === 0 ? "hoy" : `en ${left} día${left === 1 ? "" : "s"}`}. Contacta a JM Designs para renovarlo.
          </div>
        )}

        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
