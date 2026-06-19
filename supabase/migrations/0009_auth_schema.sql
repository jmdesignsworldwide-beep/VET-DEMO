-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Sistema de usuarios (perfiles, roles, vencimiento)
--  Idempotente.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  role        text not null default 'cliente',   -- admin / cliente
  expires_at  timestamptz,                        -- null = sin vencimiento
  created_at  timestamptz not null default now()
);

-- ¿El usuario actual es admin? SECURITY DEFINER evita recursión de RLS.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

-- RLS estricto
alter table public.profiles enable row level security;

drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles for select to authenticated
  using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_admin_write" on public.profiles for all to authenticated
  using (public.is_admin()) with check (public.is_admin());
