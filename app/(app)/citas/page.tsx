import { getAppointments, getPetsWithOwner } from "@/lib/supabase/queries";
import { AppointmentsView } from "@/components/clinica/AppointmentsView";

export const dynamic = "force-dynamic";

export default async function CitasPage() {
  const [appointments, pets] = await Promise.all([
    getAppointments(),
    getPetsWithOwner(),
  ]);
  return <AppointmentsView appointments={appointments} pets={pets} />;
}
