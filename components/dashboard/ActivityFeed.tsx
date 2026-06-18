"use client";

import { motion, useReducedMotion } from "framer-motion";
import { activity } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

/** Feed de actividad reciente. El evento más nuevo "late" suave. */
export function ActivityFeed() {
  const reduce = useReducedMotion();

  return (
    <ul className="space-y-1">
      {activity.map((a, i) => {
        const dot =
          a.tone === "brand"
            ? "bg-brand dark:bg-brand-glow"
            : a.tone === "accent"
              ? "bg-accent"
              : "bg-muted";
        return (
          <li
            key={i}
            className="group flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ink/[0.04]"
          >
            <span className="relative grid h-2.5 w-2.5 shrink-0 place-items-center">
              {a.live && !reduce && (
                <motion.span
                  className={cn("absolute h-2.5 w-2.5 rounded-full", dot)}
                  animate={{ scale: [1, 2.2], opacity: [0.6, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              <span className={cn("h-2 w-2 rounded-full", dot)} />
            </span>

            <p className="min-w-0 flex-1 truncate text-sm">
              <span className="font-semibold">{a.pet}</span>{" "}
              <span className="text-muted">{a.text}</span>
            </p>

            <span className="shrink-0 text-xs tabular-nums text-muted">
              {a.ago}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
