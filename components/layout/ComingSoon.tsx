"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, type LucideIcon } from "lucide-react";

/** Estado premium "Próximamente" para módulos aún por poblar. */
export function ComingSoon({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="grid min-h-[60vh] place-items-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 18, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md overflow-hidden rounded-3xl glass-strong p-10 text-center shadow-lift"
      >
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-brand to-brand-glow shadow-glow">
          <Icon className="h-7 w-7 text-[#04201d]" />
        </span>

        <span className="mt-6 inline-block rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
          Próximamente
        </span>

        <h1 className="mt-4 font-display text-2xl font-bold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted">{description}</p>

        <Link
          href="/dashboard"
          className="mt-8 inline-flex items-center gap-2 rounded-xl glass px-4 py-2.5 text-sm font-medium transition-shadow hover:shadow-glow"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a la Sala de Mando
        </Link>
      </motion.div>
    </div>
  );
}
