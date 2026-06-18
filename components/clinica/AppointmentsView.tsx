"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { CalendarHeart, Clock, Search, X } from "lucide-react";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { GlassCard } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/Form";
import { NewAppointmentButton } from "./AppointmentForm";
import { fmtTime, rd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AppointmentWithPet } from "@/lib/supabase/queries";
import type { PetWithOwner } from "@/lib/types";

/** Fecha local YYYY-MM-DD (para comparar con los <input type=date>). */
function localDate(iso: string): string {
  const d = new Date(iso);
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

function todayStr(): string {
  return localDate(new Date().toISOString());
}

function dayLabel(iso: string) {
  const d = new Date(iso);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const dd = new Date(d); dd.setHours(0, 0, 0, 0);
  const diff = Math.round((dd.getTime() - t.getTime()) / 86400000);
  if (diff === 0) return "Hoy";
  if (diff === 1) return "Mañana";
  if (diff === -1) return "Ayer";
  return d.toLocaleDateString("es-DO", { weekday: "long", day: "2-digit", month: "long" });
}

type Row =
  | { type: "header"; key: string; label: string; count: number }
  | { type: "appt"; key: string; a: AppointmentWithPet };

export function AppointmentsView({
  appointments,
  pets,
}: {
  appointments: AppointmentWithPet[];
  pets: PetWithOwner[];
}) {
  const reduce = useReducedMotion();
  const [q, setQ] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const term = q.trim().toLowerCase();
  const isToday = from === todayStr() && to === todayStr();
  const anyFilter = !!term || !!from || !!to;

  const filtered = useMemo(() => {
    return appointments.filter((a) => {
      const d = localDate(a.scheduled_at);
      if (from && d < from) return false;
      if (to && d > to) return false;
      if (term) {
        const hay = `${a.pet?.name ?? ""} ${a.pet?.owner?.full_name ?? ""} ${a.reason}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  }, [appointments, term, from, to]);

  // Filas planas (encabezado de día + citas) para animar el reflow suave.
  const rows = useMemo<Row[]>(() => {
    const groups: Record<string, AppointmentWithPet[]> = {};
    for (const a of filtered) {
      const key = new Date(a.scheduled_at).toDateString();
      (groups[key] ??= []).push(a);
    }
    const out: Row[] = [];
    for (const [key, items] of Object.entries(groups)) {
      out.push({ type: "header", key: `h-${key}`, label: dayLabel(items[0].scheduled_at), count: items.length });
      for (const a of items) out.push({ type: "appt", key: a.id, a });
    }
    return out;
  }, [filtered]);

  function setToday() {
    const t = todayStr();
    setFrom(t); setTo(t);
  }
  function clearDates() { setFrom(""); setTo(""); }
  function clearAll() { setQ(""); clearDates(); }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Agenda de <span className="text-gradient">citas</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {anyFilter ? `${filtered.length} de ${appointments.length}` : `${appointments.length}`} citas
          </p>
        </div>
        <NewAppointmentButton pets={pets} />
      </div>

      {/* ── Buscador + filtro por fecha ── */}
      <div className="mb-6 space-y-3 rounded-2xl glass p-3 shadow-glass">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por mascota, dueño o motivo…"
            className="h-12 pl-11"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Chip active={!from && !to} onClick={clearDates}>Todas</Chip>
          <Chip active={isToday} onClick={setToday}>Hoy</Chip>

          <div className="flex items-center gap-2 sm:ml-auto">
            <label className="flex items-center gap-1.5 text-xs text-muted">
              Desde
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-9 w-[9.5rem] px-2.5" />
            </label>
            <label className="flex items-center gap-1.5 text-xs text-muted">
              Hasta
              <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-9 w-[9.5rem] px-2.5" />
            </label>
          </div>

          {anyFilter && (
            <button onClick={clearAll} className="inline-flex items-center gap-1 rounded-full bg-ink/[0.06] px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-accent">
              <X className="h-3.5 w-3.5" /> Limpiar
            </button>
          )}
        </div>
      </div>

      {/* ── Lista animada ── */}
      {filtered.length === 0 ? (
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          className="py-12 text-center text-sm text-muted"
        >
          Sin citas que coincidan con el filtro.
        </motion.p>
      ) : (
        <motion.div layout={!reduce} className="space-y-2">
          <AnimatePresence initial={false} mode="popLayout">
            {rows.map((row) =>
              row.type === "header" ? (
                <motion.div
                  key={row.key}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={reduce ? undefined : { opacity: 0 }}
                  className="flex items-center gap-2 px-1 pb-1 pt-4 first:pt-0"
                >
                  <CalendarHeart className="h-4 w-4 text-brand dark:text-brand-glow" />
                  <h2 className="font-display text-sm font-semibold capitalize">{row.label}</h2>
                  <span className="text-xs text-muted">· {row.count}</span>
                </motion.div>
              ) : (
                <motion.div
                  key={row.key}
                  layout={!reduce}
                  initial={reduce ? false : { opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? undefined : { opacity: 0, scale: 0.96 }}
                  transition={{ type: "spring", stiffness: 320, damping: 30 }}
                >
                  <Link href={`/mascotas/${row.a.pet_id}`}>
                    <GlassCard className="flex items-center gap-4 transition-shadow hover:shadow-glow">
                      <span className="flex w-16 shrink-0 flex-col items-center">
                        <Clock className="h-4 w-4 text-muted" />
                        <span className="mt-1 font-display text-sm font-semibold tabular-nums">{fmtTime(row.a.scheduled_at)}</span>
                      </span>
                      <PetAvatar name={row.a.pet?.name ?? "?"} size={40} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{row.a.pet?.name} · {row.a.reason}</p>
                        <p className="truncate text-xs text-muted">{row.a.pet?.owner?.full_name} · {row.a.vet_name ?? "—"}</p>
                      </div>
                      <div className="text-right">
                        {row.a.price != null && <p className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(row.a.price)}</p>}
                        <span className={cn("text-xs font-medium", row.a.status === "programada" ? "text-accent" : "text-muted")}>{row.a.status}</span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ),
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
        active
          ? "bg-brand/15 text-brand ring-1 ring-brand/30 dark:text-brand-glow"
          : "bg-ink/[0.05] text-muted hover:text-ink",
      )}
    >
      {children}
    </button>
  );
}
