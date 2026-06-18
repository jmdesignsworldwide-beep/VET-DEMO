"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Pencil } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Form";
import { createOwner, updateOwner } from "@/lib/supabase/actions";
import type { Owner } from "@/lib/types";

function OwnerModal({
  open,
  onClose,
  owner,
}: {
  open: boolean;
  onClose: () => void;
  owner?: Owner;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    full_name: owner?.full_name ?? "",
    cedula: owner?.cedula ?? "",
    phone: owner?.phone ?? "",
    email: owner?.email ?? "",
    address: owner?.address ?? "",
    notes: owner?.notes ?? "",
  });

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setF((p) => ({ ...p, [k]: e.target.value }));

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = owner ? await updateOwner(owner.id, f) : await createOwner(f);
      if (!res.ok) return setError(res.error ?? "Error al guardar.");
      router.refresh();
      onClose();
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={owner ? "Editar dueño" : "Nuevo dueño"}
      description="Datos de contacto del propietario."
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Nombre completo">
          <Input value={f.full_name} onChange={set("full_name")} placeholder="Carlos Rodríguez" required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Cédula">
            <Input value={f.cedula} onChange={set("cedula")} placeholder="001-1234567-8" />
          </Field>
          <Field label="Teléfono">
            <Input value={f.phone} onChange={set("phone")} placeholder="809-555-0142" />
          </Field>
        </div>
        <Field label="Correo">
          <Input type="email" value={f.email} onChange={set("email")} placeholder="correo@gmail.com" />
        </Field>
        <Field label="Dirección">
          <Input value={f.address} onChange={set("address")} placeholder="C/ Duarte 45, Santiago" />
        </Field>
        <Field label="Notas">
          <Textarea value={f.notes} onChange={set("notes")} placeholder="Notas internas..." />
        </Field>

        {error && <p className="text-sm font-medium text-accent">{error}</p>}

        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button type="submit" loading={pending}>{owner ? "Guardar" : "Crear dueño"}</Button>
        </div>
      </form>
    </Modal>
  );
}

export function NewOwnerButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="h-4 w-4" />
        Nuevo dueño
      </Button>
      <OwnerModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}

export function EditOwnerButton({ owner }: { owner: Owner }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <Pencil className="h-4 w-4" />
        Editar
      </Button>
      <OwnerModal open={open} onClose={() => setOpen(false)} owner={owner} />
    </>
  );
}
