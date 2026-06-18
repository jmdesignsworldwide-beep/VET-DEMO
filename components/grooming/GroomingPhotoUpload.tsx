"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input } from "@/components/ui/Form";
import { addGroomingPhotos } from "@/lib/supabase/actions";

export function GroomingPhotoUpload({ petId, label = "Subir antes/después" }: { petId: string; label?: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [pBefore, setPBefore] = useState<string | null>(null);
  const [pAfter, setPAfter] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("pet_id", petId);
    start(async () => {
      const res = await addGroomingPhotos(fd);
      if (!res.ok) return setError(res.error ?? "Error al subir.");
      router.refresh();
      setOpen(false);
      setPBefore(null); setPAfter(null);
      formRef.current?.reset();
    });
  }

  return (
    <>
      <Button variant="ghost" onClick={() => setOpen(true)}>
        <ImagePlus className="h-4 w-4" /> {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Antes y después" description="Sube ambas fotos para crear la transformación deslizable.">
        <form ref={formRef} onSubmit={submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <PhotoPicker name="before" tag="Antes" preview={pBefore} onPick={setPBefore} />
            <PhotoPicker name="after" tag="Después" preview={pAfter} onPick={setPAfter} />
          </div>
          <Field label="Servicio">
            <Input name="service_label" placeholder="Corte de raza, baño…" />
          </Field>
          <Field label="Descripción">
            <Input name="caption" placeholder="¡Quedó hermoso!" />
          </Field>

          {error && <p className="text-sm font-medium text-accent">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending}>Crear transformación</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}

function PhotoPicker({ name, tag, preview, onPick }: { name: string; tag: string; preview: string | null; onPick: (v: string | null) => void }) {
  return (
    <label className="block cursor-pointer">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-muted">{tag}</span>
      <div className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-dashed border-hairline/20 bg-ink/[0.03]">
        {preview ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={preview} alt={tag} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="text-xs text-muted">Tocar para elegir</span>
        )}
      </div>
      <input
        type="file"
        name={name}
        accept="image/*"
        required
        onChange={(e) => onPick(e.target.files?.[0] ? URL.createObjectURL(e.target.files[0]) : null)}
        className="sr-only"
      />
    </label>
  );
}
