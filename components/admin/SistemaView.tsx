"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ServerCog, CloudUpload, MessageCircle, ScrollText, ShieldCheck,
  Check, X, RefreshCw, Database,
} from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { Button } from "@/components/ui/Button";
import { PulseDot } from "@/components/motion/PulseDot";
import { forceBackup } from "@/lib/supabase/actions";
import { timeAgo, fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Backup, WhatsAppLog, AuditLog } from "@/lib/types";

const TABS = [
  { key: "respaldo", label: "Respaldo", icon: CloudUpload },
  { key: "whatsapp", label: "WhatsApp", icon: MessageCircle },
  { key: "auditoria", label: "Auditoría", icon: ScrollText },
  { key: "roles", label: "Roles", icon: ShieldCheck },
] as const;

const ROLES = ["Administrador", "Veterinario", "Groomer", "Cuidador", "Recepción"];
const PERMS = ["Clínica", "Hotel", "Peluquería", "Facturación", "Inventario", "Empleados"];
const MATRIX: Record<string, string[]> = {
  Administrador: PERMS,
  Veterinario: ["Clínica", "Inventario"],
  Groomer: ["Peluquería"],
  Cuidador: ["Hotel"],
  Recepción: ["Clínica", "Hotel", "Peluquería", "Facturación"],
};

export function SistemaView({ backups, whatsapp, audit }: { backups: Backup[]; whatsapp: WhatsAppLog[]; audit: AuditLog[] }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("respaldo");
  const router = useRouter();
  const [pending, start] = useTransition();
  const last = backups[0];

  function runBackup() {
    start(async () => { await forceBackup(); router.refresh(); });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><ServerCog className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Sistema</h1>
          <p className="text-sm text-muted">Respaldos, comunicación, auditoría y seguridad</p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon; const active = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={cn("relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors", active ? "text-ink" : "bg-ink/[0.04] text-muted hover:text-ink")}>
              {active && <motion.span layoutId="sys-tab" className="absolute inset-0 rounded-xl glass shadow-glow" transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
              <Icon className="relative z-10 h-4 w-4" /><span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
          {tab === "respaldo" && (
            <div className="space-y-4">
              <GlassCard glow>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><Database className="h-6 w-6" /></span>
                    <div>
                      <p className="flex items-center gap-2 font-semibold"><PulseDot tone="brand" /> Respaldo en la nube</p>
                      <p className="text-xs text-muted">Último respaldo {last ? timeAgo(last.created_at) : "—"} · {last?.size_mb ?? "—"} MB</p>
                    </div>
                  </div>
                  <Button onClick={runBackup} loading={pending}><RefreshCw className="h-4 w-4" /> Forzar respaldo</Button>
                </div>
              </GlassCard>
              <Stagger className="space-y-2">
                {backups.map((b) => (
                  <Reveal key={b.id}>
                    <GlassCard className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/15 text-brand dark:text-brand-glow"><CloudUpload className="h-4 w-4" /></span>
                      <div className="flex-1"><p className="text-sm font-medium capitalize">{b.status}</p><p className="text-xs text-muted">{fmtDateTime(b.created_at)}</p></div>
                      <span className="text-sm tabular-nums text-muted">{b.size_mb} MB</span>
                    </GlassCard>
                  </Reveal>
                ))}
              </Stagger>
            </div>
          )}

          {tab === "whatsapp" && (
            <>
              <Disclaimer variant="whatsapp" className="mb-4" />
              <Stagger className="space-y-3">
                {whatsapp.map((m) => (
                  <Reveal key={m.id}>
                    <div className="flex gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#25D366] text-white shadow-lg"><MessageCircle className="h-5 w-5" /></span>
                      <div className="flex-1 rounded-2xl rounded-tl-sm glass p-3 shadow-glass">
                        <div className="mb-1 flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold">{m.to_name}</p>
                          <span className="text-[11px] text-muted">{timeAgo(m.sent_at)}</span>
                        </div>
                        <p className="text-sm text-muted">{m.message}</p>
                        <span className="mt-1 inline-block rounded-full bg-ink/[0.06] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted">{m.kind}</span>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </Stagger>
            </>
          )}

          {tab === "auditoria" && (
            <div className="relative pl-2">
              <span className="absolute left-[15px] top-2 bottom-2 w-px bg-hairline/15" />
              <Stagger className="space-y-4">
                {audit.map((a) => (
                  <Reveal key={a.id}>
                    <div className="relative flex gap-4">
                      <span className="relative z-10 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-brand/15 text-brand ring-4 ring-canvas dark:text-brand-glow"><ScrollText className="h-3.5 w-3.5" /></span>
                      <div className="flex-1">
                        <p className="text-sm"><span className="font-semibold">{a.actor}</span> · {a.action}</p>
                        <p className="text-xs text-muted">{a.entity}{a.detail ? ` — ${a.detail}` : ""} · {timeAgo(a.created_at)}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </Stagger>
            </div>
          )}

          {tab === "roles" && (
            <GlassCard className="overflow-x-auto">
              <p className="mb-1 font-display font-semibold">Seguridad y accesos por roles</p>
              <p className="mb-4 text-xs text-muted">Preparado para el sistema de usuarios admin (próximamente).</p>
              <table className="w-full min-w-[520px] text-sm">
                <thead>
                  <tr className="text-xs text-muted">
                    <th className="p-2 text-left">Rol</th>
                    {PERMS.map((p) => <th key={p} className="p-2 text-center font-medium">{p}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {ROLES.map((r) => (
                    <tr key={r} className="border-t border-hairline/10">
                      <td className="p-2 font-semibold">{r}</td>
                      {PERMS.map((p) => (
                        <td key={p} className="p-2 text-center">
                          {MATRIX[r].includes(p)
                            ? <Check className="mx-auto h-4 w-4 text-brand dark:text-brand-glow" />
                            : <X className="mx-auto h-4 w-4 text-muted/40" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </GlassCard>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
