import { cn } from "@/lib/utils";

/** Skeleton elegante con barrido (shimmer). */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-ink/[0.06]",
        "after:absolute after:inset-0 after:-translate-x-full after:animate-shimmer",
        "after:bg-gradient-to-r after:from-transparent after:via-ink/[0.08] after:to-transparent",
        className,
      )}
    />
  );
}
