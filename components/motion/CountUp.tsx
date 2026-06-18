"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useMotionValue,
  useReducedMotion,
  animate,
} from "framer-motion";

/**
 * Cuenta ascendente para KPIs y montos. Arranca al entrar en viewport.
 * Formatea con separadores de miles y respeta tabular-nums (clase .tnum).
 */
export function CountUp({
  to,
  duration = 1.6,
  prefix = "",
  suffix = "",
  decimals = 0,
  className,
}: {
  to: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const mv = useMotionValue(0);
  const [display, setDisplay] = useState("0");

  const format = (n: number) =>
    prefix +
    n.toLocaleString("es-DO", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }) +
    suffix;

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setDisplay(format(to));
      return;
    }
    const controls = animate(mv, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(format(v)),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to]);

  return (
    <span ref={ref} className={`tnum ${className ?? ""}`}>
      {display}
    </span>
  );
}
