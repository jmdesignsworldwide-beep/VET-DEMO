import { BarChart3 } from "lucide-react";
import { getReports } from "@/lib/supabase/queries";
import { AreaRevenueBars } from "@/components/admin/charts";
import { TopServicesList } from "@/components/admin/TopServicesList";
import { GlassCard } from "@/components/ui/GlassCard";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { rd } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const { byArea, topServices } = await getReports();
  const total = byArea.reduce((s, a) => s + a.ingresos, 0);
  const top = topServices[0];

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow"><BarChart3 className="h-5 w-5" /></span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Reportes y estadísticas</h1>
          <p className="text-sm text-muted">Ingresos por área y servicios más solicitados</p>
        </div>
      </div>

      <Stagger className="mb-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Reveal><GlassCard><p className="text-xs uppercase tracking-wider text-muted">Ingresos totales</p><p className="mt-1 font-display text-2xl font-bold tabular-nums text-brand dark:text-brand-glow">{rd(total)}</p></GlassCard></Reveal>
        <Reveal><GlassCard><p className="text-xs uppercase tracking-wider text-muted">Servicio top</p><p className="mt-1 truncate font-display text-lg font-bold">{top?.name ?? "—"}</p></GlassCard></Reveal>
        <Reveal><GlassCard><p className="text-xs uppercase tracking-wider text-muted">Áreas activas</p><p className="mt-1 font-display text-2xl font-bold">{byArea.filter((a) => a.ingresos > 0).length} / 3</p></GlassCard></Reveal>
      </Stagger>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <GlassCard>
          <h3 className="mb-1 font-display font-semibold">Ingresos por área</h3>
          <p className="mb-3 text-xs text-muted">Total histórico facturado</p>
          <AreaRevenueBars data={byArea} />
        </GlassCard>
        <GlassCard>
          <h3 className="mb-1 font-display font-semibold">Servicios más solicitados</h3>
          <p className="mb-3 text-xs text-muted">Toca un servicio para ver el detalle</p>
          <TopServicesList data={topServices} />
        </GlassCard>
      </div>
    </div>
  );
}
