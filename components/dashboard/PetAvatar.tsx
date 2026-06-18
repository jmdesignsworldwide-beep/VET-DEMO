import { cn } from "@/lib/utils";

const PALETTE = [
  "from-brand to-brand-glow text-[#04201d]",
  "from-accent to-accent-glow text-[#3a0d18]",
  "from-[#22d3ee] to-[#2dd4bf] text-[#04201d]",
  "from-[#f59e0b] to-[#fbbf24] text-[#3a2a04]",
  "from-[#a78bfa] to-[#c4b5fd] text-[#24103a]",
];

function hueFor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h + name.charCodeAt(i)) % PALETTE.length;
  return PALETTE[h];
}

/** Avatar de mascota basado en inicial + degradado estable por nombre. */
export function PetAvatar({
  name,
  size = 36,
  ring = true,
  className,
}: {
  name: string;
  size?: number;
  ring?: boolean;
  className?: string;
}) {
  return (
    <span
      title={name}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
      className={cn(
        "grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-bold",
        ring && "ring-2 ring-canvas",
        hueFor(name),
        className,
      )}
    >
      {name[0]}
    </span>
  );
}

/** Pila de avatares solapados, con "+N" si hay más de `max`. */
export function AvatarStack({
  names,
  max = 4,
  size = 34,
}: {
  names: string[];
  max?: number;
  size?: number;
}) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <div className="flex items-center" style={{ paddingLeft: size * 0.28 }}>
      {shown.map((n, i) => (
        <span
          key={n + i}
          style={{ marginLeft: -size * 0.28, zIndex: shown.length - i }}
          className="transition-transform hover:-translate-y-1"
        >
          <PetAvatar name={n} size={size} />
        </span>
      ))}
      {rest > 0 && (
        <span
          style={{ width: size, height: size, marginLeft: -size * 0.28 }}
          className="grid place-items-center rounded-full bg-elevated text-xs font-bold text-muted ring-2 ring-canvas"
        >
          +{rest}
        </span>
      )}
    </div>
  );
}
