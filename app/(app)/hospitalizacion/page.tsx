import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { getHospitalizations } from "@/lib/supabase/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { PulseDot } from "@/components/motion/PulseDot";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { fmtDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HospitalizacionPage() {
  const all = await getHospitalizations();
  const active = all.filter((h) => !h.discharged_at);
  const past = all.filter((h) => h.discharged_at);

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent">
          <HeartPulse className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Hospitalización</h1>
          <p className="text-sm text-muted">{active.length} internada(s) ahora mismo</p>
        </div>
      </div>

      <div className="space-y-3">
        {active.map((h) => (
          <Link key={h.id} href={`/mascotas/${h.pet_id}`}>
            <GlassCard glow className="flex items-center gap-4 transition-shadow hover:shadow-glow">
              <PetAvatar name={h.pet?.name ?? "?"} size={48} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{h.pet?.name} · {h.reason}</p>
                <p className="text-xs text-muted">{h.treatment ?? "—"}</p>
                <p className="mt-1 text-xs text-muted">Ingreso {fmtDateTime(h.admitted_at)} · {h.vet_name ?? "—"}</p>
              </div>
              <span className="flex shrink-0 items-center gap-2 rounded-full bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent">
                <PulseDot tone="accent" /> {h.status}
              </span>
            </GlassCard>
          </Link>
        ))}
      </div>

      {past.length > 0 && (
        <>
          <h2 className="mb-3 mt-8 font-display text-sm font-semibold text-muted">Historial de altas</h2>
          <div className="space-y-3">
            {past.map((h) => (
              <Link key={h.id} href={`/mascotas/${h.pet_id}`}>
                <GlassCard className="flex items-center gap-4 opacity-80 transition-opacity hover:opacity-100">
                  <PetAvatar name={h.pet?.name ?? "?"} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{h.pet?.name} · {h.reason}</p>
                    <p className="text-xs text-muted">Alta {fmtDateTime(h.discharged_at)}</p>
                  </div>
                  <span className={cn("shrink-0 rounded-full bg-ink/[0.06] px-3 py-1.5 text-xs font-semibold text-muted")}>
                    Dada de alta
                  </span>
                </GlassCard>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
