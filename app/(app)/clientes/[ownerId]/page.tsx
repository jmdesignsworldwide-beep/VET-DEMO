import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Phone, Mail, IdCard, MapPin, ChevronRight } from "lucide-react";
import { getOwner } from "@/lib/supabase/queries";
import { GlassCard } from "@/components/ui/GlassCard";
import { PetAvatar } from "@/components/dashboard/PetAvatar";
import { EditOwnerButton } from "@/components/clinica/OwnerForm";
import { NewPetButton } from "@/components/clinica/PetForm";
import { age } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function OwnerPage({
  params,
}: {
  params: Promise<{ ownerId: string }>;
}) {
  const { ownerId } = await params;
  const owner = await getOwner(ownerId);
  if (!owner) notFound();

  const rows = [
    owner.cedula && { icon: IdCard, text: owner.cedula },
    owner.phone && { icon: Phone, text: owner.phone },
    owner.email && { icon: Mail, text: owner.email },
    owner.address && { icon: MapPin, text: owner.address },
  ].filter(Boolean) as { icon: typeof Phone; text: string }[];

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/clientes" className="mb-5 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Clientes y mascotas
      </Link>

      <GlassCard>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight">{owner.full_name}</h1>
            <p className="mt-1 text-sm text-muted">{owner.pets.length} mascota(s)</p>
          </div>
          <EditOwnerButton owner={owner} />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rows.map((r, i) => {
            const Icon = r.icon;
            return (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-ink/[0.03] px-4 py-3 text-sm">
                <Icon className="h-4 w-4 shrink-0 text-brand dark:text-brand-glow" />
                <span>{r.text}</span>
              </div>
            );
          })}
        </div>
        {owner.notes && <p className="mt-3 text-sm text-muted">📝 {owner.notes}</p>}
      </GlassCard>

      <div className="mt-6 mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Mascotas</h2>
        <NewPetButton defaultOwnerId={owner.id} label="+ Mascota" />
      </div>

      {owner.pets.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted">Este dueño aún no tiene mascotas.</p>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {owner.pets.map((p) => (
            <Link key={p.id} href={`/mascotas/${p.id}`}>
              <GlassCard className="group flex items-center gap-3 transition-shadow hover:shadow-glow">
                <PetAvatar name={p.name} size={48} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">{p.breed ?? "Raza N/D"} · {age(p.birthdate)}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted transition-transform group-hover:translate-x-0.5" />
              </GlassCard>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
