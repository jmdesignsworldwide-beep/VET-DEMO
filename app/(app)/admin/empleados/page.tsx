import { getEmployees } from "@/lib/supabase/queries";
import { EmployeesView } from "@/components/admin/EmployeesView";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const employees = await getEmployees();
  return <EmployeesView employees={employees} />;
}
