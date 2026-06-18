"use client";

import Link from "next/link";
import { CalendarHeart, Clock } from "lucide-react";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { NewAppointmentButton } from "./AppointmentForm";
import { fmtTime, rd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppointmentWithPet } from "@/lib/supabase/queries";
import type { PetWithOwner } from "@/lib/types";

function dayLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const t = new Date(today); t.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
}

export function AppointmentsView({
  appointments,
  pets,
}: {
  appointments: AppointmentWithPet[];
  pets: PetWithOwner[];
}) {
  const groups = appointments.reduce<Record<string, AppointmentWithPet[]>>((acc, a) => {
    const key = new Date(a.scheduled_at).toDateString();
    (acc[key] ??= []).push(a);
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Agenda de <span className="text-gradient">citas</span>
          </h1>
          <p className="mt-1 text-sm text-muted">{appointments.length} citas programadas</p>
        </div>
        <NewAppointmentButton pets={pets} />
      </div>

      {appointments.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">No hay citas. Agenda la primera.</p>
      ) : (
        <div className="space-y-8">
          {Object.entries(groups).map(([key, items]) => (
            <div key={key}>
              <div className="mb-3 flex items-center gap-2">
                <CalendarHeart className="h-4 w-4 text-brand dark:text-brand-glow" />
                <h2 className="font-display text-sm font-semibold capitalize">{dayLabel(items[0].scheduled_at)}</h2>
                <span className="text-xs text-muted">· {items.length}</span>
              </div>
              <Stagger className="space-y-3">
                {items.map((a) => (
                  <Reveal key={a.id}>
                    <Link href={`/mascotas/${a.pet_id}`}>
                      <GlassCard className="flex items-center gap-4 transition-shadow hover:shadow-glow">
                        <span className="flex w-16 shrink-0 flex-col items-center">
                          <Clock className="h-4 w-4 text-muted" />
                          <span className="mt-1 font-display text-sm font-semibold tabular-nums">{fmtTime(a.scheduled_at)}</span>
                        </span>
                        <PetAvatar name={a.pet?.name ?? "?"} size={40} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold">{a.pet?.name} · {a.reason}</p>
                          <p className="truncate text-xs text-muted">{a.pet?.owner?.full_name} · {a.vet_name ?? "—"}</p>
                        </div>
                        <div className="text-right">
                          {a.price != null && <p className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(a.price)}</p>}
                          <span className={cn("text-xs font-medium", a.status === "programada" ? "text-accent" : "text-muted")}>{a.status}</span>
                        </div>
                      </GlassCard>
                    </Link>
                  </Reveal>
                ))}
              </Stagger>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
