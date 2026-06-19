"use client";

import { useMemo, useState } from "react";
import { Wallet, TrendingDown, Scale, ReceiptText } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { CountUp } from "@/components/motion/CountUp";
import { DetailModal } from "@/components/shared/DetailModal";
import { AreaRevenueBars, IncomeExpenseArea } from "./charts";
import { rd, fmtDate } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FinanceData, FinancePeriod } from "@/lib/supabase/queries";
import type { Invoice } from "@/lib/types";

const PERIODS: { key: FinancePeriod; label: string }[] = [
  { key: "hoy", label: "Hoy" },
  { key: "semana", label: "Semana" },
  { key: "mes", label: "Mes" },
];

const AREA_DOT: Record<string, string> = {
  "Clínica": "bg-brand",
  "Hotel": "bg-accent",
  "Peluquería": "bg-brand-glow",
};

function periodStart(period: FinancePeriod): Date {
  const s = new Date();
  s.setHours(0, 0, 0, 0);
  if (period === "semana") s.setDate(s.getDate() - 6);
  else if (period === "mes") s.setDate(s.getDate() - 29);
  return s;
}

export function FinanceView({ data, invoices }: { data: Record<FinancePeriod, FinanceData>; invoices: Invoice[] }) {
  const [period, setPeriod] = useState<FinancePeriod>("mes");
  const [selArea, setSelArea] = useState<string | null>(null);
  const d = data[period];

  const areaInvoices = useMemo(() => {
    if (!selArea) return [];
    const start = periodStart(period).getTime();
    return invoices
      .filter((i) => i.area === selArea && new Date(i.issued_at).getTime() >= start)
      .sort((a, b) => +new Date(b.issued_at) - +new Date(a.issued_at));
  }, [selArea, period, invoices]);
  const areaTotal = areaInvoices.reduce((s, i) => s + Number(i.total), 0);

  return (
    <div>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow">
            <Wallet className="h-5 w-5" />
          </span>
          <h2 className="font-display text-xl font-bold tracking-tight">Control financiero</h2>
        </div>
        <div className="flex gap-1.5 rounded-full glass p-1">
          {PERIODS.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={cn("rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors",
                period === p.key ? "bg-brand/20 text-brand dark:text-brand-glow" : "text-muted hover:text-ink")}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><Kpi icon={Wallet} label="Ingresos" value={d.income} tone="brand" /></Reveal>
        <Reveal><Kpi icon={TrendingDown} label="Gastos" value={d.expense} tone="accent" /></Reveal>
        <Reveal><Kpi icon={Scale} label="Balance" value={d.balance} tone={d.balance >= 0 ? "brand" : "accent"} /></Reveal>
        <Reveal><Kpi icon={ReceiptText} label="Facturas" value={d.invoiceCount} tone="brand" money={false} /></Reveal>
      </Stagger>

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full">
            <h3 className="mb-1 font-display font-semibold">Ingresos por área</h3>
            <p className="mb-3 text-xs text-muted">Toca un área para ver el desglose</p>
            <AreaRevenueBars data={d.byArea} onBarClick={setSelArea} />
            <div className="mt-3 flex flex-wrap justify-center gap-2">
              {d.byArea.map((a) => (
                <button key={a.area} onClick={() => setSelArea(a.area)}
                  className="flex items-center gap-1.5 rounded-full bg-ink/[0.04] px-3 py-1 text-xs text-muted transition-colors hover:text-ink">
                  <span className={cn("h-2.5 w-2.5 rounded-full", AREA_DOT[a.area])} /> {a.area}
                </button>
              ))}
            </div>
          </GlassCard>
        </Reveal>
        <Reveal className="lg:col-span-3">
          <GlassCard className="h-full">
            <h3 className="mb-1 font-display font-semibold">Ingresos vs. gastos</h3>
            <p className="mb-3 text-xs text-muted">Evolución del periodo</p>
            <IncomeExpenseArea data={d.series} />
          </GlassCard>
        </Reveal>
      </div>

      <DetailModal
        open={!!selArea}
        onClose={() => setSelArea(null)}
        title={`Ingresos · ${selArea ?? ""}`}
        subtitle={`${areaInvoices.length} facturas en el periodo`}
        fields={[
          { label: "Total del área", value: rd(areaTotal), accent: true },
          { label: "Facturas", value: String(areaInvoices.length) },
        ]}
      >
        <div className="mt-4 max-h-64 space-y-2 overflow-y-auto pr-1">
          {areaInvoices.slice(0, 30).map((i) => (
            <div key={i.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink/[0.03] px-3 py-2 text-sm">
              <div className="min-w-0">
                <p className="truncate font-medium">{i.customer_name}</p>
                <p className="truncate text-xs text-muted">{i.ncf} · {fmtDate(i.issued_at)}</p>
              </div>
              <span className="shrink-0 font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(i.total)}</span>
            </div>
          ))}
        </div>
      </DetailModal>
    </div>
  );
}

function Kpi({ icon: Icon, label, value, tone, money = true }: { icon: typeof Wallet; label: string; value: number; tone: "brand" | "accent"; money?: boolean }) {
  return (
    <GlassCard>
      <span className={cn("grid h-10 w-10 place-items-center rounded-xl", tone === "brand" ? "bg-brand/15 text-brand dark:text-brand-glow" : "bg-accent/15 text-accent")}>
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm text-muted">{label}</p>
      <p className="mt-0.5 font-display text-2xl font-bold tracking-tight">
        <CountUp to={value} prefix={money ? "RD$ " : ""} />
      </p>
    </GlassCard>
  );
}
