import { getOwnersWithPets, getOwnersList } from "@/lib/supabase/queries";
import { ClientsView } from "@/components/clinica/ClientsView";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const [owners, ownersList] = await Promise.all([
    getOwnersWithPets(),
    getOwnersList(),
  ]);
  return <ClientsView owners={owners} ownersList={ownersList} />;
}
