import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentProfile } from "@/lib/supabase/queries";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <>
      <AuroraBackground />
      <AppShell
        isAdmin={profile?.role === "admin"}
        username={profile?.username ?? "usuario"}
        role={profile?.role ?? "cliente"}
        expiresAt={profile?.expires_at ?? null}
      >
        {children}
      </AppShell>
    </>
  );
}
