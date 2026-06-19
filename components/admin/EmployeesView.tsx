"use client";

import Link from "next/link";
import { Users, ChevronRight } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { rd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Employee } from "@/lib/types";

const AREA_TONE: Record<string, string> = {
  "Clínica": "bg-brand/15 text-brand dark:text-brand-glow",
  "Hotel": "bg-accent/15 text-accent",
  "Peluquería": "bg-brand-glow/15 text-brand dark:text-brand-glow",
  "General": "bg-ink/[0.06] text-muted",
};

export function EmployeesView({ employees }: { employees: Employee[] }) {
  const payroll = employees.reduce((s, e) => s + (e.salary ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><Users className="h-5 w-5" /></span>
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">Empleados</h1>
            <p className="text-sm text-muted">{employees.length} en el equipo</p>
          </div>
        </div>
        <GlassCard className="px-4 py-2.5">
          <p className="text-[11px] uppercase tracking-wider text-muted">Nómina mensual</p>
          <p className="font-display text-xl font-bold tabular-nums text-brand dark:text-brand-glow">{rd(payroll)}</p>
        </GlassCard>
      </div>

      <Stagger className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {employees.map((e) => {
          const initials = e.full_name.replace("Dra. ", "").replace("Dr. ", "").split(" ").map((p) => p[0]).slice(0, 2).join("");
          const vacLeft = e.vacation_total - e.vacation_taken;
          return (
            <Reveal key={e.id}>
              <Magnetic strength={0.1}>
                <Link href={`/admin/empleados/${e.id}`}>
                  <GlassCard className="group flex items-center gap-3 transition-shadow hover:shadow-glow">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow text-sm font-bold text-[#04201d]">{initials}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{e.full_name}</p>
                      <p className="truncate text-xs text-muted">{e.role}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2">
                        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", AREA_TONE[e.area] ?? AREA_TONE.General)}>{e.area}</span>
                        <span className="text-[10px] text-muted">{vacLeft} días vac.</span>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5" />
                  </GlassCard>
                </Link>
              </Magnetic>
            </Reveal>
          );
        })}
      </Stagger>
    </div>
  );
}
