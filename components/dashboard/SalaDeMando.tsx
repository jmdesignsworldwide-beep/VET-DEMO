"use client";

import { useEffect, useState } from "react";
import { useReducedMotion } from "framer-motion";
import {
  HeartPulse,
  BedDouble,
  CalendarClock,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { PulseDot } from "@/components/motion/PulseDot";
import { LiveStat } from "./LiveStat";
import { AreaCard } from "./AreaCard";
import { ActivityFeed } from "./ActivityFeed";
import { UpcomingAppointments } from "./UpcomingAppointments";
import { AvatarStack } from "./PetAvatar";
import { DashboardSkeleton } from "./DashboardSkeleton";
import { LiveClock } from "./LiveClock";
import {
  hospitalized,
  hotelGuests,
  todayStats,
  areas,
} from "@/lib/data/dashboard";

export function SalaDeMando() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (reduce) {
      setLoading(false);
      return;
    }
    const id = setTimeout(() => setLoading(false), 750);
    return () => clearTimeout(id);
  }, [reduce]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="mx-auto max-w-7xl">
      {/* Encabezado */}
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
      <Stagger
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
        gap={0.08}
      >
        <Reveal className="h-full">
          <LiveStat
            icon={HeartPulse}
            label="Mascotas internadas ahora"
            value={hospitalized.length}
            tone="accent"
            breathing
            href="/citas"
          >
            <AvatarStack names={hospitalized.map((p) => p.name)} size={34} />
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat
            icon={BedDouble}
            label="Huéspedes en el hotel hoy"
            value={hotelGuests.length}
            tone="brand"
            href="/hotel"
          >
            <AvatarStack names={hotelGuests.map((p) => p.name)} max={5} size={34} />
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat
            icon={CalendarClock}
            label="Citas de hoy"
            value={todayStats.appointments}
            tone="brand"
            href="/citas"
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent">
              <PulseDot tone="accent" />
              Próxima en {todayStats.nextInMin} min · {todayStats.nextPet}
            </span>
          </LiveStat>
        </Reveal>

        <Reveal className="h-full">
          <LiveStat
            icon={Wallet}
            label="Ingresos del día"
            value={todayStats.revenue}
            prefix="RD$ "
            tone="brand"
            href="/ventas"
          >
            <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand dark:text-brand-glow">
              <TrendingUp className="h-3.5 w-3.5" />
              +18% vs. ayer
            </span>
          </LiveStat>
        </Reveal>
      </Stagger>

      {/* Resumen por área */}
      <Stagger className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {areas.map((area) => (
          <Reveal key={area.key} className="h-full">
            <AreaCard area={area} />
          </Reveal>
        ))}
      </Stagger>

      {/* Próximas citas + Actividad */}
      <Stagger className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <GlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Próximas citas
                </h2>
                <p className="text-sm text-muted">Hoy · 5 programadas</p>
              </div>
              <PulseDot tone="brand" />
            </div>
            <UpcomingAppointments />
          </GlassCard>
        </Reveal>

        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold">
                Actividad reciente
              </h2>
              <PulseDot tone="accent" label="Live" />
            </div>
            <ActivityFeed />
          </GlassCard>
        </Reveal>
      </Stagger>
    </div>
  );
}
