"use client";

import { useState } from "react";
import { Wallet, TrendingDown, Scale, ReceiptText } from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { CountUp } from "@/components/motion/CountUp";
import { AreaRevenueBars, IncomeExpenseArea } from "./charts";
import { cn } from "@/lib/utils";
import type { FinanceData, FinancePeriod } from "@/lib/supabase/queries";

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

export function FinanceView({ data }: { data: Record<FinancePeriod, FinanceData> }) {
  const [period, setPeriod] = useState<FinancePeriod>("mes");
  const d = data[period];

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

      {/* KPIs */}
      <Stagger className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Reveal><Kpi icon={Wallet} label="Ingresos" value={d.income} tone="brand" /></Reveal>
        <Reveal><Kpi icon={TrendingDown} label="Gastos" value={d.expense} tone="accent" /></Reveal>
        <Reveal><Kpi icon={Scale} label="Balance" value={d.balance} tone={d.balance >= 0 ? "brand" : "accent"} /></Reveal>
        <Reveal><Kpi icon={ReceiptText} label="Facturas" value={d.invoiceCount} tone="brand" money={false} /></Reveal>
      </Stagger>

      {/* Gráficos */}
      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full">
            <h3 className="mb-1 font-display font-semibold">Ingresos por área</h3>
            <p className="mb-3 text-xs text-muted">De dónde viene cada peso</p>
            <AreaRevenueBars data={d.byArea} />
            <div className="mt-3 flex flex-wrap justify-center gap-4">
              {d.byArea.map((a) => (
                <span key={a.area} className="flex items-center gap-1.5 text-xs text-muted">
                  <span className={cn("h-2.5 w-2.5 rounded-full", AREA_DOT[a.area])} /> {a.area}
                </span>
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
