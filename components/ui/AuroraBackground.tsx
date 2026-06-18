/**
 * Fondo "aurora" que respira lento. Dos manchas de luz de marca (turquesa
 * y coral) que derivan y laten con blur. Se adapta a cada tema vía las
 * variables --aurora-*. Fijo detrás de todo el contenido.
 */
export function AuroraBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Base */}
      <div className="absolute inset-0 bg-canvas" />

      {/* Mancha turquesa */}
      <div
        className="absolute -left-[10%] top-[-15%] h-[55vmax] w-[55vmax] animate-aurora-one rounded-full animate-breathe"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--aurora-a) / var(--aurora-opacity)) 0%, transparent 60%)",
        }}
      />
      {/* Mancha coral */}
      <div
        className="absolute -right-[15%] top-[10%] h-[50vmax] w-[50vmax] animate-aurora-two rounded-full animate-breathe"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--aurora-b) / var(--aurora-opacity)) 0%, transparent 60%)",
        }}
      />
      {/* Halo inferior tenue */}
      <div
        className="absolute bottom-[-25%] left-1/2 h-[45vmax] w-[70vmax] -translate-x-1/2 animate-breathe rounded-full"
        style={{
          background:
            "radial-gradient(circle at center, rgb(var(--aurora-a) / calc(var(--aurora-opacity) * 0.6)) 0%, transparent 65%)",
        }}
      />

      {/* Velo de grano sutil para textura */}
      <div
        className="absolute inset-0 opacity-[0.04] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
