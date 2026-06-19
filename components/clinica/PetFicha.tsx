"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Clock, Stethoscope, Syringe, HeartPulse, FileText,
  Images, User, ChevronDown, FileDown, BedDouble, Scissors, Sparkles,
} from "lucide-react";
import { Disclaimer } from "@/components/shared/Disclaimer";
import { nights } from "@/lib/hotel";
import { BeforeAfterSlider } from "@/components/grooming/BeforeAfterSlider";
import { GroomingPhotoUpload } from "@/components/grooming/GroomingPhotoUpload";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { Timeline } from "./Timeline";
import { EditPetButton } from "./PetForm";
import { NewAppointmentButton } from "./AppointmentForm";
import { PhotoUpload } from "./PhotoUpload";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { rd, fmtDate, fmtDateTime, age, publicPhotoUrl } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PetFull } from "@/lib/supabase/queries";
import type { PetWithOwner } from "@/lib/types";

const TABS = [
  { key: "resumen", label: "Resumen", icon: User },
  { key: "timeline", label: "Línea de tiempo", icon: Clock },
  { key: "historia", label: "Historia clínica", icon: Stethoscope },
  { key: "vacunas", label: "Vacunas", icon: Syringe },
  { key: "hospital", label: "Hospitalización", icon: HeartPulse },
  { key: "hotel", label: "Estadías", icon: BedDouble },
  { key: "peluqueria", label: "Peluquería", icon: Scissors },
  { key: "recetas", label: "Recetas", icon: FileText },
  { key: "fotos", label: "Fotos", icon: Images },
] as const;

export function PetFicha({ pet }: { pet: PetFull }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["key"]>("resumen");
  const petWithOwner: PetWithOwner = pet;

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/clientes" className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Clientes y mascotas
      </Link>

      {/* Hero */}
      <GlassCard className="overflow-hidden">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <PetAvatar name={pet.name} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-3xl font-bold tracking-tight">{pet.name}</h1>
              <span className="rounded-full bg-brand/15 px-2.5 py-1 text-xs font-semibold text-brand dark:text-brand-glow">
                {pet.species}
              </span>
            </div>
            <p className="mt-1 text-muted">
              {pet.breed ?? "Raza N/D"} · {age(pet.birthdate)} · {pet.sex ?? "—"}
            </p>
            <Link
              href={`/clientes/${pet.owner.id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-opacity hover:opacity-80"
            >
              <User className="h-3.5 w-3.5" /> {pet.owner.full_name}
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
            <NewAppointmentButton pets={[petWithOwner]} defaultPetId={pet.id} label="Cita" />
            <EditPetButton pet={pet} />
          </div>
        </div>
      </GlassCard>

      {/* Tabs — fluyen en varias filas, todas visibles sin scroll */}
      <div className="mt-5 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors",
                active ? "text-ink" : "bg-ink/[0.04] text-muted hover:text-ink",
              )}
            >
              {active && (
                <motion.span layoutId="ficha-tab" className="absolute inset-0 rounded-xl glass shadow-glow" transition={{ type: "spring", stiffness: 380, damping: 32 }} />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenido */}
      <div className="mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {tab === "resumen" && <Resumen pet={pet} />}
            {tab === "timeline" && (
              <GlassCard><Timeline events={pet.events} /></GlassCard>
            )}
            {tab === "historia" && <Historia pet={pet} />}
            {tab === "vacunas" && <Vacunas pet={pet} />}
            {tab === "hospital" && <Hospital pet={pet} />}
            {tab === "hotel" && <Estadias pet={pet} />}
            {tab === "peluqueria" && <Peluqueria pet={pet} />}
            {tab === "recetas" && <Recetas pet={pet} />}
            {tab === "fotos" && <Fotos pet={pet} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-ink/[0.03] p-4">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}

function Resumen({ pet }: { pet: PetFull }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      <Stat label="Especie" value={pet.species} />
      <Stat label="Raza" value={pet.breed ?? "—"} />
      <Stat label="Edad" value={age(pet.birthdate)} />
      <Stat label="Peso" value={pet.weight_kg ? `${pet.weight_kg} kg` : "—"} />
      <Stat label="Color" value={pet.color ?? "—"} />
      <Stat label="Sexo" value={pet.sex ?? "—"} />
      <Stat label="Microchip" value={pet.microchip ?? "—"} />
      <Stat label="Nacimiento" value={fmtDate(pet.birthdate)} />
      <div className="col-span-2 rounded-2xl bg-accent/10 p-4 sm:col-span-1">
        <p className="text-xs uppercase tracking-wider text-accent">Alergias</p>
        <p className="mt-1 font-semibold">{pet.allergies ?? "Ninguna conocida"}</p>
      </div>
    </div>
  );
}

function Historia({ pet }: { pet: PetFull }) {
  const [open, setOpen] = useState<string | null>(null);
  if (pet.records.length === 0)
    return <Empty text="Sin entradas en la historia clínica." />;
  return (
    <div className="space-y-3">
      {pet.records.map((r) => {
        const isOpen = open === r.id;
        return (
          <GlassCard key={r.id} className="p-0">
            <button onClick={() => setOpen(isOpen ? null : r.id)} className="flex w-full items-center gap-3 p-4 text-left">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand dark:text-brand-glow">
                <Stethoscope className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{r.title}</p>
                <p className="text-xs text-muted">{fmtDate(r.occurred_at)} · {r.vet_name ?? "—"}</p>
              </div>
              {r.price != null && <span className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(r.price)}</span>}
              <ChevronDown className={cn("h-4 w-4 text-muted transition-transform", isOpen && "rotate-180")} />
            </button>
            <AnimatePresence>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="space-y-2 px-4 pb-4 text-sm">
                    {r.description && <p><span className="text-muted">Descripción: </span>{r.description}</p>}
                    {r.diagnosis && <p><span className="text-muted">Diagnóstico: </span>{r.diagnosis}</p>}
                    {r.treatment && <p><span className="text-muted">Tratamiento: </span>{r.treatment}</p>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>
        );
      })}
      <Disclaimer variant="pdf" inline className="pt-2" />
    </div>
  );
}

function Vacunas({ pet }: { pet: PetFull }) {
  if (pet.vaccinations.length === 0) return <Empty text="Sin vacunas registradas." />;
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {pet.vaccinations.map((v) => (
        <GlassCard key={v.id} className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/15 text-brand dark:text-brand-glow">
            <Syringe className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{v.vaccine}</p>
            <p className="text-xs text-muted">Aplicada {fmtDate(v.applied_at)} · Próxima {fmtDate(v.next_due)}</p>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function Hospital({ pet }: { pet: PetFull }) {
  if (pet.hospitalizations.length === 0) return <Empty text="Sin hospitalizaciones." />;
  return (
    <div className="space-y-3">
      {pet.hospitalizations.map((h) => {
        const active = !h.discharged_at;
        return (
          <GlassCard key={h.id} glow={active}>
            <div className="flex items-center justify-between gap-3">
              <p className="font-semibold">{h.reason}</p>
              <span className={cn("rounded-full px-2.5 py-1 text-xs font-semibold", active ? "bg-accent/15 text-accent" : "bg-ink/[0.06] text-muted")}>
                {active ? h.status : "Dada de alta"}
              </span>
            </div>
            {h.treatment && <p className="mt-2 text-sm text-muted">{h.treatment}</p>}
            <p className="mt-2 text-xs text-muted">Ingreso {fmtDateTime(h.admitted_at)}{h.discharged_at && ` · Alta ${fmtDateTime(h.discharged_at)}`}</p>
          </GlassCard>
        );
      })}
    </div>
  );
}

function Estadias({ pet }: { pet: PetFull }) {
  if (pet.stays.length === 0) return <Empty text="Sin estadías en el hotel." />;
  const tone = (s: string) =>
    s === "en_curso" ? "bg-accent/15 text-accent"
    : s === "reservada" ? "bg-brand/15 text-brand dark:text-brand-glow"
    : "bg-ink/[0.06] text-muted";
  return (
    <div className="space-y-3">
      {pet.stays.map((s) => (
        <GlassCard key={s.id} glow={s.status === "en_curso"} className="flex items-center gap-4">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/15 text-accent">
            <BedDouble className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold">{s.room?.name} · {s.room?.type}</p>
            <p className="text-xs text-muted">{fmtDate(s.check_in)} → {fmtDate(s.check_out)} · {nights(s.check_in, s.check_out)} noche(s)</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(nights(s.check_in, s.check_out) * s.price_per_night)}</p>
            <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", tone(s.status))}>{s.status.replace("_", " ")}</span>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

function Peluqueria({ pet }: { pet: PetFull }) {
  const pref = pet.groomingPref;
  return (
    <div className="space-y-5">
      {/* Preferencias de corte */}
      <GlassCard>
        <div className="mb-3 flex items-center gap-2">
          <Scissors className="h-4 w-4 text-brand dark:text-brand-glow" />
          <h3 className="font-display font-semibold">Preferencias de corte</h3>
        </div>
        {pref ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Tipo de corte" value={pref.cut_type ?? "—"} />
            <Stat label="Productos" value={pref.products ?? "—"} />
            <Stat label="Frecuencia" value={pref.frequency_weeks ? `${pref.frequency_weeks} semanas` : "—"} />
            <Stat label="Groomer" value={pref.groomer_pref ?? "—"} />
            <div className="col-span-2 rounded-2xl bg-ink/[0.03] p-4">
              <p className="text-xs uppercase tracking-wider text-muted">Notas del groomer</p>
              <p className="mt-1 font-semibold">{pref.notes ?? "—"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted">Sin preferencias registradas.</p>
        )}
      </GlassCard>

      {/* Antes / Después */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-display font-semibold">Transformaciones</h3>
        </div>
        <GroomingPhotoUpload petId={pet.id} label="Subir antes/después" />
      </div>
      {pet.groomingPhotos.length === 0 ? (
        <Empty text="Aún no hay fotos antes/después. Sube la primera." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {pet.groomingPhotos.map((p) => (
            <GlassCard key={p.id}>
              <BeforeAfterSlider before={p.before_path} after={p.after_path} alt={pet.name} />
              {(p.service_label || p.caption) && (
                <p className="mt-3 text-center text-sm text-muted">{p.service_label}{p.caption ? ` · ${p.caption}` : ""}</p>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Historial de servicios */}
      {pet.groomingServices.length > 0 && (
        <div>
          <h3 className="mb-3 font-display font-semibold">Historial de servicios</h3>
          <div className="space-y-3">
            {pet.groomingServices.map((s) => (
              <GlassCard key={s.id} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand/15 text-brand dark:text-brand-glow">
                  <Scissors className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{s.service}</p>
                  <p className="text-xs text-muted">{fmtDate(s.performed_at)} · {s.groomer ?? "—"}</p>
                </div>
                {s.price != null && <span className="text-sm font-semibold tabular-nums text-brand dark:text-brand-glow">{rd(s.price)}</span>}
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Recetas({ pet }: { pet: PetFull }) {
  if (pet.prescriptions.length === 0) return <Empty text="Sin recetas registradas." />;

  function generatePDF(petName: string, vet: string, issued: string, items: { medication: string; dose: string; frequency: string; duration: string }[], instructions: string | null) {
    const rows = items.map((it) => `<tr><td>${it.medication}</td><td>${it.dose}</td><td>${it.frequency}</td><td>${it.duration}</td></tr>`).join("");
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Receta ${petName}</title>
      <style>body{font-family:system-ui,sans-serif;padding:40px;color:#0A0F1A}h1{color:#14B8A6;margin:0}
      .head{display:flex;justify-content:space-between;border-bottom:2px solid #14B8A6;padding-bottom:12px}
      table{width:100%;border-collapse:collapse;margin-top:20px}td,th{border:1px solid #ddd;padding:10px;text-align:left;font-size:14px}
      th{background:#f0fdfa}.disc{margin-top:30px;padding:14px;border:1px dashed #FB7185;border-radius:10px;background:#fff1f2;color:#9f1239;font-size:13px}</style></head>
      <body><div class="head"><div><h1>🐾 Clínica Nido</h1><small>Veterinaria · Hotel · Peluquería</small></div>
      <div style="text-align:right"><strong>Receta</strong><br><small>${issued}</small></div></div>
      <p><strong>Paciente:</strong> ${petName}<br><strong>Veterinario:</strong> ${vet}</p>
      <table><tr><th>Medicamento</th><th>Dosis</th><th>Frecuencia</th><th>Duración</th></tr>${rows}</table>
      ${instructions ? `<p style="margin-top:16px"><strong>Indicaciones:</strong> ${instructions}</p>` : ""}
      <div class="disc">⚠️ Documento de ejemplo generado para demostración. No constituye documento veterinario válido.</div>
      <script>window.onload=()=>window.print()</script></body></html>`;
    const w = window.open("", "_blank");
    if (w) { w.document.write(html); w.document.close(); }
  }

  return (
    <div className="space-y-4">
      <Disclaimer variant="pdf" />
      {pet.prescriptions.map((p) => (
        <GlassCard key={p.id}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Receta · {fmtDate(p.issued_at)}</p>
              <p className="text-xs text-muted">{p.vet_name}</p>
            </div>
            <Button variant="ghost" onClick={() => generatePDF(pet.name, p.vet_name, fmtDate(p.issued_at), p.items, p.instructions)}>
              <FileDown className="h-4 w-4" /> Generar PDF
            </Button>
          </div>
          <ul className="mt-3 space-y-1.5">
            {p.items.map((it, i) => (
              <li key={i} className="flex items-center gap-2 rounded-lg bg-ink/[0.03] px-3 py-2 text-sm">
                <span className="font-medium">{it.medication}</span>
                <span className="text-muted">· {it.dose} · {it.frequency} · {it.duration}</span>
              </li>
            ))}
          </ul>
          {p.instructions && <p className="mt-3 text-sm text-muted">{p.instructions}</p>}
        </GlassCard>
      ))}
    </div>
  );
}

function Fotos({ pet }: { pet: PetFull }) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted">{pet.photos.length} foto(s) de evolución</p>
        <PhotoUpload petId={pet.id} />
      </div>
      {pet.photos.length === 0 ? (
        <Empty text="Aún no hay fotos. Sube la primera." />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {pet.photos.map((ph) => (
            <figure key={ph.id} className="group relative overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={publicPhotoUrl(ph.storage_path)} alt={ph.caption ?? pet.name} className="aspect-square w-full object-cover" />
              {ph.caption && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-black/60 p-2 text-xs text-white backdrop-blur-sm">
                  {ph.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="py-8 text-center text-sm text-muted">{text}</p>;
}
