"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { addPetPhoto } from "@/lib/supabase/actions";

export function PhotoUpload({ petId }: { petId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("pet_id", petId);
    start(async () => {
      const res = await addPetPhoto(fd);
      if (!res.ok) return setError(res.error ?? "Error al subir.");
      router.refresh();
      setOpen(false);
      setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <ImagePlus className="h-4 w-4" />
        Subir foto
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Subir foto de evolución"
        description="La imagen se guarda en la galería de la mascota."
      >
        <form onSubmit={submit} className="space-y-4">
          <Field label="Imagen">
            <input
              ref={fileRef}
              type="file"
              name="file"
              accept="image/*"
              required
              onChange={onPick}
              className="block w-full text-sm text-muted file:mr-4 file:rounded-xl file:border-0 file:bg-brand/15 file:px-4 file:py-2.5 file:text-sm file:font-semibold file:text-brand dark:file:text-brand-glow hover:file:bg-brand/25"
            />
          </Field>

          {preview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Vista previa" className="max-h-56 w-full rounded-2xl object-cover" />
          )}

          <Field label="Descripción">
            <Input name="caption" placeholder="Evolución de la herida — día 3" />
          </Field>

          {error && <p className="text-sm font-medium text-accent">{error}</p>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Subir foto</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
