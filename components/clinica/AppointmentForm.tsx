"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CalendarPlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { createAppointment } from "@/lib/supabase/actions";
import type { PetWithOwner } from "@/lib/types";

const REASONS = [
  "Consulta general", "Vacunación", "Desparasitación", "Control post-operatorio",
  "Esterilización", "Curación", "Retiro de puntos", "Emergencia",
];

export function NewAppointmentButton({
  pets,
  defaultPetId,
  label = "Agendar cita",
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
    date: "",
    time: "",
    reason: REASONS[0],
    vet_name: "Dra. Polanco",
    price: "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!f.date || !f.time) return setError("Indica fecha y hora.");
    const scheduled_at = new Date(`${f.date}T${f.time}`).toISOString();
    start(async () => {
      const res = await createAppointment({
        pet_id: f.pet_id,
        scheduled_at,
        reason: f.reason,
        vet_name: f.vet_name,
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
        <CalendarPlus className="h-4 w-4" />
        {label}
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Agendar cita"
        description="La cita aparecerá en la agenda y en el dashboard."
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Mascota">
            <Select value={f.pet_id} onChange={set("pet_id")} required disabled={!!defaultPetId}>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {p.owner?.full_name}
                </option>
              ))}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Fecha">
              <Input type="date" value={f.date} onChange={set("date")} required />
            </Field>
            <Field label="Hora">
              <Input type="time" value={f.time} onChange={set("time")} required />
            </Field>
          </div>
          <Field label="Motivo">
            <Select value={f.reason} onChange={set("reason")}>
              {REASONS.map((r) => <option key={r}>{r}</option>)}
            </Select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Veterinario">
              <Select value={f.vet_name} onChange={set("vet_name")}>
                <option>Dra. Polanco</option>
                <option>Dr. Castillo</option>
              </Select>
            </Field>
            <Field label="Precio (RD$)">
              <Input type="number" value={f.price} onChange={set("price")} placeholder="1200" />
            </Field>
          </div>

          {error && <p className="text-sm font-medium text-accent">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Agendar</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
