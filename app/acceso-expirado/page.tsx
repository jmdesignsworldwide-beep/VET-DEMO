"use client";

import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, PawPrint } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function AccesoExpiradoPage() {
  // Asegura que la sesión quede cerrada.
  useEffect(() => {
    createClient().auth.signOut();
  }, []);

  return (
    <div className="relative flex min-h-dvh items-center justify-center px-4 py-10">
      <AuroraBackground />
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[440px]"
      >
        <div className="relative overflow-hidden rounded-3xl glass-strong p-8 text-center shadow-lift sm:p-10">
          <PawPrint className="absolute -right-6 -top-6 h-28 w-28 text-brand/10" />

          <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-accent/15 text-accent">
            <Clock className="h-8 w-8" />
          </span>

          <h1 className="mt-6 font-display text-2xl font-bold tracking-tight">Tu acceso ha expirado</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            El periodo de acceso a la demostración de <span className="font-semibold text-ink">Clínica Nido</span> ha
            finalizado. Contacta a <span className="font-semibold text-ink">JM Designs</span> para renovarlo y seguir
            disfrutando del sistema.
          </p>

          <Link
            href="/login"
            className="mt-8 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow px-5 text-sm font-semibold text-[#04201d] shadow-glow transition-transform active:scale-[0.99]"
          >
            Volver al inicio <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
