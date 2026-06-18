"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PawPrint, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import { createPet, updatePet } from "@/lib/supabase/actions";
import type { Owner, Pet } from "@/lib/types";

const BREEDS = [
  "Pastor Alemán", "Sato dominicano", "Pitbull", "Poodle Toy", "Golden Retriever",
  "Schnauzer", "Chihuahua", "Labrador", "Husky Siberiano", "Boxer", "Beagle",
  "Bulldog Francés", "Yorkshire", "Otra",
];

function PetModal({
  open,
  onClose,
  owners,
  defaultOwnerId,
  pet,
}: {
  open: boolean;
  onClose: () => void;
  owners?: Owner[];
  defaultOwnerId?: string;
  pet?: Pet;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    owner_id: pet?.owner_id ?? defaultOwnerId ?? owners?.[0]?.id ?? "",
    name: pet?.name ?? "",
    species: pet?.species ?? "Perro",
    breed: pet?.breed ?? "",
    sex: pet?.sex ?? "Macho",
    birthdate: pet?.birthdate ?? "",
    weight_kg: pet?.weight_kg?.toString() ?? "",
    color: pet?.color ?? "",
    allergies: pet?.allergies ?? "",
    microchip: pet?.microchip ?? "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const payload = {
      ...f,
      weight_kg: f.weight_kg ? Number(f.weight_kg) : undefined,
      birthdate: f.birthdate || undefined,
    };
    start(async () => {
      const res = pet
        ? await updatePet(pet.id, payload)
        : await createPet(payload);
      if (!res.ok) return setError(res.error ?? "Error al guardar.");
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={pet ? "Editar mascota" : "Nueva mascota"}
      description="Ficha técnica de la mascota."
    >
      <form onSubmit={submit} className="space-y-4">
        {!pet && owners && !defaultOwnerId && (
          <Field label="Dueño">
            <Select value={f.owner_id} onChange={set("owner_id")} required>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>{o.full_name}</option>
              ))}
            </Select>
          </Field>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nombre">
            <Input value={f.name} onChange={set("name")} placeholder="Max" required />
          </Field>
          <Field label="Especie">
            <Select value={f.species} onChange={set("species")}>
              <option>Perro</option>
              <option>Gato</option>
              <option>Otra</option>
            </Select>
          </Field>
          <Field label="Raza">
            <Select value={f.breed} onChange={set("breed")}>
              <option value="">Seleccionar…</option>
              {BREEDS.map((b) => <option key={b}>{b}</option>)}
            </Select>
          </Field>
          <Field label="Sexo">
            <Select value={f.sex} onChange={set("sex")}>
              <option>Macho</option>
              <option>Hembra</option>
            </Select>
          </Field>
          <Field label="Fecha de nacimiento">
            <Input type="date" value={f.birthdate} onChange={set("birthdate")} />
          </Field>
          <Field label="Peso (kg)">
            <Input type="number" step="0.1" value={f.weight_kg} onChange={set("weight_kg")} placeholder="12.5" />
          </Field>
          <Field label="Color">
            <Input value={f.color} onChange={set("color")} placeholder="Negro y fuego" />
          </Field>
          <Field label="Microchip">
            <Input value={f.microchip} onChange={set("microchip")} placeholder="729000…" />
          </Field>
        </div>
        <Field label="Alergias">
          <Textarea value={f.allergies} onChange={set("allergies")} placeholder="Ninguna conocida" />
        </Field>

        {error && <p className="text-sm font-medium text-accent">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={pending}>{pet ? "Guardar" : "Crear mascota"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function NewPetButton({
  owners,
  defaultOwnerId,
  label = "Nueva mascota",
}: {
  owners?: Owner[];
  defaultOwnerId?: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant={defaultOwnerId ? "ghost" : "primary"} onClick={() => setOpen(true)}>
        <PawPrint className="h-4 w-4" />
        {label}
      </Button>
      <PetModal open={open} onClose={() => setOpen(false)} owners={owners} defaultOwnerId={defaultOwnerId} />
    </>
  );
}

export function EditPetButton({ pet }: { pet: Pet }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar ficha
      </Button>
      <PetModal open={open} onClose={() => setOpen(false)} pet={pet} />
    </>
  );
}
