import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/acceso-expirado"];

/**
 * Verificación de acceso en el SERVIDOR (no solo en la interfaz):
 * - sin sesión → /login
 * - sesión sin perfil válido → /login
 * - cuenta de cliente vencida → /acceso-expirado
 * - rutas de administración (/ajustes) → solo admin
 * Además refresca la sesión de Supabase en cada request.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        },
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC.some((p) => path === p || path.startsWith(p + "/"));

  function redirectTo(p: string) {
    const url = request.nextUrl.clone();
    url.pathname = p;
    url.search = "";
    const r = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) => r.cookies.set(c));
    return r;
  }

  if (!user) {
    return isPublic ? response : redirectTo("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, expires_at")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return isPublic ? response : redirectTo("/login");
  }

  const isAdmin = profile.role === "admin";
  const expired = !isAdmin && !!profile.expires_at && new Date(profile.expires_at).getTime() < Date.now();

  if (expired) {
    return path.startsWith("/acceso-expirado") ? response : redirectTo("/acceso-expirado");
  }

  if (path === "/login") return redirectTo("/dashboard");
  if ((path === "/ajustes" || path.startsWith("/ajustes/")) && !isAdmin) return redirectTo("/dashboard");

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
