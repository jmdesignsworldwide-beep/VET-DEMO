"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, UserPlus, Check, Clock, RefreshCw, Infinity as InfinityIcon } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { createClientAccount, extendAccount } from "@/lib/supabase/actions";
import { fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Profile } from "@/lib/types";

const DAY_OPTIONS = [
  { key: "7", label: "7 días", days: 7 },
  { key: "15", label: "15 días", days: 15 },
  { key: "30", label: "30 días", days: 30 },
  { key: "custom", label: "Personalizado", days: null },
  { key: "none", label: "Sin vencimiento", days: null },
] as const;

function statusOf(expires_at: string | null) {
  if (!expires_at) return { label: "Permanente", tone: "brand" as const, days: null as number | null };
  const days = Math.ceil((new Date(expires_at).getTime() - Date.now()) / 86400000);
  if (days < 0) return { label: "Vencida", tone: "muted" as const, days };
  if (days <= 3) return { label: "Por vencer", tone: "accent" as const, days };
  return { label: "Activa", tone: "brand" as const, days };
}

export function AccountsView({ accounts }: { accounts: Profile[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ username: string; password: string } | null>(null);
  const [renew, setRenew] = useState<Profile | null>(null);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [opt, setOpt] = useState<(typeof DAY_OPTIONS)[number]["key"]>("30");
  const [custom, setCustom] = useState("60");

  function resolveDays(o: string): number | null {
    if (o === "none") return null;
    if (o === "custom") return Math.max(1, Number(custom) || 1);
    return Number(o);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setCreated(null);
    const days = resolveDays(opt);
    start(async () => {
      const res = await createClientAccount({ username, password, days });
      if (!res.ok) return setError(res.error ?? "Error al crear la cuenta.");
      setCreated({ username: username.trim().toLowerCase(), password });
      setUsername(""); setPassword("");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><ShieldCheck className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Gestión de cuentas</h1>
          <p className="text-sm text-muted">Crea accesos temporales para tus clientes</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Crear cuenta */}
        <div className="lg:col-span-2">
          <GlassCard>
            <h2 className="mb-4 flex items-center gap-2 font-display font-semibold"><UserPlus className="h-4 w-4 text-brand dark:text-brand-glow" /> Nueva cuenta de cliente</h2>
            <form onSubmit={submit} className="space-y-4">
              <Field label="Usuario"><Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="clinica-cliente" autoComplete="off" required /></Field>
              <Field label="Contraseña"><Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="mínimo 6 caracteres" autoComplete="off" required /></Field>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Días de acceso</p>
                <div className="flex flex-wrap gap-2">
                  {DAY_OPTIONS.map((o) => (
                    <button type="button" key={o.key} onClick={() => setOpt(o.key)}
                      className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                        opt === o.key ? "bg-brand/15 text-brand ring-1 ring-brand/30 dark:text-brand-glow" : "bg-ink/[0.05] text-muted hover:text-ink")}>
                      {o.label}
                    </button>
                  ))}
                </div>
                {opt === "custom" && (
                  <div className="mt-3"><Field label="¿Cuántos días?"><Input type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} /></Field></div>
                )}
              </div>

              {error && <p className="text-sm font-medium text-accent">{error}</p>}
              <Button type="submit" loading={pending} className="w-full">Crear cuenta</Button>
            </form>

            {created && (
              <div className="mt-4 rounded-xl bg-brand/10 p-4">
                <p className="flex items-center gap-2 text-sm font-semibold text-brand dark:text-brand-glow"><Check className="h-4 w-4" /> Cuenta creada</p>
                <p className="mt-2 text-sm">Entrega estas credenciales a tu cliente:</p>
                <div className="mt-2 space-y-1 rounded-lg bg-ink/[0.05] p-3 font-mono text-sm">
                  <p>Usuario: <span className="font-semibold">{created.username}</span></p>
                  <p>Contraseña: <span className="font-semibold">{created.password}</span></p>
                </div>
              </div>
            )}
          </GlassCard>
        </div>

        {/* Lista de cuentas */}
        <div className="lg:col-span-3">
          <h2 className="mb-3 font-display font-semibold">Cuentas creadas ({accounts.length})</h2>
          {accounts.length === 0 ? (
            <GlassCard><p className="py-6 text-center text-sm text-muted">Aún no has creado cuentas de cliente.</p></GlassCard>
          ) : (
            <Stagger className="space-y-3">
              {accounts.map((a) => {
                const st = statusOf(a.expires_at);
                return (
                  <Reveal key={a.id}>
                    <GlassCard className="flex flex-wrap items-center gap-3">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-accent to-accent-glow text-sm font-bold text-[#3a0d18]">{a.username.slice(0, 2).toUpperCase()}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{a.username}</p>
                        <p className="text-xs text-muted">
                          {a.expires_at ? <>Vence {fmtDate(a.expires_at)}{st.days != null && st.days >= 0 ? ` · ${st.days} día${st.days === 1 ? "" : "s"}` : ""}</> : <span className="inline-flex items-center gap-1"><InfinityIcon className="h-3 w-3" /> Sin vencimiento</span>}
                        </p>
                      </div>
                      <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold",
                        st.tone === "accent" ? "bg-accent/15 text-accent" : st.tone === "muted" ? "bg-ink/[0.06] text-muted" : "bg-brand/15 text-brand dark:text-brand-glow")}>
                        {st.label}
                      </span>
                      <button onClick={() => setRenew(a)} className="inline-flex items-center gap-1.5 rounded-xl bg-ink/[0.06] px-3 py-2 text-sm font-medium transition-colors hover:bg-ink/[0.1]">
                        <RefreshCw className="h-4 w-4" /> Renovar
                      </button>
                    </GlassCard>
                  </Reveal>
                );
              })}
            </Stagger>
          )}
        </div>
      </div>

      <RenewModal account={renew} onClose={() => setRenew(null)} />
    </div>
  );
}

function RenewModal({ account, onClose }: { account: Profile | null; onClose: () => void }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [opt, setOpt] = useState<string>("30");
  const [custom, setCustom] = useState("30");

  function apply() {
    if (!account) return;
    start(async () => {
      if (opt === "none") await extendAccount(account.id, { clear: true });
      else {
        const days = opt === "custom" ? Math.max(1, Number(custom) || 1) : Number(opt);
        await extendAccount(account.id, { days });
      }
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal open={!!account} onClose={onClose} title="Renovar acceso" description={account ? `Cuenta: ${account.username}` : ""}>
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted">Sumar tiempo</p>
          <div className="flex flex-wrap gap-2">
            {["7", "15", "30", "custom", "none"].map((o) => (
              <button key={o} type="button" onClick={() => setOpt(o)}
                className={cn("rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                  opt === o ? "bg-brand/15 text-brand ring-1 ring-brand/30 dark:text-brand-glow" : "bg-ink/[0.05] text-muted hover:text-ink")}>
                {o === "custom" ? "Personalizado" : o === "none" ? "Sin vencimiento" : `+${o} días`}
              </button>
            ))}
          </div>
          {opt === "custom" && (
            <div className="mt-3"><Field label="¿Cuántos días sumar?"><Input type="number" min={1} value={custom} onChange={(e) => setCustom(e.target.value)} /></Field></div>
          )}
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-ink/[0.03] p-3 text-xs text-muted">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          El tiempo se suma a partir de hoy (o de la fecha de vencimiento si aún está vigente).
        </div>
        <div className="flex justify-end gap-3">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="button" loading={pending} onClick={apply}>Aplicar</Button>
        </div>
      </div>
    </Modal>
  );
}
