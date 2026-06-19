"use client";

import { useReducedMotion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, Cell,
} from "recharts";
import { rd } from "@/lib/format";

const BRAND = "#14B8A6";
const BRAND_GLOW = "#2DD4BF";
const ACCENT = "#FB7185";
const AREA_COLORS: Record<string, string> = {
  "Clínica": BRAND,
  "Hotel": ACCENT,
  "Peluquería": BRAND_GLOW,
};

function kfmt(v: number) {
  return v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`;
}

function ChartTooltip({ active, payload, label, money = true }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-hairline/15 bg-elevated px-3 py-2 text-xs shadow-lift">
      {label && <p className="mb-1 font-semibold text-ink">{label}</p>}
      {payload.map((p: any, i: number) => (
        <p key={i} className="flex items-center gap-2 text-muted">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color || p.fill }} />
          <span className="capitalize">{p.name}:</span>
          <span className="font-semibold text-ink tabular-nums">{money ? rd(p.value) : p.value}</span>
        </p>
      ))}
    </div>
  );
}

const axisProps = {
  tick: { fill: "currentColor", fontSize: 11 } as const,
  tickLine: false,
  axisLine: false,
};

/** Ingresos por área (barras). */
export function AreaRevenueBars({ data, onBarClick }: { data: { area: string; ingresos: number }[]; onBarClick?: (area: string) => void }) {
  const reduce = useReducedMotion();
  return (
    <div className="h-64 w-full text-muted">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="area" {...axisProps} />
          <YAxis {...axisProps} tickFormatter={kfmt} width={40} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
          <Bar dataKey="ingresos" name="ingresos" radius={[8, 8, 0, 0]} isAnimationActive={!reduce} animationDuration={900}
            onClick={(d: any) => onBarClick?.(d?.area)} cursor={onBarClick ? "pointer" : undefined}>
            {data.map((d) => <Cell key={d.area} fill={AREA_COLORS[d.area] ?? BRAND} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Ingresos vs gastos en el tiempo (área). */
export function IncomeExpenseArea({ data }: { data: { label: string; ingresos: number; gastos: number }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="h-72 w-full text-muted">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <defs>
            <linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={BRAND} stopOpacity={0.5} />
              <stop offset="100%" stopColor={BRAND} stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={ACCENT} stopOpacity={0.45} />
              <stop offset="100%" stopColor={ACCENT} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.1} vertical={false} />
          <XAxis dataKey="label" {...axisProps} minTickGap={24} />
          <YAxis {...axisProps} tickFormatter={kfmt} width={40} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="ingresos" name="ingresos" stroke={BRAND} strokeWidth={2.5} fill="url(#gInc)" isAnimationActive={!reduce} animationDuration={1100} />
          <Area type="monotone" dataKey="gastos" name="gastos" stroke={ACCENT} strokeWidth={2.5} fill="url(#gExp)" isAnimationActive={!reduce} animationDuration={1100} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Servicios más solicitados (barras horizontales). */
export function TopServicesBars({ data }: { data: { name: string; count: number }[] }) {
  const reduce = useReducedMotion();
  return (
    <div className="h-72 w-full text-muted">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
          <CartesianGrid stroke="currentColor" strokeOpacity={0.1} horizontal={false} />
          <XAxis type="number" {...axisProps} allowDecimals={false} />
          <YAxis type="category" dataKey="name" {...axisProps} width={120} />
          <Tooltip content={<ChartTooltip money={false} />} cursor={{ fill: "currentColor", fillOpacity: 0.05 }} />
          <Bar dataKey="count" name="solicitudes" radius={[0, 8, 8, 0]} fill={BRAND} isAnimationActive={!reduce} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
