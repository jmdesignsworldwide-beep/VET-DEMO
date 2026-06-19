"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Send, Heart, PawPrint, Mail } from "lucide-react";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { fmtDate, publicPhotoUrl } from "@/lib/format";
import type { DailyReport } from "@/lib/types";

export function PostcardButton({
  report,
  petName,
  ownerName,
}: {
  report: DailyReport;
  petName: string;
  ownerName: string;
}) {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  const overlay = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          style={{ perspective: 1000 }}
        >
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, y: 30, rotateX: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 280, damping: 26 }}
            className="relative z-10 max-h-[90dvh] w-full max-w-md overflow-y-auto overscroll-contain rounded-[28px] bg-elevated shadow-lift"
          >
              <button
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50"
              >
                <X className="h-4 w-4" />
              </button>

              {/* Foto / cabecera ilustrada */}
              <div className="relative h-44 overflow-hidden">
                {report.photo_path ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={publicPhotoUrl(report.photo_path)} alt={petName} className="h-full w-full object-cover" />
                ) : (
                  <div className="relative h-full w-full bg-gradient-to-br from-brand via-brand-glow to-accent">
                    <PawPrint className="absolute -right-4 -top-4 h-32 w-32 text-white/15" />
                    <PawPrint className="absolute bottom-2 left-6 h-12 w-12 text-white/20" />
                    <div className="absolute inset-0 grid place-items-center">
                      <PetAvatar name={petName} size={84} />
                    </div>
                  </div>
                )}
                {/* Sello postal */}
                <div className="absolute right-4 top-4 rotate-6 rounded-lg border-2 border-dashed border-white/70 bg-white/15 px-2 py-1 text-center backdrop-blur-sm">
                  <PawPrint className="mx-auto h-4 w-4 text-white" />
                  <p className="text-[8px] font-bold uppercase tracking-wider text-white">Nido</p>
                </div>
              </div>

              {/* Cuerpo */}
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                    Reporte del día · {fmtDate(report.report_date)}
                  </p>
                  <Heart className="h-4 w-4 text-accent" />
                </div>

                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-ink">
                  Un saludo de {petName} 🐾
                </h2>
                <p className="mt-1 text-sm text-muted">Para {ownerName}</p>

                <span className="mt-4 inline-block rounded-full bg-brand/15 px-3 py-1 text-sm font-semibold text-brand dark:text-brand-glow">
                  {report.mood}
                </span>

                <p className="mt-4 text-[15px] italic leading-relaxed text-ink">
                  “{report.message}”
                </p>

                {report.activities.length > 0 && (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                      Actividades de hoy
                    </p>
                    <ul className="grid grid-cols-1 gap-1.5">
                      {report.activities.map((a, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-ink">
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-brand/15 text-brand dark:text-brand-glow">
                            <Check className="h-3 w-3" />
                          </span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Enviar por WhatsApp (simulado) */}
                <button
                  onClick={() => setSent(true)}
                  disabled={sent}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] font-semibold text-white shadow-lg transition-transform active:scale-[0.98] disabled:opacity-80"
                >
                  {sent ? <><Check className="h-5 w-5" /> Enviado al dueño</> : <><Send className="h-4 w-4" /> Enviar por WhatsApp</>}
                </button>

                <Disclaimer variant="whatsapp" className="mt-3" />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-accent/15 px-3 py-2 text-sm font-semibold text-accent transition-shadow hover:shadow-glow-accent"
      >
        <Mail className="h-4 w-4" /> Tarjeta postal
      </button>
      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
