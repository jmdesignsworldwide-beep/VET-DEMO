"use client";

import Link from "next/link";
import { AlertTriangle, ArrowRight, type LucideIcon } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { cn } from "@/lib/utils";

export interface DetailField {
  label: string;
  value: string;
  full?: boolean;
  accent?: boolean;
}

/**
 * Panel de detalle premium y consistente para todo el sistema.
 * Reusa el Modal (portal + scroll). Cabecera opcional con avatar o ícono,
 * grilla de campos, nota, disclaimer y enlace de acción.
 */
export function DetailModal({
  open,
  onClose,
  title,
  subtitle,
  avatarName,
  icon: Icon,
  badge,
  badgeTone = "brand",
  fields,
  note,
  disclaimer,
  href,
  hrefLabel,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  avatarName?: string;
  icon?: LucideIcon;
  badge?: string;
  badgeTone?: "brand" | "accent" | "muted";
  fields?: DetailField[];
  note?: string;
  disclaimer?: string;
  href?: string;
  hrefLabel?: string;
  children?: React.ReactNode;
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={subtitle}>
      {(avatarName || Icon || badge) && (
        <div className="mb-4 flex items-center gap-3">
          {avatarName ? (
            <PetAvatar name={avatarName} size={44} />
          ) : Icon ? (
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand/15 text-brand dark:text-brand-glow">
              <Icon className="h-5 w-5" />
            </span>
          ) : null}
          {badge && (
            <span
              className={cn(
                "ml-auto rounded-full px-2.5 py-1 text-xs font-semibold capitalize",
                badgeTone === "accent" ? "bg-accent/15 text-accent"
                  : badgeTone === "muted" ? "bg-ink/[0.06] text-muted"
                  : "bg-brand/15 text-brand dark:text-brand-glow",
              )}
            >
              {badge.replace("_", " ")}
            </span>
          )}
        </div>
      )}

      {fields && fields.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {fields.map((f, i) => (
            <div key={i} className={cn("rounded-xl bg-ink/[0.03] p-3", f.full && "col-span-2")}>
              <p className="text-xs uppercase tracking-wider text-muted">{f.label}</p>
              <p className={cn("mt-0.5 font-semibold", f.accent && "text-brand dark:text-brand-glow")}>{f.value}</p>
            </div>
          ))}
        </div>
      )}

      {children}

      {note && <p className="mt-4 text-sm text-muted">{note}</p>}

      {disclaimer && (
        <div className="mt-4 flex items-start gap-2 rounded-xl bg-accent/10 p-3 text-xs text-accent">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {disclaimer}
        </div>
      )}

      {href && (
        <Link
          href={href}
          onClick={onClose}
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-glow text-sm font-semibold text-[#04201d] shadow-glow transition-transform active:scale-[0.99]"
        >
          {hrefLabel ?? "Ver más"} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </Modal>
  );
}
