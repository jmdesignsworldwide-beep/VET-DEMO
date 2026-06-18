"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Scissors, Search, Clock, Sparkles, Bell, MessageCircle, AlertTriangle } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Form";
import { PulseDot } from "@/components/motion/PulseDot";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { BeforeAfterSlider } from "./BeforeAfterSlider";
import { NewGroomingAppointmentButton } from "./GroomingAppointmentForm";
import { GroomingPhotoUpload } from "./GroomingPhotoUpload";
import { rd, fmtTime, fmtDate, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { GroomingAppointmentFull, GroomingPhotoFull, PetWithOwner } from "@/lib/types";

const TABS = [
  { key: "agenda", label: "Agenda", icon: Clock },
  { key: "transformaciones", label: "Transformaciones", icon: Sparkles },
  { key: "recordatorios", label: "Recordatorios", icon: Bell },
] as const;

const STATUS = ["todas", "programada", "en_proceso", "completada"] as const;

export function GroomingView({
  appointments,
  photos,
  pets,
}: {
  appointments: GroomingAppointmentFull[];
  photos: GroomingPhotoFull[];
  pets: PetWithOwner[];
}) {
  const reduce = useReducedMotion();
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("agenda");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<(typeof STATUS)[number]>("todas");

  const todayKey = new Date().toDateString();
  const todayCount = appointments.filter((a) => new Date(a.scheduled_at).toDateString() === todayKey).length;
  const inProcess = appointments.filter((a) => a.status === "en_proceso").length;
  const reminders = appointments.filter((a) => a.status === "programada" && new Date(a.scheduled_at).getTime() > Date.now());

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => appointments.filter((a) => {
    if (status !== "todas" && a.status !== status) return false;
    if (term) {
      const hay = `${a.pet?.name ?? ""} ${a.pet?.owner?.full_name ?? ""} ${a.service}`.toLowerCase();
      if (!hay.includes(term)) return false;
    }
    return true;
  }), [appointments, status, term]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Peluquería <span className="text-gradient">&amp; estética</span>
          </h1>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <PulseDot tone="brand" /> {inProcess} en proceso · {todayCount} citas hoy
          </p>
        </div>
        <NewGroomingAppointmentButton pets={pets} />
      </div>

      <Stagger className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Reveal><Stat icon={Clock} label="Citas hoy" value={todayCount} tone="brand" /></Reveal>
        <Reveal><Stat icon={Scissors} label="En proceso" value={inProcess} tone="accent" /></Reveal>
        <Reveal><Stat icon={Sparkles} label="Transformaciones" value={photos.length} tone="brand" /></Reveal>
      </Stagger>

      {/* Tabs */}
      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("relative flex shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors", active ? "text-ink" : "text-muted hover:text-ink")}>
              {active && <motion.span layoutId="groom-tab" className="absolute inset-0 rounded-xl glass shadow-glow" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <Icon className="relative z-10 h-4 w-4" /><span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "agenda" && (
            <>
              <div className="mb-5 space-y-3 rounded-2xl glass p-3 shadow-glass">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por mascota, dueño o servicio…" className="h-12 pl-11" />
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS.map((s) => (
                    <button key={s} onClick={() => setStatus(s)}
                      className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium capitalize transition-colors",
                        status === s ? "bg-brand/15 text-brand ring-1 ring-brand/30 dark:text-brand-glow" : "bg-ink/[0.05] text-muted hover:text-ink")}>
                      {s.replace("_", " ")}
                    </button>
                  ))}
                </div>
              </div>
              {filtered.length === 0 ? <Empty text="Sin citas que coincidan." /> : (
                <motion.div layout={!reduce} className="space-y-3">
                  <AnimatePresence initial={false} mode="popLayout">
                    {filtered.map((a) => (
                      <motion.div key={a.id} layout={!reduce}
                        initial={reduce ? false : { opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                        transition={{ type: "spring", stiffness: 320, damping: 30 }}>
                        <Link href={`/mascotas/${a.pet_id}`}>
                          <GlassCard className="flex items-center gap-4 transition-shadow hover:shadow-glow">
                            <span className="flex w-16 shrink-0 flex-col items-center">
                              <Clock className="h-4 w-4 text-muted" />
                              <span className="mt-1 font-display text-sm font-semibold tabular-nums">{fmtTime(a.scheduled_at)}</span>
                              <span className="text-[10px] text-muted">{fmtDate(a.scheduled_at)}</span>
                            </span>
                            <PetAvatar name={a.pet?.name ?? "?"} size={40} />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-semibold">{a.pet?.name} · {a.service}</p>
                              <p className="truncate text-xs text-muted">{a.pet?.owner?.full_name} · {a.groomer ?? "—"}</p>
                            </div>
                            <div className="text-right">
                              {a.price != null && <p className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(a.price)}</p>}
                              <span className={cn("text-xs font-medium capitalize", a.status === "en_proceso" ? "text-accent" : a.status === "completada" ? "text-muted" : "text-brand dark:text-brand-glow")}>{a.status.replace("_", " ")}</span>
                            </div>
                          </GlassCard>
                        </Link>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}
            </>
          )}

          {tab === "transformaciones" && (
            photos.length === 0 ? <Empty text="Aún no hay transformaciones." /> :
            <Stagger className="grid grid-cols-1 gap-5 lg:grid-cols-2">
              {photos.map((p) => (
                <Reveal key={p.id}>
                  <GlassCard>
                    <div className="mb-3 flex items-center gap-3">
                      <PetAvatar name={p.pet?.name ?? "?"} size={36} />
                      <div className="min-w-0 flex-1">
                        <Link href={`/mascotas/${p.pet_id}`} className="font-semibold hover:text-brand dark:hover:text-brand-glow">{p.pet?.name}</Link>
                        <p className="text-xs text-muted">{p.service_label ?? "Grooming"}</p>
                      </div>
                      <Sparkles className="h-4 w-4 text-accent" />
                    </div>
                    <BeforeAfterSlider before={p.before_path} after={p.after_path} alt={p.pet?.name} />
                    {p.caption && <p className="mt-3 text-center text-sm italic text-muted">“{p.caption}”</p>}
                  </GlassCard>
                </Reveal>
              ))}
            </Stagger>
          )}

          {tab === "recordatorios" && (
            <>
              <div className="mb-4 flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-sm text-accent">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                Mensaje simulado para demostración. Sin integración real de WhatsApp.
              </div>
              {reminders.length === 0 ? <Empty text="Sin recordatorios pendientes." /> :
                <Stagger className="space-y-3">
                  {reminders.map((a) => (
                    <Reveal key={a.id}>
                      <div className="flex gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-lg">
                          <MessageCircle className="h-5 w-5" />
                        </span>
                        <div className="flex-1 rounded-2xl rounded-tl-sm glass p-4 shadow-glass">
                          <p className="text-sm">
                            ¡Hola <span className="font-semibold">{a.pet?.owner?.full_name?.split(" ")[0]}</span>! 🐾 Te recordamos la cita de{" "}
                            <span className="font-semibold">{a.pet?.name}</span> para <span className="font-semibold">{a.service}</span> el{" "}
                            <span className="font-semibold">{fmtDateTime(a.scheduled_at)}</span> con {a.groomer ?? "nuestro equipo"}. — Clínica Nido
                          </p>
                          <p className="mt-2 text-[11px] text-muted">vía WhatsApp · simulado</p>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                </Stagger>}
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Clock; label: string; value: number; tone: "brand" | "accent" }) {
  return (
    <GlassCard>
      <div className="flex items-center gap-3">
        <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", tone === "accent" ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}>
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="font-display text-2xl font-bold tracking-tight"><CountUp to={value} /></p>
          <p className="text-xs text-muted">{label}</p>
        </div>
      </div>
    </GlassCard>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-12 text-center text-sm text-muted">{text}</p>;
}
