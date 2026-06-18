"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  BedDouble,
  Scissors,
  Syringe,
  Stethoscope,
  HeartPulse,
  CircleCheck,
  Image as ImageIcon,
  CalendarHeart,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { rd, fmtDate } from "@/lib/format";
import type { EventKind, PetEvent } from "@/lib/types";

const META: Record<EventKind, { icon: LucideIcon; tone: "brand" | "accent"; label: string }> = {
  hotel_checkin: { icon: BedDouble, tone: "accent", label: "Hotel" },
  hotel_checkout: { icon: LogOut, tone: "accent", label: "Hotel" },
  grooming: { icon: Scissors, tone: "brand", label: "Peluquería" },
  vaccine: { icon: Syringe, tone: "brand", label: "Vacuna" },
  consultation: { icon: Stethoscope, tone: "brand", label: "Clínica" },
  hospitalization: { icon: HeartPulse, tone: "accent", label: "Hospital" },
  discharge: { icon: CircleCheck, tone: "brand", label: "Alta" },
  photo: { icon: ImageIcon, tone: "accent", label: "Foto" },
  appointment: { icon: CalendarHeart, tone: "brand", label: "Cita" },
};

export function Timeline({ events }: { events: PetEvent[] }) {
  const reduce = useReducedMotion();

  if (events.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-muted">
        Aún no hay eventos en la vida de esta mascota en Clínica Nido.
      </p>
    );
  }

  return (
    <div className="relative pl-2">
      {/* Línea vertical con glow */}
      <span className="absolute left-[22px] top-2 bottom-2 w-px bg-gradient-to-b from-brand/60 via-hairline/20 to-accent/60" />

      <ol className="space-y-5">
        {events.map((ev, i) => {
          const meta = META[ev.kind] ?? META.consultation;
          const Icon = meta.icon;
          const tone = meta.tone === "brand"
            ? "text-brand dark:text-brand-glow bg-brand/15"
            : "text-accent bg-accent/15";

          return (
            <motion.li
              key={ev.id}
              initial={reduce ? false : { opacity: 0, x: -16, filter: "blur(6px)" }}
              whileInView={reduce ? undefined : { opacity: 1, x: 0, filter: "blur(0px)" }}
              animate={reduce ? { opacity: 1, x: 0 } : undefined}
              viewport={{ once: true }}
              transition={{ delay: reduce ? 0 : i * 0.07, type: "spring", stiffness: 240, damping: 24 }}
              className="relative flex gap-4"
            >
              <span className={`relative z-10 grid h-11 w-11 shrink-0 place-items-center rounded-full ring-4 ring-canvas ${tone}`}>
                <Icon className="h-5 w-5" />
              </span>

              <div className="flex-1 rounded-2xl glass p-4 shadow-glass">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{ev.title}</p>
                  <span className="rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">
                    {meta.label}
                  </span>
                </div>
                {ev.description && (
                  <p className="mt-1 text-sm text-muted">{ev.description}</p>
                )}
                <div className="mt-2 flex items-center gap-3 text-xs text-muted">
                  <span className="tabular-nums">{fmtDate(ev.occurred_at)}</span>
                  {ev.amount != null && (
                    <span className="font-semibold text-brand dark:text-brand-glow tabular-nums">
                      {rd(ev.amount)}
                    </span>
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
