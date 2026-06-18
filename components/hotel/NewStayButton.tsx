"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BedDouble, Check, Ban } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Form";
import { createStay } from "@/lib/supabase/actions";
import { nights, rangesOverlap } from "@/lib/hotel";
import { rd } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { PetWithOwner, Room, StayFull } from "@/lib/types";

export function NewStayButton({
  pets,
  rooms,
  stays,
  defaultPetId,
  label = "Nueva reserva",
}: {
  pets: PetWithOwner[];
  rooms: Room[];
  stays: StayFull[];
  defaultPetId?: string;
  label?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [petId, setPetId] = useState(defaultPetId ?? pets[0]?.id ?? "");
  const [ci, setCi] = useState("");
  const [co, setCo] = useState("");
  const [roomId, setRoomId] = useState("");

  const validRange = ci && co && co > ci;

  // Disponibilidad en tiempo real para el rango elegido.
  const availability = useMemo(() => {
    if (!validRange) return {} as Record<string, boolean>;
    const map: Record<string, boolean> = {};
    for (const r of rooms) {
      const busy = stays.some(
        (s) =>
          s.room_id === r.id &&
          (s.status === "reservada" || s.status === "en_curso") &&
          rangesOverlap(ci, co, s.check_in, s.check_out),
      );
      map[r.id] = r.status === "disponible" && !busy;
    }
    return map;
  }, [validRange, ci, co, rooms, stays]);

  const selectedRoom = rooms.find((r) => r.id === roomId);
  const total = selectedRoom && validRange ? nights(ci, co) * selectedRoom.price_per_night : 0;
  const freeCount = Object.values(availability).filter(Boolean).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!roomId) return setError("Selecciona una habitación disponible.");
    start(async () => {
      const res = await createStay({ pet_id: petId, room_id: roomId, check_in: ci, check_out: co });
      if (!res.ok) return setError(res.error ?? "Error al reservar.");
      router.refresh();
      setOpen(false);
      setCi(""); setCo(""); setRoomId("");
    });
  }

  return (
    <>
      <Button variant={defaultPetId ? "ghost" : "primary"} onClick={() => setOpen(true)}>
        <BedDouble className="h-4 w-4" /> {label}
      </Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Nueva reserva de estadía" description="Elige fechas y mira la disponibilidad en tiempo real.">
        <form onSubmit={submit} className="space-y-4">
          <Field label="Mascota">
            <Select value={petId} onChange={(e) => setPetId(e.target.value)} disabled={!!defaultPetId} required>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>{p.name} · {p.owner?.full_name}</option>
              ))}
            </Select>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Entrada">
              <Input type="date" value={ci} onChange={(e) => { setCi(e.target.value); setRoomId(""); }} required />
            </Field>
            <Field label="Salida">
              <Input type="date" value={co} onChange={(e) => { setCo(e.target.value); setRoomId(""); }} required />
            </Field>
          </div>

          {!validRange ? (
            <p className="rounded-xl bg-ink/[0.03] p-3 text-center text-sm text-muted">
              Elige fechas válidas para ver la disponibilidad.
            </p>
          ) : (
            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted">Habitaciones</span>
                <span className="text-xs text-muted">{freeCount} disponibles · {nights(ci, co)} noche(s)</span>
              </div>
              <div className="grid max-h-56 grid-cols-1 gap-2 overflow-y-auto pr-1">
                {rooms.map((r) => {
                  const free = availability[r.id];
                  const active = roomId === r.id;
                  return (
                    <button
                      type="button"
                      key={r.id}
                      disabled={!free}
                      onClick={() => setRoomId(r.id)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left transition-colors",
                        active ? "border-brand/50 bg-brand/10" : "border-hairline/15 bg-ink/[0.02]",
                        !free && "cursor-not-allowed opacity-50",
                      )}
                    >
                      <span className={cn("grid h-8 w-8 place-items-center rounded-lg", free ? "bg-brand/15 text-brand dark:text-brand-glow" : "bg-ink/[0.06] text-muted")}>
                        {free ? <Check className="h-4 w-4" /> : <Ban className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{r.name}</p>
                        <p className="text-xs text-muted">{r.type} · {rd(r.price_per_night)}/noche</p>
                      </div>
                      {!free && <span className="text-xs font-medium text-muted">Ocupada</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedRoom && (
            <div className="flex items-center justify-between rounded-xl bg-brand/10 px-4 py-3">
              <span className="text-sm font-medium">Total estimado</span>
              <span className="font-display text-lg font-bold text-brand dark:text-brand-glow tabular-nums">{rd(total)}</span>
            </div>
          )}

          {error && <p className="text-sm font-medium text-accent">{error}</p>}

          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" loading={pending} disabled={!roomId}>Confirmar reserva</Button>
          </div>
        </form>
      </Modal>
    </>
  );
}
