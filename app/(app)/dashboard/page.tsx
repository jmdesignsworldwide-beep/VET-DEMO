import {
  ArrowUpRight,
  CalendarHeart,
  BedDouble,
  Scissors,
  Wallet,
} from "lucide-react";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { PulseDot } from "@/components/motion/PulseDot";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/motion/Magnetic";

const kpis = [
  {
    label: "Ingresos del mes",
    value: 842500,
    prefix: "RD$ ",
    icon: Wallet,
    trend: "+18.2%",
    tone: "brand" as const,
  },
  {
    label: "Citas hoy",
    value: 24,
    icon: CalendarHeart,
    trend: "+5",
    tone: "accent" as const,
  },
  {
    label: "Ocupación hotel",
    value: 86,
    suffix: "%",
    icon: BedDouble,
    trend: "+12%",
    tone: "brand" as const,
  },
  {
    label: "En peluquería",
    value: 7,
    icon: Scissors,
    trend: "live",
    tone: "accent" as const,
  },
];

const hotel = [
  { area: "Suites premium", value: 92 },
  { area: "Habitaciones estándar", value: 78 },
  { area: "Área de juego", value: 64 },
];

const citas = [
  { hora: "09:30", pet: "Max", tipo: "Vacunación", dueño: "C. Rodríguez" },
  { hora: "10:15", pet: "Luna", tipo: "Peluquería completa", dueño: "M. Pérez" },
  { hora: "11:00", pet: "Rocky", tipo: "Check-in hotel", dueño: "J. Santos" },
  { hora: "12:30", pet: "Coco", tipo: "Consulta general", dueño: "A. Díaz" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl">
      {/* Encabezado */}
      <Stagger className="mb-8">
        <Reveal className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-sm font-medium text-muted">
              Miércoles, 18 de junio · Resumen del día
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Buenos días, <span className="text-gradient">Nido</span>
            </h1>
          </div>
          <PulseDot tone="brand" label="Datos en vivo" />
        </Reveal>
      </Stagger>

      {/* KPIs */}
      <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Reveal key={kpi.label}>
              <Magnetic strength={0.18}>
                <GlassCard className="overflow-hidden">
                  <div className="flex items-start justify-between">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-2xl ${
                        kpi.tone === "brand"
                          ? "bg-brand/15 text-brand-glow"
                          : "bg-accent/15 text-accent"
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                        kpi.tone === "brand"
                          ? "bg-brand/10 text-brand-glow"
                          : "bg-accent/10 text-accent"
                      }`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      {kpi.trend}
                    </span>
                  </div>
                  <p className="mt-5 text-sm text-muted">{kpi.label}</p>
                  <p className="mt-1 font-display text-3xl font-bold tracking-tight">
                    <CountUp
                      to={kpi.value}
                      prefix={kpi.prefix}
                      suffix={kpi.suffix}
                    />
                  </p>
                </GlassCard>
              </Magnetic>
            </Reveal>
          );
        })}
      </Stagger>

      {/* Detalle */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        {/* Ocupación hotel */}
        <Reveal className="lg:col-span-2">
          <GlassCard className="h-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Hotel canino
                </h2>
                <p className="text-sm text-muted">Ocupación por área</p>
              </div>
              <PulseDot tone="accent" />
            </div>
            <div className="space-y-5">
              {hotel.map((h, i) => (
                <div key={h.area}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium">{h.area}</span>
                    <span className="tnum text-muted">{h.value}%</span>
                  </div>
                  <ProgressBar
                    value={h.value}
                    tone={i === 0 ? "brand" : "accent"}
                  />
                </div>
              ))}
            </div>
          </GlassCard>
        </Reveal>

        {/* Próximas citas */}
        <Reveal className="lg:col-span-3">
          <GlassCard className="h-full">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-semibold">
                  Próximas citas
                </h2>
                <p className="text-sm text-muted">Hoy · 4 programadas</p>
              </div>
              <button className="rounded-xl glass px-3 py-1.5 text-sm font-medium transition-shadow hover:shadow-glow">
                Ver agenda
              </button>
            </div>
            <ul className="divide-y divide-hairline/10">
              {citas.map((c) => (
                <li
                  key={c.hora}
                  className="group flex items-center gap-4 py-3 transition-colors"
                >
                  <span className="tnum w-14 shrink-0 font-display text-sm font-semibold text-brand-glow">
                    {c.hora}
                  </span>
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink/[0.06] text-sm font-bold">
                    {c.pet[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {c.pet} · {c.tipo}
                    </p>
                    <p className="truncate text-xs text-muted">{c.dueño}</p>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
                </li>
              ))}
            </ul>
          </GlassCard>
        </Reveal>
      </div>
    </div>
  );
}
