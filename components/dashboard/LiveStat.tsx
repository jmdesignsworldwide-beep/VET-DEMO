"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowUpRight, type LucideIcon } from "lucide-react";
import { CountUp } from "@/components/motion/CountUp";
import { Magnetic } from "@/components/motion/Magnetic";
import { cn } from "@/lib/utils";

/** Tarjeta-indicador "viva" de la Sala de Mando. El número puede respirar. */
export function LiveStat({
  icon: Icon,
  label,
  value,
  prefix,
  suffix,
  tone = "brand",
  breathing = false,
  href,
  children,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  tone?: "brand" | "accent";
  breathing?: boolean;
  href: string;
  children?: React.ReactNode;
}) {
  const reduce = useReducedMotion();
  const toneText = tone === "brand" ? "text-brand dark:text-brand-glow" : "text-accent";
  const toneBg = tone === "brand" ? "bg-brand/15" : "bg-accent/15";

  return (
    <Magnetic strength={0.16}>
      <Link
        href={href}
        className="group block h-full focus-visible:outline-none focus-visible:ring-focus rounded-3xl"
      >
        <div className="relative h-full overflow-hidden rounded-3xl glass p-5 shadow-glass transition-shadow duration-300 group-hover:shadow-glow before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-b before:from-white/[0.06] before:to-transparent">
          <div className="flex items-center justify-between">
            <span className={cn("grid h-11 w-11 place-items-center rounded-2xl", toneBg, toneText)}>
              <Icon className="h-5 w-5" />
            </span>
            <ArrowUpRight className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </div>

          <p className="mt-4 text-sm text-muted">{label}</p>

          <motion.p
            className="mt-0.5 font-display text-[2rem] font-bold leading-none tracking-tight"
            animate={
              breathing && !reduce
                ? { scale: [1, 1.025, 1], opacity: [1, 0.92, 1] }
                : undefined
            }
            transition={{ duration: 4, ease: "easeInOut", repeat: Infinity }}
          >
            <CountUp to={value} prefix={prefix} suffix={suffix} />
          </motion.p>

          {children && <div className="mt-4">{children}</div>}
        </div>
      </Link>
    </Magnetic>
  );
}
