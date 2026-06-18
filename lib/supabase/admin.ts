import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Cliente ADMIN de Supabase — usa la service_role key.
 *
 * ⚠️ SOLO SERVIDOR. Este cliente SALTA todas las políticas de seguridad (RLS)
 * y tiene acceso total a la base de datos. El import "server-only" hace que
 * el build FALLE si por accidente se importa desde código de cliente.
 *
 * Úsalo solo para tareas administrativas de confianza (webhooks, jobs,
 * operaciones de backend), nunca para servir datos directamente al navegador.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
