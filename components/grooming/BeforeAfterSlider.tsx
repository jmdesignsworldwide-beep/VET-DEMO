"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { imgUrl } from "@/lib/format";

/** Slider Antes/Después: arrastra la línea divisoria (mouse o dedo). */
export function BeforeAfterSlider({
  before,
  after,
  alt = "Transformación",
}: {
  before: string;
  after: string;
  alt?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(50);
  const dragging = useRef(false);

  function update(clientX: number) {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const p = ((clientX - r.left) / r.width) * 100;
    setPos(Math.max(0, Math.min(100, p)));
  }

  return (
    <div
      ref={ref}
      onPointerDown={(e) => {
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && update(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      className="relative aspect-[9/7] w-full cursor-ew-resize touch-none select-none overflow-hidden rounded-2xl bg-ink/[0.06]"
    >
      {/* Después (base) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imgUrl(after)} alt={`${alt} — después`} draggable={false} className="absolute inset-0 h-full w-full object-cover" />

      {/* Antes (recortado a la izquierda hasta `pos`) */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imgUrl(before)} alt={`${alt} — antes`} draggable={false} className="absolute inset-0 h-full w-full object-cover" />
      </div>

      {/* Etiquetas con fondo sólido */}
      <span className="absolute left-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
        Antes
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-brand px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-[#04201d] shadow-lg">
        Después
      </span>

      {/* Línea divisoria + handle */}
      <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%`, transform: "translateX(-50%)" }}>
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.4)]" />
        <div className="absolute top-1/2 left-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white bg-gradient-to-br from-brand to-brand-glow shadow-glow">
          <ChevronLeft className="h-4 w-4 -mr-1 text-[#04201d]" />
          <ChevronRight className="h-4 w-4 -ml-1 text-[#04201d]" />
        </div>
      </div>
    </div>
  );
}
