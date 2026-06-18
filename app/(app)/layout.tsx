import { AuroraBackground } from "@/components/ui/AuroraBackground";
import { AppShell } from "@/components/layout/AppShell";

/**
 * Shell de la zona autenticada. (La protección por sesión se activará
 * cuando existan cuentas de admin; por ahora el área es visitable para
 * revisar la experiencia en los previews.)
 */
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AuroraBackground />
      <AppShell>{children}</AppShell>
    </>
  );
}
