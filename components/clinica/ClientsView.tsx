"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Phone, IdCard, ChevronRight } from "lucide-react";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { Stagger, Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { Magnetic } from "@/components/motion/Magnetic";
import { NewOwnerButton } from "./OwnerForm";
import { NewPetButton } from "./PetForm";
import { Input } from "@/components/ui/Form";
import type { Owner, OwnerWithPets } from "@/lib/types";

export function ClientsView({
  owners,
  ownersList,
}: {
  owners: OwnerWithPets[];
  ownersList: Owner[];
}) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const filtered = term
    ? owners.filter(
        (o) =>
          o.full_name.toLowerCase().includes(term) ||
          (o.cedula ?? "").toLowerCase().includes(term) ||
          (o.phone ?? "").includes(term) ||
          o.pets.some((p) => p.name.toLowerCase().includes(term)),
      )
    : owners;

  return (
    <div className="mx-auto max-w-6xl">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Clientes y <span className="text-gradient">mascotas</span>
          </h1>
          <p className="mt-1 text-sm text-muted">
            {owners.length} dueños · {owners.reduce((n, o) => n + o.pets.length, 0)} mascotas
          </p>
        </div>
        <div className="flex gap-2">
          <NewPetButton owners={ownersList} />
          <NewOwnerButton />
        </div>
      </div>

      {/* Buscador */}
      <div className="relative mb-6">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar por dueño, cédula, teléfono o mascota…"
          className="h-12 pl-11"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-muted">Sin resultados para “{q}”.</p>
      ) : (
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filtered.map((o) => (
            <Reveal key={o.id}>
              <Magnetic strength={0.1}>
                <GlassCard className="h-full">
                  <Link href={`/clientes/${o.id}`} className="group flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-display text-lg font-semibold">{o.full_name}</p>
                      <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
                        {o.cedula && <span className="inline-flex items-center gap-1"><IdCard className="h-3.5 w-3.5" />{o.cedula}</span>}
                        {o.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{o.phone}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" />
                  </Link>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {o.pets.length === 0 && <span className="text-xs text-muted">Sin mascotas</span>}
                    {o.pets.map((p) => (
                      <Link
                        key={p.id}
                        href={`/mascotas/${p.id}`}
                        className="flex items-center gap-2 rounded-full bg-ink/[0.04] py-1 pl-1 pr-3 transition-colors hover:bg-ink/[0.08]"
                      >
                        <PetAvatar name={p.name} size={26} ring={false} />
                        <span className="text-sm font-medium">{p.name}</span>
                        <span className="text-xs text-muted">{p.breed}</span>
                      </Link>
                    ))}
                    <NewPetButton owners={ownersList} defaultOwnerId={o.id} label="+ Mascota" />
                  </div>
                </GlassCard>
              </Magnetic>
            </Reveal>
          ))}
        </Stagger>
      )}
    </div>
  );
}
