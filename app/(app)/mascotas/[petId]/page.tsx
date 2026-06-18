import { notFound } from "next/navigation";
import { getPetFull } from "@/lib/supabase/queries";
import { PetFicha } from "@/components/clinica/PetFicha";

export const dynamic = "force-dynamic";

export default async function MascotaPage({
  params,
}: {
  params: Promise<{ petId: string }>;
}) {
  const { petId } = await params;
  const pet = await getPetFull(petId);
  if (!pet) notFound();
  return <PetFicha pet={pet} />;
}
