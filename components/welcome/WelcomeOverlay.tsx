"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { PawPrint } from "lucide-react";
import { cn } from "@/lib/utils";

const SEEN_KEY = "nido_welcome_seen";

/** Campo aurora opaco (se usa en cada hoja de la cortina). */
function AuroraField({ anchor }: { anchor: "top" | "bottom" }) {
  return (
    <div className={cn("absolute left-0 h-screen w-screen overflow-hidden bg-canvas", anchor === "top" ? "top-0" : "bottom-0")}>
      <div
        className="absolute -left-[10%] top-[-15%] h-[55vmax] w-[55vmax] animate-aurora-one rounded-full animate-breathe blur-[80px]"
        style={{ background: "radial-gradient(circle at center, rgb(var(--aurora-a) / var(--aurora-opacity)) 0%, transparent 60%)" }}
      />
      <div
        className="absolute -right-[15%] top-[12%] h-[50vmax] w-[50vmax] animate-aurora-two rounded-full animate-breathe blur-[80px]"
        style={{ background: "radial-gradient(circle at center, rgb(var(--aurora-b) / var(--aurora-opacity)) 0%, transparent 60%)" }}
      />
      <div
        className="absolute bottom-[-25%] left-1/2 h-[45vmax] w-[70vmax] -translate-x-1/2 animate-breathe rounded-full blur-[80px]"
        style={{ background: "radial-gradient(circle at center, rgb(var(--aurora-a) / calc(var(--aurora-opacity) * 0.6)) 0%, transparent 65%)" }}
      />
    </div>
  );
}

export function WelcomeOverlay({ name }: { name: string }) {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(false);
  const [out, setOut] = useState(false);

  // Solo una vez por sesión (se marca de inmediato para no repetir al navegar).
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(SEEN_KEY)) {
        sessionStorage.setItem(SEEN_KEY, "1");
        setShow(true);
      }
    } catch {
      // Si sessionStorage falla, no mostramos (nunca bloquear el acceso).
    }
  }, []);

  // Tiempos + a prueba de fallos: pase lo que pase, la cortina se retira.
  useEffect(() => {
    if (!show) return;
    const hold = reduce ? 600 : 2400;
    const exitDur = reduce ? 350 : 1150;
    const t1 = setTimeout(() => setOut(true), hold);
    const t2 = setTimeout(() => setShow(false), hold + exitDur);
    const failsafe = setTimeout(() => setShow(false), 6500); // tope absoluto
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(failsafe); };
  }, [show, reduce]);

  if (!show) return null;

  const shutterTransition = { duration: 0.85, ease: [0.83, 0, 0.17, 1] as const, delay: 0.2 };

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden role="presentation">
      {/* ── Cortina (dos hojas) ── */}
      {reduce ? (
        <motion.div className="absolute inset-0 bg-canvas" animate={out ? { opacity: 0 } : { opacity: 1 }} transition={{ duration: 0.35 }}>
          <AuroraField anchor="top" />
        </motion.div>
      ) : (
        <>
          <motion.div
            className="absolute inset-x-0 top-0 h-1/2 overflow-hidden"
            style={{ willChange: "transform" }}
            initial={{ y: 0 }}
            animate={out ? { y: "-100%" } : { y: 0 }}
            transition={shutterTransition}
          >
            <AuroraField anchor="top" />
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 h-1/2 overflow-hidden"
            style={{ willChange: "transform" }}
            initial={{ y: 0 }}
            animate={out ? { y: "100%" } : { y: 0 }}
            transition={shutterTransition}
          >
            <AuroraField anchor="bottom" />
          </motion.div>
          {/* Línea de luz en la unión */}
          <motion.div
            className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-brand-glow to-transparent"
            initial={{ opacity: 0, scaleX: 0.2 }}
            animate={out ? { opacity: [0.8, 0], scaleX: 1 } : { opacity: 0.7, scaleX: 1 }}
            transition={{ duration: 0.8 }}
          />
        </>
      )}

      {/* ── Contenido ── */}
      <motion.div
        className="absolute inset-0 grid place-items-center px-6"
        animate={out ? { opacity: 0, filter: "blur(10px)", scale: 0.97 } : { opacity: 1 }}
        transition={{ duration: 0.4 }}
      >
        <div className="relative flex flex-col items-center text-center">
          {/* Logo con anillos + glow */}
          <div className="relative mb-14 grid h-24 w-24 place-items-center sm:mb-16">
            <span className="absolute h-28 w-28 rounded-full bg-brand/25 blur-2xl animate-breathe" />
            {!reduce && (
              <>
                <span className="absolute h-20 w-20 rounded-full border border-brand/40 animate-pulse-ring" />
                <span className="absolute h-20 w-20 rounded-full border border-accent/30 animate-pulse-ring" style={{ animationDelay: "0.9s" }} />
              </>
            )}
            <motion.span
              initial={reduce ? false : { scale: 0, rotate: -25, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 16, delay: 0.1 }}
              className="relative grid h-20 w-20 place-items-center rounded-[1.4rem] bg-gradient-to-br from-brand to-brand-glow shadow-glow"
            >
              <PawPrint className="h-9 w-9 text-[#04201d]" strokeWidth={2.2} />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-accent ring-4 ring-canvas" />
            </motion.span>
          </div>

          <motion.p
            initial={reduce ? false : { opacity: 0, filter: "blur(10px)", y: 8 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.45 }}
            className="text-xs font-semibold uppercase tracking-[0.32em] text-muted"
          >
            Clínica Nido
          </motion.p>

          <motion.p
            initial={reduce ? false : { opacity: 0, filter: "blur(10px)", y: 10 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.7 }}
            className="mt-5 text-lg text-muted sm:text-xl"
          >
            Bienvenido de nuevo,
          </motion.p>

          <motion.h1
            initial={reduce ? false : { opacity: 0, filter: "blur(18px)", y: 14, scale: 0.95 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0, scale: 1 }}
            transition={{ duration: 1, delay: reduce ? 0 : 0.95, ease: [0.22, 1, 0.36, 1] }}
            className="text-gradient mt-1 font-display text-5xl font-bold tracking-tight sm:text-7xl"
          >
            {name}
          </motion.h1>
        </div>
      </motion.div>
    </div>
  );
}
