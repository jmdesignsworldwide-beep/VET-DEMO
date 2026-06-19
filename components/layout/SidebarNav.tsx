"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Lista de navegación con indicador activo deslizante (layoutId).
 *  Los ítems admin-only solo se muestran al rol admin. */
export function SidebarNav({ isAdmin, onNavigate }: { isAdmin: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const items = NAV.filter((i) => !i.adminOnly || isAdmin);

  return (
    <nav className="flex flex-col gap-1">
      {items.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className="group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-ink/[0.04]"
          >
            {active && (
              <motion.span
                layoutId="nav-active"
                className="absolute inset-0 rounded-xl bg-brand/10 ring-1 ring-brand/30"
                transition={{ type: "spring", stiffness: 380, damping: 32 }}
              />
            )}
            <Icon
              className={cn(
                "relative z-10 h-[18px] w-[18px] transition-colors",
                active ? "text-brand dark:text-brand-glow" : "text-muted group-hover:text-ink",
              )}
            />
            <span
              className={cn(
                "relative z-10 text-sm font-medium transition-colors",
                active ? "text-ink" : "text-muted group-hover:text-ink",
              )}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
