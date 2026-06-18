"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean;
}

/** Tarjeta de cristal con sombras en capas. `glow` resalta el borde activo. */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, glow, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative rounded-3xl glass p-6 shadow-glass dark:shadow-glass",
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent",
        glow && "shadow-glow",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  ),
);
GlassCard.displayName = "GlassCard";
