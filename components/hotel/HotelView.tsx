"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { BedDouble, DoorOpen, CalendarClock, History, PawPrint, ArrowUpRight } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { PulseDot } from "@/components/motion/PulseDot";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { NewStayButton } from "./NewStayButton";
import { StayActions } from "./StayActions";
import { PostcardButton } from "./Postcard";
import { hotelToday, nights, stayActiveToday } from "@/lib/hotel";
import { rd, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PetWithOwner, Room, StayFull, DailyReport } from "@/lib/types";

const TABS = [
  { key: "huespedes", label: "Huéspedes", icon: PawPrint },
  { key: "habitaciones", label: "Habitaciones", icon: BedDouble },
  { key: "reservas", label: "Reservas", icon: CalendarClock },
  { key: "historial", label: "Historial", icon: History },
] as const;

export function HotelView({
  rooms,
  stays,
  reports,
  pets,
}: {
  rooms: Room[];
  stays: StayFull[];
  reports: DailyReport[];
  pets: PetWithOwner[];
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("huespedes");
  const today = hotelToday();

  const active = useMemo(() => stays.filter(stayActiveToday), [stays]);
  const upcoming = useMemo(() => stays.filter((s) => s.status === "reservada" && s.check_in > today), [stays, today]);
  const history = useMemo(() => stays.filter((s) => s.status === "finalizada"), [stays]);

  const occupiedRoomIds = new Set(active.map((s) => s.room_id));
  const reportByStay = useMemo(() => {
    const m: Record<string, DailyReport> = {};
    for (const r of reports) if (!m[r.stay_id]) m[r.stay_id] = r;
    return m;
  }, [reports]);

  return (
    <div className="mx-auto max-w-6xl">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Hotel <span className="text-gradient">canino</span>
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <PulseDot tone="accent" /> {active.length} huéspedes ahora mismo
          </p>
        </div>
        <NewStayButton pets={pets} rooms={rooms} stays={stays} />
      </div>

      {/* Stats */}
      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Reveal><StatCard icon={PawPrint} label="Huéspedes hoy" value={active.length} tone="accent" /></Reveal>
        <Reveal><StatCard icon={DoorOpen} label="Ocupación" value={occupiedRoomIds.size} suffix={` / ${rooms.length}`} tone="brand" /></Reveal>
        <Reveal><StatCard icon={CalendarClock} label="Reservas próximas" value={upcoming.length} tone="brand" /></Reveal>
      </Stagger>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active2 = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors", active2 ? "text-ink" : "text-muted hover:text-ink")}>
              {active2 && <motion.span layoutId="hotel-tab" className="absolute inset-0 rounded-xl glass shadow-glow" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "huespedes" && (
            active.length === 0 ? <Empty text="No hay huéspedes hospedados ahora." /> :
            <Stagger className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {active.map((s) => (
                <Reveal key={s.id}>
                  <GlassCard glow className="h-full">
                    <div className="flex items-start gap-3">
                      <PetAvatar name={s.pet?.name ?? "?"} size={52} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/mascotas/${s.pet_id}`} className="font-display text-lg font-semibold hover:text-brand dark:hover:text-brand-glow">{s.pet?.name}</Link>
                        <p className="text-xs text-muted">{s.pet?.owner?.full_name}</p>
                        <p className="mt-1 text-sm"><span className="font-medium">{s.room?.name}</span> · {s.room?.type}</p>
                        <p className="text-xs text-muted">{fmtDate(s.check_in)} → {fmtDate(s.check_out)} · {nights(s.check_in, s.check_out)} noche(s)</p>
                      </div>
                      <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">En curso</span>
                    </div>
                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {reportByStay[s.id] && (
                        <PostcardButton report={reportByStay[s.id]} petName={s.pet?.name ?? ""} ownerName={s.pet?.owner?.full_name ?? "su familia"} />
                      )}
                      <StayActions stayId={s.id} petId={s.pet_id} status={s.status} />
                      <span className="ml-auto font-semibold text-brand dark:text-brand-glow tabular-nums">{rd(nights(s.check_in, s.check_out) * s.price_per_night)}</span>
                    </div>
                  </GlassCard>
                </Reveal>
              ))}
            </Stagger>
          )}

          {tab === "habitaciones" && (
            <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((r) => {
                const occ = active.find((s) => s.room_id === r.id);
                return (
                  <Reveal key={r.id}>
                    <Magnetic strength={0.1}>
                      <GlassCard className="h-full" glow={!!occ}>
                        <div className="flex items-center justify-between">
                          <span className={cn("grid h-10 w-10 place-items-center rounded-xl", occ ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}>
                            <BedDouble className="h-5 w-5" />
                          </span>
                          <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", occ ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}>
                            {occ ? "Ocupada" : "Libre"}
                          </span>
                        </div>
                        <p className="mt-3 font-display text-lg font-semibold">{r.name}</p>
                        <p className="text-xs text-muted">{r.type} · cap. {r.capacity} · {rd(r.price_per_night)}/noche</p>
                        {occ ? (
                          <Link href={`/mascotas/${occ.pet_id}`} className="mt-3 flex items-center gap-2 rounded-xl bg-ink/[0.04] p-2 transition-colors hover:bg-ink/[0.08]">
                            <PetAvatar name={occ.pet?.name ?? "?"} size={30} ring={false} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">{occ.pet?.name}</p>
                              <p className="truncate text-[11px] text-muted">{fmtDate(occ.check_in)} → {fmtDate(occ.check_out)}</p>
                            </div>
                            <ArrowUpRight className="h-4 w-4 text-muted" />
                          </Link>
                        ) : (
                          <p className="mt-3 rounded-xl bg-ink/[0.03] p-2 text-center text-xs text-muted">Disponible para reservar</p>
                        )}
                      </GlassCard>
                    </Magnetic>
                  </Reveal>
                );
              })}
            </Stagger>
          )}

          {tab === "reservas" && (
            upcoming.length === 0 ? <Empty text="Sin reservas próximas." /> :
            <Stagger className="space-y-3">
              {upcoming.map((s) => (
                <Reveal key={s.id}>
                  <GlassCard className="flex items-center gap-4">
                    <PetAvatar name={s.pet?.name ?? "?"} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{s.pet?.name} · {s.room?.name}</p>
                      <p className="text-xs text-muted">{fmtDate(s.check_in)} → {fmtDate(s.check_out)} · {nights(s.check_in, s.check_out)} noche(s)</p>
                    </div>
                    <StayActions stayId={s.id} petId={s.pet_id} status={s.status} />
                  </GlassCard>
                </Reveal>
              ))}
            </Stagger>
          )}

          {tab === "historial" && (
            history.length === 0 ? <Empty text="Sin estadías pasadas." /> :
            <Stagger className="space-y-3">
              {history.map((s) => (
                <Reveal key={s.id}>
                  <Link href={`/mascotas/${s.pet_id}`}>
                    <GlassCard className="flex items-center gap-4 opacity-90 transition-opacity hover:opacity-100">
                      <PetAvatar name={s.pet?.name ?? "?"} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{s.pet?.name} · {s.room?.name}</p>
                        <p className="text-xs text-muted">{fmtDate(s.check_in)} → {fmtDate(s.check_out)}</p>
                      </div>
                      <span className="text-sm font-semibold text-muted tabular-nums">{rd(nights(s.check_in, s.check_out) * s.price_per_night)}</span>
                    </GlassCard>
                  </Link>
                </Reveal>
              ))}
            </Stagger>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, tone }: { icon: typeof BedDouble; label: string; value: number; suffix?: string; tone: "brand" | "accent" }) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tone === "accent" ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-2xl font-bold tracking-tight"><CountUp to={value} suffix={suffix} /></p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-12 text-center text-sm text-muted">{text}</p>;
}
