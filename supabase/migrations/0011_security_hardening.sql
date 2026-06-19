-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Blindaje de seguridad
--  Mete el vencimiento DENTRO de RLS: una cuenta de cliente vencida
--  pierde acceso a los datos aunque su JWT siga vigente.
--  Idempotente.
-- ════════════════════════════════════════════════════════════════

-- ¿El usuario actual tiene acceso vigente? (admin, o cliente no vencido)
create or replace function public.has_access()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'admin' or p.expires_at is null or p.expires_at > now())
  );
$$;

-- Reescribe la política "auth_all" de TODAS las tablas de negocio para
-- exigir has_access() (en lugar de 'true').
do $$
declare t text;
begin
  foreach t in array array[
    'owners','pets','appointments','medical_records','vaccinations',
    'hospitalizations','prescriptions','pet_photos','pet_events',
    'rooms','stays','daily_reports',
    'grooming_appointments','grooming_services','grooming_preferences','grooming_photos',
    'employees','inventory_items','expenses','invoices','whatsapp_log','audit_log','backups'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on public.%I;', t);
    execute format(
      'create policy "auth_all" on public.%I for all to authenticated using (public.has_access()) with check (public.has_access());',
      t
    );
  end loop;
end $$;

-- Storage: la escritura de fotos también exige acceso vigente (lectura pública se mantiene)
drop policy if exists "pet_photos_insert" on storage.objects;
drop policy if exists "pet_photos_update" on storage.objects;
drop policy if exists "pet_photos_delete" on storage.objects;
create policy "pet_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'pet-photos' and public.has_access());
create policy "pet_photos_update" on storage.objects for update to authenticated
  using (bucket_id = 'pet-photos' and public.has_access());
create policy "pet_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'pet-photos' and public.has_access());

-- profiles: se mantiene (cada quien ve su perfil; solo admin gestiona).
-- (No se aplica has_access() aquí para que el sistema pueda leer el propio
--  perfil y evaluar el vencimiento.)
