"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "framer-motion";
import {
  HeartPulse, BedDouble, CalendarClock, Wallet, TrendingUp, ArrowUpRight,
} from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { PulseDot } from "@/components/motion/PulseDot";
import { LiveStat } from "./LiveStat";
import { AreaCard } from "./AreaCard";
import { AvatarStack, PetAvatar } from "./PetAvatar";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { LiveClock } from "./LiveClock";
import { rd, fmtTime, timeAgo, minutesUntil } from "@/lib/format";
import type { AreaSummary } from "@/lib/data/dashboard";
import type { AppointmentWithPet, RecentEvent } from "@/lib/supabase/queries";

export interface DashboardData {
  hospitalizedCount: number;
  hospitalizedNames: string[];
  hotelGuestCount: number;
  hotelGuestNames: string[];
  groomingTodayCount: number;
  groomingInProgress: number;
  todayCount: number;
  nextAppointment?: { scheduled_at: string; reason: string; pet: { name: string } | null };
  revenueToday: number;
  todayAppointments: AppointmentWithPet[];
  recentActivity: RecentEvent[];
}

export function SalaDeMando({ data }: { data: DashboardData }) {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reduce) return setLoading(false);
    const id = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(id);
  }, [reduce]);

  if (loading) return <DashboardSkeleton />;

  const nextMin = data.nextAppointment ? minutesUntil(data.nextAppointment.scheduled_at) : null;

  // Hotel y peluquería: datos de ejemplo hasta sus tandas. Clínica: en vivo.
  const areas: AreaSummary[] = [
    {
      key: "clinica", title: "Clínica", href: "/citas", tone: "brand",
      metrics: [
        { label: "Citas hoy", value: String(data.todayCount) },
        { label: "Internadas", value: String(data.hospitalizedCount) },
      ],
      highlight: "Datos en vivo desde la base de datos", fill: 72,
    },
    {
      key: "hotel", title: "Hotel canino", href: "/hotel", tone: "accent",
      metrics: [
        { label: "Huéspedes hoy", value: String(data.hotelGuestCount) },
        { label: "Estado", value: "En vivo" },
      ],
      highlight: "Reservas y reportes diarios activos", fill: 86,
    },
    {
      key: "peluqueria", title: "Peluquería", href: "/peluqueria", tone: "brand",
      metrics: [
        { label: "Citas hoy", value: String(data.groomingTodayCount) },
        { label: "En proceso", value: String(data.groomingInProgress) },
      ],
      highlight: "Transformaciones antes/después en vivo", fill: 58,
    },
  ];

  return (
    <div className="mx-auto max-w-7xl">
      <Stagger className="mb-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-medium text-muted">
              Sala de Mando · <LiveClock />
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Buenos días, <span className="text-gradient">Nido</span>
            </h1>
          </div>
          <PulseDot tone="brand" label="Datos en vivo" />
        </Reveal>
      </Stagger>

      {/* Indicadores vivos */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4" gap={0.08}>
        <Reveal className="h-full">
          <LiveStat icon={HeartPulse} label="Mascotas internadas ahora" value={data.hospitalizedCount} tone="accent" breathing href="/hospitalizacion">
            {data.hospitalizedNames.length > 0
              ? <AvatarStack names={data.hospitalizedNames} size={34} />
              : <span className="text-xs text-muted">Ninguna internada</span>}
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat icon={BedDouble} label="Huéspedes en el hotel hoy" value={data.hotelGuestCount} tone="brand" href="/hotel">
            {data.hotelGuestNames.length > 0
              ? <AvatarStack names={data.hotelGuestNames} max={5} size={34} />
              : <span className="text-xs text-muted">Sin huéspedes hoy</span>}
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat icon={CalendarClock} label="Citas de hoy" value={data.todayCount} tone="brand" href="/citas">
            {data.nextAppointment && nextMin != null ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
                <PulseDot tone="accent" />
                Próxima en {nextMin} min · {data.nextAppointment.pet?.name}
              </span>
            ) : (
              <span className="text-xs text-muted">Sin próximas citas hoy</span>
            )}
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat icon={Wallet} label="Ingresos del día" value={data.revenueToday} prefix="RD$ " tone="brand" href="/ventas">
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand dark:text-brand-glow">
              <TrendingUp className="h-3.5 w-3.5" /> consultas de hoy
            </span>
          </LiveStat>
        </Reveal>
      </Stagger>

      {/* Áreas */}
      <Stagger className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {areas.map((area) => (
          <Reveal key={area.key} className="h-full"><AreaCard area={area} /></Reveal>
        ))}
      </Stagger>

      {/* Próximas citas + Actividad en vivo */}
      <Stagger className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <GlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">Citas de hoy</h2>
                <p className="text-sm text-muted">{data.todayAppointments.length} programadas</p>
              </div>
              <PulseDot tone="brand" />
            </div>
            {data.todayAppointments.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">No hay citas para hoy.</p>
            ) : (
              <ul className="divide-y divide-hairline/10">
                {data.todayAppointments.map((c) => (
                  <Link key={c.id} href={`/mascotas/${c.pet_id}`} className="group -mx-2 flex items-center gap-4 rounded-xl px-2 py-3 transition-colors hover:bg-ink/[0.03]">
                    <span className="w-14 shrink-0 font-display text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{fmtTime(c.scheduled_at)}</span>
                    <PetAvatar name={c.pet?.name ?? "?"} size={36} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{c.pet?.name} · {c.reason}</p>
                      <p className="truncate text-xs text-muted">{c.pet?.owner?.full_name}</p>
                    </div>
                    {c.price != null && <span className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(c.price)}</span>}
                    <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </ul>
            )}
          </GlassCard>
        </Reveal>

        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">Actividad reciente</h2>
              <PulseDot tone="accent" label="Live" />
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted">Sin actividad reciente.</p>
            ) : (
              <ul className="space-y-1">
                {data.recentActivity.map((e) => (
                  <Link key={e.id} href={`/mascotas/${e.pet_id}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-ink/[0.04]">
                    <PetAvatar name={e.petName} size={30} ring={false} />
                    <p className="min-w-0 flex-1 truncate text-sm">
                      <span className="font-semibold">{e.petName}</span>{" "}
                      <span className="text-muted">{e.title}</span>
                    </p>
                    <span className="shrink-0 text-xs tabular-nums text-muted">{timeAgo(e.occurred_at)}</span>
                  </Link>
                ))}
              </ul>
            )}
          </GlassCard>
        </Reveal>
      </Stagger>
    </div>
  );
}
