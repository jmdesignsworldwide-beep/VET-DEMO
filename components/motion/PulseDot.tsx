import { cn } from "@/lib/utils";

/** Indicador "en vivo" que late. Para datos en tiempo real / estado activo. */
export function PulseDot({
  className,
  tone = "brand",
  label,
}: {
  className?: string;
  tone?: "brand" | "accent";
  label?: string;
}) {
  const color = tone === "brand" ? "bg-brand-glow" : "bg-accent";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="relative grid h-2.5 w-2.5 place-items-center">
        <span
          className={cn(
            "absolute h-2.5 w-2.5 rounded-full animate-pulse-ring",
            color,
          )}
        />
        <span className={cn("h-2 w-2 rounded-full", color)} />
      </span>
      {label && (
        <span className="text-xs font-medium uppercase tracking-wider text-muted">
          {label}
        </span>
      )}
    </span>
  );
}
