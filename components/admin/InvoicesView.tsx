"use client";

import { useMemo, useState } from "react";
import { ReceiptText, Search, AlertTriangle } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Form";
import { rd, fmtDateTime, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { Invoice } from "@/lib/types";

export function InvoicesView({ invoices }: { invoices: Invoice[] }) {
  const [q, setQ] = useState("");
  const [sel, setSel] = useState<Invoice | null>(null);

  const term = q.trim().toLowerCase();
  const filtered = useMemo(() => invoices.filter((i) =>
    !term || i.customer_name.toLowerCase().includes(term) || i.ncf.toLowerCase().includes(term),
  ), [invoices, term]);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><ReceiptText className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Facturación NCF</h1>
          <p className="text-sm text-muted">{invoices.length} comprobantes · ITBIS 18%</p>
        </div>
      </div>

      <div className="mb-4 flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-sm text-accent">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
        NCF simulado para demostración. No certificado ante la DGII.
      </div>

      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por cliente o NCF…" className="h-12 pl-11" />
      </div>

      <Stagger className="space-y-2">
        {filtered.map((inv) => (
          <Reveal key={inv.id}>
            <button onClick={() => setSel(inv)} className="w-full text-left">
              <GlassCard className="flex items-center gap-4 transition-shadow hover:shadow-glow">
                <span className={cn("rounded-lg px-2 py-1 text-xs font-bold", inv.ncf_type === "B01" ? "bg-accent/15 text-accent" : "bg-brand/15 text-brand dark:text-brand-glow")}>{inv.ncf_type}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{inv.customer_name}</p>
                  <p className="truncate text-xs text-muted">{inv.ncf} · {inv.area} · {fmtDate(inv.issued_at)}</p>
                </div>
                <span className="font-display font-bold tabular-nums text-brand dark:text-brand-glow">{rd(inv.total)}</span>
              </GlassCard>
            </button>
          </Reveal>
        ))}
      </Stagger>

      <Modal open={!!sel} onClose={() => setSel(null)} title={`Factura ${sel?.ncf_type ?? ""}`} description={sel?.ncf}>
        {sel && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Detail label="Cliente" value={sel.customer_name} />
              <Detail label="RNC/Cédula" value={sel.customer_rnc ?? "Consumidor final"} />
              <Detail label="Área" value={sel.area} />
              <Detail label="Fecha" value={fmtDateTime(sel.issued_at)} />
            </div>

            <div className="overflow-hidden rounded-xl border border-hairline/15">
              <table className="w-full text-sm">
                <thead className="bg-ink/[0.04] text-xs text-muted">
                  <tr><th className="p-2 text-left">Descripción</th><th className="p-2 text-right">Cant.</th><th className="p-2 text-right">Precio</th></tr>
                </thead>
                <tbody>
                  {sel.items.map((it, i) => (
                    <tr key={i} className="border-t border-hairline/10">
                      <td className="p-2">{it.descripcion}</td>
                      <td className="p-2 text-right tabular-nums">{it.cantidad}</td>
                      <td className="p-2 text-right tabular-nums">{rd(it.precio)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-1.5 rounded-xl bg-ink/[0.03] p-4 text-sm">
              <Row label="Subtotal" value={rd(sel.subtotal)} />
              <Row label="ITBIS (18%)" value={rd(sel.itbis)} />
              <div className="my-1 h-px bg-hairline/15" />
              <Row label="Total" value={rd(sel.total)} bold />
            </div>

            <div className="flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-xs text-accent">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              NCF simulado para demostración. No certificado ante la DGII.
            </div>
          </div>
        )}
      </Modal>
    </div>
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
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn(bold ? "font-display text-lg font-bold" : "text-muted")}>{label}</span>
      <span className={cn("tabular-nums", bold ? "font-display text-lg font-bold text-brand dark:text-brand-glow" : "font-medium")}>{value}</span>
    </div>
  );
}
