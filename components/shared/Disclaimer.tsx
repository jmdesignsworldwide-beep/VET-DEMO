import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

const TEXT = {
  ncf: "NCF simulado para demostración. No certificado ante la DGII.",
  pdf: "Documento de ejemplo generado para demostración. No constituye documento veterinario válido.",
  whatsapp: "Mensaje simulado para demostración. Sin integración real de WhatsApp.",
} as const;

/**
 * Aviso elegante y consistente para todo lo simulado en el demo.
 * `inline` lo vuelve una nota al pie más discreta (centrada, sin borde).
 */
export function Disclaimer({
  variant,
  inline,
  className,
}: {
  variant: keyof typeof TEXT;
  inline?: boolean;
  className?: string;
}) {
  if (inline) {
    return (
      <p className={cn("flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted", className)}>
        <ShieldAlert className="h-3 w-3 shrink-0 text-accent/70" />
        {TEXT[variant]}
      </p>
    );
  }
  return (
    <div className={cn("flex items-start gap-2 rounded-xl border border-accent/20 bg-accent/[0.08] px-3 py-2 text-xs leading-relaxed text-accent", className)}>
      <ShieldAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{TEXT[variant]}</span>
    </div>
  );
}
