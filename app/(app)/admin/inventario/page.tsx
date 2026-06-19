import { getInventory } from "@/lib/supabase/queries";
import { InventoryView } from "@/components/admin/InventoryView";

export const dynamic = "force-dynamic";

export default async function InventarioPage() {
  const items = await getInventory();
  return <InventoryView items={items} />;
}
