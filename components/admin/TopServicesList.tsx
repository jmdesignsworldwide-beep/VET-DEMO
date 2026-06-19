"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { DetailModal } from "@/components/shared/DetailModal";
import { cn } from "@/lib/utils";

export function TopServicesList({ data }: { data: { name: string; count: number }[] }) {
  const [sel, setSel] = useState<{ name: string; count: number } | null>(null);
  const max = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="space-y-2">
      {data.map((s, i) => (
        <button key={s.name} type="button" onClick={() => setSel(s)}
          className="group flex w-full items-center gap-3 rounded-xl bg-ink/[0.03] px-3 py-2.5 text-left transition-colors hover:bg-ink/[0.06]">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand/15 text-xs font-bold text-brand dark:text-brand-glow">{i + 1}</span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{s.name}</p>
            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-ink/[0.06]">
              <div className={cn("h-full rounded-full bg-gradient-to-r from-brand to-brand-glow")} style={{ width: `${(s.count / max) * 100}%` }} />
            </div>
          </div>
          <span className="shrink-0 text-sm font-semibold tabular-nums text-muted">{s.count}</span>
        </button>
      ))}

      <DetailModal
        open={!!sel}
        onClose={() => setSel(null)}
        title={sel?.name ?? ""}
        subtitle="Servicio solicitado"
        icon={Sparkles}
        fields={sel ? [
          { label: "Solicitudes", value: String(sel.count) },
          { label: "Posición", value: `#${data.findIndex((d) => d.name === sel.name) + 1} más solicitado` },
        ] : []}
        note="Total de veces que este servicio fue agendado o registrado en el sistema."
      />
    </div>
  );
}
