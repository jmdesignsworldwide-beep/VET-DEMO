import { getBackups, getWhatsappLog, getAuditLog } from "@/lib/supabase/queries";
import { SistemaView } from "@/components/admin/SistemaView";

export const dynamic = "force-dynamic";

export default async function SistemaPage() {
  const [backups, whatsapp, audit] = await Promise.all([
    getBackups(), getWhatsappLog(), getAuditLog(),
  ]);
  return <SistemaView backups={backups} whatsapp={whatsapp} audit={audit} />;
}
