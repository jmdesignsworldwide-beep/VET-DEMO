"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Barra que se llena hasta `value` (0–100) al montarse, con glow de marca. */
export function ProgressBar({
  value,
  className,
  tone = "brand",
}: {
  value: number;
  className?: string;
  tone?: "brand" | "accent";
}) {
  const reduce = useReducedMotion();
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-ink/10",
        className,
      )}
    >
      <motion.div
        className={cn(
          "h-full rounded-full",
          tone === "brand"
            ? "bg-gradient-to-r from-brand to-brand-glow shadow-glow"
            : "bg-gradient-to-r from-accent to-accent-glow shadow-glow-accent",
        )}
        initial={reduce ? false : { width: 0 }}
        whileInView={reduce ? undefined : { width: `${pct}%` }}
        animate={reduce ? { width: `${pct}%` } : undefined}
        viewport={{ once: true }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}
