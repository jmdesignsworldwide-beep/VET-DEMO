import { getInvoices } from "@/lib/supabase/queries";
import { InvoicesView } from "@/components/admin/InvoicesView";

export const dynamic = "force-dynamic";

export default async function FacturacionPage() {
  const invoices = await getInvoices();
  return <InvoicesView invoices={invoices} />;
}
