import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, IdCard, CalendarDays, Briefcase, Plane } from "lucide-react";
import { getEmployee } from "@/lib/supabase/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { ProgressBar } from "@/components/motion/ProgressBar";
import { rd, fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EmpleadoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const e = await getEmployee(id);
  if (!e) notFound();

  const initials = e.full_name.replace("Dra. ", "").replace("Dr. ", "").split(" ").map((p) => p[0]).slice(0, 2).join("");
  const vacLeft = e.vacation_total - e.vacation_taken;
  const vacPct = e.vacation_total ? (e.vacation_taken / e.vacation_total) * 100 : 0;

  const rows = [
    e.cedula && { icon: IdCard, text: e.cedula },
    e.phone && { icon: Phone, text: e.phone },
    e.email && { icon: Mail, text: e.email },
    e.hired_on && { icon: CalendarDays, text: `Ingreso ${fmtDate(e.hired_on)}` },
  ].filter(Boolean) as { icon: typeof Phone; text: string }[];

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/admin/empleados" className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Empleados
      </Link>

      <GlassCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <span className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow text-lg font-bold text-[#04201d]">{initials}</span>
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-2xl font-bold tracking-tight">{e.full_name}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              <span className="inline-flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" />{e.role}</span>
              <span className="rounded-full bg-brand/15 px-2 py-0.5 text-xs font-semibold text-brand dark:text-brand-glow">{e.area}</span>
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r, i) => { const Icon = r.icon; return (
            <div key={i} className="flex items-center gap-3 rounded-xl bg-ink/[0.03] px-4 py-3 text-sm">
              <Icon className="h-4 w-4 shrink-0 text-brand dark:text-brand-glow" /><span>{r.text}</span>
            </div>
          ); })}
        </div>
      </GlassCard>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard>
          <p className="text-xs uppercase tracking-wider text-muted">Salario mensual</p>
          <p className="mt-1 font-display text-2xl font-bold tabular-nums text-brand dark:text-brand-glow">{rd(e.salary)}</p>
        </GlassCard>
        <GlassCard>
          <div className="mb-2 flex items-center justify-between">
            <p className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted"><Plane className="h-3.5 w-3.5" /> Vacaciones</p>
            <p className="text-sm font-semibold">{vacLeft} / {e.vacation_total} días</p>
          </div>
          <ProgressBar value={vacPct} tone="accent" />
          <p className="mt-2 text-xs text-muted">{e.vacation_taken} días tomados este año</p>
        </GlassCard>
      </div>
    </div>
  );
}
