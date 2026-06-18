"use client";

import Link from "next/link";
import { ArrowUpRight, Stethoscope, BedDouble, Scissors } from "lucide-react";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { Magnetic } from "@/components/motion/Magnetic";
import type { AreaSummary } from "@/lib/data/dashboard";
import { cn } from "@/lib/utils";

const ICONS = {
  clinica: Stethoscope,
  hotel: BedDouble,
  peluqueria: Scissors,
} as const;

/** Tarjeta resumen por área de negocio (Clínica / Hotel / Peluquería). */
export function AreaCard({ area }: { area: AreaSummary }) {
  const Icon = ICONS[area.key as keyof typeof ICONS] ?? Stethoscope;
  const toneText = area.tone === "brand" ? "text-brand dark:text-brand-glow" : "text-accent";
  const toneBg = area.tone === "brand" ? "bg-brand/15" : "bg-accent/15";

  return (
    <Magnetic strength={0.12}>
      <Link
        href={area.href}
        className="group block h-full rounded-3xl focus-visible:outline-none focus-visible:ring-focus"
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl glass p-6 shadow-glass transition-shadow duration-300 group-hover:shadow-glow before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent">
          <div className="flex items-center gap-3">
            <span className={cn("grid h-10 w-10 place-items-center rounded-xl", toneBg, toneText)}>
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="font-display text-lg font-semibold">{area.title}</h3>
            <ArrowUpRight className="ml-auto h-4 w-4 text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4">
            {area.metrics.map((m) => (
              <div key={m.label}>
                <p className="font-display text-2xl font-bold tracking-tight tnum">
                  {m.value}
                </p>
                <p className="text-xs text-muted">{m.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <ProgressBar value={area.fill} tone={area.tone} />
          </div>

          <p className="mt-4 text-xs text-muted">{area.highlight}</p>
        </div>
      </Link>
    </Magnetic>
  );
}
