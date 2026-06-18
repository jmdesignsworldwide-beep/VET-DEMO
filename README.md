# Vet Demo

Aplicación de demostración veterinaria construida con **Next.js** (App Router) y **Supabase**.

## Cómo conectar las llaves de Supabase

Esta app necesita **3 llaves** de tu proyecto de Supabase. Las encuentras en
Supabase → **Project Settings** → **API Keys** (y la URL en **Data API**).

| Variable | Dónde se usa | ¿Pública? |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Cliente y servidor | Sí (segura) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente y servidor | Sí (segura, protegida por RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Solo servidor** | **NO — secreta, salta RLS** |

### Desarrollo local

1. Copia `.env.local.example` a un archivo nuevo llamado `.env.local`.
2. Rellena las 3 llaves con los valores reales.
3. `.env.local` ya está en `.gitignore`: **nunca** se sube al repositorio.

### Producción (Vercel)

Añade las mismas 3 variables en **Vercel → Project → Settings → Environment
Variables**. Marca `SUPABASE_SERVICE_ROLE_KEY` como **Sensitive**.

## Estructura de la conexión

- `lib/supabase/client.ts` — cliente para el **navegador** (anon key).
- `lib/supabase/server.ts` — cliente para el **servidor** con sesión del usuario (anon key + cookies, respeta RLS).
- `lib/supabase/admin.ts` — cliente **admin** con `service_role` (solo servidor, salta RLS).
- `middleware.ts` — refresca la sesión de autenticación en cada request.

## Scripts

```bash
npm install      # instala dependencias
npm run dev      # servidor de desarrollo en http://localhost:3000
npm run build    # build de producción
```
