import { type CookieOptions, createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente de Supabase para el SERVIDOR (Server Components, Route Handlers,
 * Server Actions). Usa la anon key + las cookies de sesión del usuario,
 * de modo que respeta las políticas RLS para el usuario autenticado.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: CookieOptions }[],
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // El método `setAll` se llamó desde un Server Component.
            // Se puede ignorar si tienes middleware refrescando la sesión.
          }
        },
      },
    },
  );
}
