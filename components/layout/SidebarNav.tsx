"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { NAV } from "@/lib/nav";
import { cn } from "@/lib/utils";

/** Lista de navegación con indicador activo deslizante (layoutId). */
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        const content = (
          <>
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
                active
                  ? "text-brand-glow"
                  : "text-muted group-hover:text-ink",
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
            {item.soon && (
              <span className="relative z-10 ml-auto rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                Pronto
              </span>
            )}
          </>
        );

        const className = cn(
          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5",
          "transition-colors hover:bg-ink/[0.04]",
          item.soon && "cursor-default opacity-80 hover:bg-transparent",
        );

        return item.soon ? (
          <div key={item.href} className={className} aria-disabled>
            {content}
          </div>
        ) : (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={className}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
