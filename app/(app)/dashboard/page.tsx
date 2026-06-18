import { SalaDeMando } from "@/components/dashboard/SalaDeMando";
import {
  getDashboardLive,
  getTodayAppointments,
  getRecentEvents,
} from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [live, todayAppointments, recentActivity] = await Promise.all([
    getDashboardLive(),
    getTodayAppointments(),
    getRecentEvents(6),
  ]);

  return (
    <SalaDeMando
      data={{
        hospitalizedCount: live.hospitalizedCount,
        hospitalizedNames: live.hospitalizedNames,
        todayCount: live.todayCount,
        nextAppointment: live.nextAppointment,
        revenueToday: live.revenueToday,
        todayAppointments,
        recentActivity,
      }}
    />
  );
}
