import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

/** Logotipo de Clínica Nido. */
export function Brand({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span className="relative grid h-10 w-10 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow shadow-glow">
        <PawPrint className="h-5 w-5 text-[#04201d]" strokeWidth={2.5} />
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-canvas" />
      </span>
      <div className="leading-tight">
        <p className="font-display text-[15px] font-bold tracking-tight">
          Clínica Nido
        </p>
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">
          Premium Care
        </p>
      </div>
    </div>
  );
}
