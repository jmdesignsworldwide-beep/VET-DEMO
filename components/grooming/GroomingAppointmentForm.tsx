"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Scissors } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { createGroomingAppointment } from "@/lib/supabase/actions";
import type { PetWithOwner } from "@/lib/types";

export const GROOMING_SERVICES = [
  "Baño", "Corte higiénico", "Corte de raza (Poodle)", "Corte de raza (Schnauzer)",
  "Deslanado", "Baño y cepillado", "Baño + corte completo", "Corte de uñas",
];

export function NewGroomingAppointmentButton({
  pets,
  defaultPetId,
  label = "Agendar grooming",
}: {
  pets: PetWithOwner[];
  defaultPetId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    pet_id: defaultPetId ?? pets[0]?.id ?? "",
    date: "", time: "", service: GROOMING_SERVICES[0], groomer: "Yardel", price: "1000",
  });
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.date || !f.time) return setError("Indica fecha y hora.");
    const scheduled_at = new Date(`${f.date}T${f.time}`).toISOString();
    start(async () => {
      const res = await createGroomingAppointment({
        pet_id: f.pet_id, scheduled_at, service: f.service, groomer: f.groomer,
        price: f.price ? Number(f.price) : undefined,
      });
      if (!res.ok) return setError(res.error ?? "Error al agendar.");
      router.refresh();
      setOpen(false);
      setF((p) => ({ ...p, date: "", time: "" }));
    });
  }

  return (
    <>
      <Button variant={defaultPetId ? "ghost" : "primary"} onClick={() => setOpen(true)}>
        <Scissors className="h-4 w-4" /> {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Agendar grooming" description="La cita aparece en la agenda y en la línea de tiempo.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Mascota">
            <Select value={f.pet_id} onChange={set("pet_id")} disabled={!!defaultPetId} required>
              {pets.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.owner?.full_name}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha"><Input type="date" value={f.date} onChange={set("date")} required /></Field>
            <Field label="Hora"><Input type="time" value={f.time} onChange={set("time")} required /></Field>
          </div>
          <Field label="Servicio">
            <Select value={f.service} onChange={set("service")}>
              {GROOMING_SERVICES.map((s) => <option key={s}>{s}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Groomer">
              <Select value={f.groomer} onChange={set("groomer")}>
                <option>Yardel</option><option>Massiel</option>
              </Select>
            </Field>
            <Field label="Precio (RD$)"><Input type="number" value={f.price} onChange={set("price")} placeholder="1000" /></Field>
          </div>
          {error && <p className="text-sm font-medium text-accent">{error}</p>}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Agendar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
