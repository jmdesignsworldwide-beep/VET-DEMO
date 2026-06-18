"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PetAvatar } from "./PetAvatar";
import { appointments } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

/** Lista de próximas citas, clickeable. */
export function UpcomingAppointments() {
  return (
    <ul className="divide-y divide-hairline/10">
      {appointments.map((c) => (
        <Link
          key={c.time + c.pet}
          href="/citas"
          className="group flex items-center gap-4 py-3 transition-colors hover:bg-ink/[0.03] -mx-2 rounded-xl px-2"
        >
          <span
            className={cn(
              "w-14 shrink-0 font-display text-sm font-semibold tabular-nums",
              c.tone === "brand" ? "text-brand dark:text-brand-glow" : "text-accent",
            )}
          >
            {c.time}
          </span>
          <PetAvatar name={c.pet} size={36} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {c.pet} · {c.service}
            </p>
            <p className="truncate text-xs text-muted">{c.owner}</p>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
        </Link>
      ))}
    </ul>
  );
}
