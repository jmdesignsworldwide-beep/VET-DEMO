import { redirect } from "next/navigation";
import { getCurrentProfile, getAccounts } from "@/lib/supabase/queries";
import { AccountsView } from "@/components/admin/AccountsView";

export const dynamic = "force-dynamic";

export default async function AjustesPage() {
  // Verificación de servidor: solo admin (además del middleware).
  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/dashboard");

  const accounts = await getAccounts();
  return <AccountsView accounts={accounts} />;
}
