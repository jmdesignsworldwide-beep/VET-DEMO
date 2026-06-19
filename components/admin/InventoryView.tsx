"use client";

import { useMemo, useState } from "react";
import { Boxes, Search, AlertTriangle, CalendarClock, PackageX } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form";
import { rd, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { InventoryItem } from "@/lib/types";

const CATS = ["Todas", "Medicamento", "Vacuna", "Producto", "Insumo"] as const;

function daysTo(date: string | null): number | null {
  if (!date) return null;
  return Math.round((new Date(date).getTime() - Date.now()) / 86400000);
}

export function InventoryView({ items }: { items: InventoryItem[] }) {
  const [cat, setCat] = useState<(typeof CATS)[number]>("Todas");
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<InventoryItem | null>(null);

  const lowCount = items.filter((i) => i.stock < i.min_stock).length;
  const soonCount = items.filter((i) => { const d = daysTo(i.expiry_date); return d != null && d >= 0 && d <= 45; }).length;

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => items.filter((i) =>
    (cat === "Todas" || i.category === cat) && (!term || i.name.toLowerCase().includes(term)),
  ), [items, cat, term]);

  return (
    <div className="mx-auto max-w-5xl">
      <Header />

      <Stagger className="mb-6 grid grid-cols-3 gap-3">
        <Reveal><MiniStat icon={Boxes} label="Artículos" value={items.length} tone="brand" /></Reveal>
        <Reveal><MiniStat icon={PackageX} label="Stock bajo" value={lowCount} tone="accent" /></Reveal>
        <Reveal><MiniStat icon={CalendarClock} label="Por vencer" value={soonCount} tone="accent" /></Reveal>
      </Stagger>

      <div className="mb-5 space-y-3 rounded-2xl glass p-3 shadow-glass">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar artículo…" className="h-12 pl-11" />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATS.map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                cat === c ? "bg-brand/15 text-brand ring-1 ring-brand/30 dark:text-brand-glow" : "bg-ink/[0.05] text-muted hover:text-ink")}>
              {c}
            </button>
          ))}
        </div>
      </div>

      <Stagger className="space-y-2">
        {filtered.map((i) => {
          const low = i.stock < i.min_stock;
          const d = daysTo(i.expiry_date);
          const expired = d != null && d < 0;
          const soon = d != null && d >= 0 && d <= 45;
          return (
            <Reveal key={i.id}>
              <button onClick={() => setSel(i)} className="w-full text-left">
                <GlassCard className="flex items-center gap-3 transition-shadow hover:shadow-glow">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-ink/[0.05] text-xs font-bold text-muted">{i.category[0]}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{i.name}</p>
                    <p className="text-xs text-muted">{i.category} · {i.supplier ?? "—"}</p>
                  </div>
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    {(expired || soon) && (
                      <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold", expired ? "bg-accent/20 text-accent" : "bg-accent/10 text-accent")}>
                        {expired ? "Vencido" : `Vence en ${d}d`}
                      </span>
                    )}
                    {low && <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2 py-0.5 text-[10px] font-semibold text-accent"><AlertTriangle className="h-3 w-3" />Stock bajo</span>}
                    <span className={cn("tabular-nums font-semibold", low ? "text-accent" : "text-ink")}>{i.stock} <span className="text-xs font-normal text-muted">{i.unit}</span></span>
                  </div>
                </GlassCard>
              </button>
            </Reveal>
          );
        })}
      </Stagger>

      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.name ?? ""} description={sel?.category}>
        {sel && (
          <div className="grid grid-cols-2 gap-3">
            <Detail label="Stock actual" value={`${sel.stock} ${sel.unit}`} />
            <Detail label="Mínimo" value={`${sel.min_stock} ${sel.unit}`} />
            <Detail label="Precio" value={rd(sel.price)} />
            <Detail label="Vencimiento" value={fmtDate(sel.expiry_date)} />
            <Detail label="Proveedor" value={sel.supplier ?? "—"} />
            <Detail label="Categoría" value={sel.category} />
            {sel.stock < sel.min_stock && (
              <div className="col-span-2 flex items-center gap-2 rounded-xl bg-accent/10 p-3 text-sm text-accent">
                <AlertTriangle className="h-4 w-4" /> Stock por debajo del mínimo. Reordenar pronto.
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

function Header() {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><Boxes className="h-5 w-5" /></span>
      <div>
        <h1 className="font-display text-3xl font-bold tracking-tight">Inventario</h1>
        <p className="text-sm text-muted">Medicamentos, vacunas, productos e insumos</p>
      </div>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value, tone }: { icon: typeof Boxes; label: string; value: number; tone: "brand" | "accent" }) {
  return (
    <GlassCard className="flex items-center gap-3">
      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-xl", tone === "accent" ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}><Icon className="h-4 w-4" /></span>
      <div className="min-w-0">
        <p className="font-display text-xl font-bold leading-none">{value}</p>
        <p className="truncate text-[11px] text-muted">{label}</p>
      </div>
    </GlassCard>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink/[0.03] p-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-0.5 font-semibold">{value}</p>
    </div>
  );
}
