-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Bloque Clínica — Esquema base
--  Tablas, índices, RLS y bucket de Storage.
--  Idempotente: seguro de re-ejecutar.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- ───────────────────────── Tablas ─────────────────────────

-- Dueños
create table if not exists public.owners (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  cedula      text,
  phone       text,
  email       text,
  address     text,
  notes       text,
  created_at  timestamptz not null default now()
);

-- Mascotas (un dueño → muchas mascotas)
create table if not exists public.pets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.owners(id) on delete cascade,
  name        text not null,
  species     text not null default 'Perro',
  breed       text,
  sex         text,                       -- Macho / Hembra
  birthdate   date,
  weight_kg   numeric(5,2),
  color       text,
  allergies   text,
  microchip   text,
  photo_url   text,
  status      text not null default 'activo',
  created_at  timestamptz not null default now()
);

-- Citas / consultas agendadas
create table if not exists public.appointments (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references public.pets(id) on delete cascade,
  scheduled_at  timestamptz not null,
  reason        text not null,
  status        text not null default 'programada',  -- programada / completada / cancelada
  vet_name      text,
  notes         text,
  price         numeric(10,2),
  created_at    timestamptz not null default now()
);

-- Historia clínica (consultas, diagnósticos, tratamientos, desparasitación...)
create table if not exists public.medical_records (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  type         text not null default 'consulta',
  title        text not null,
  description  text,
  diagnosis    text,
  treatment    text,
  vet_name     text,
  price        numeric(10,2),
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- Vacunas
create table if not exists public.vaccinations (
  id          uuid primary key default gen_random_uuid(),
  pet_id      uuid not null references public.pets(id) on delete cascade,
  vaccine     text not null,              -- Rabia / Parvovirus / Moquillo / Séxtuple...
  applied_at  date not null default current_date,
  next_due    date,
  vet_name    text,
  lot         text,
  created_at  timestamptz not null default now()
);

-- Hospitalización (alimenta "internadas ahora" del dashboard)
create table if not exists public.hospitalizations (
  id            uuid primary key default gen_random_uuid(),
  pet_id        uuid not null references public.pets(id) on delete cascade,
  reason        text not null,
  status        text not null default 'estable',  -- estable / en observación / crítico / recuperación
  treatment     text,
  notes         text,
  vet_name      text,
  admitted_at   timestamptz not null default now(),
  discharged_at timestamptz,                       -- null = sigue internada
  created_at    timestamptz not null default now()
);

-- Recetas / diagnósticos digitales
create table if not exists public.prescriptions (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  vet_name     text not null,
  issued_at    timestamptz not null default now(),
  items        jsonb not null default '[]'::jsonb,  -- [{medication, dose, frequency, duration}]
  instructions text,
  created_at   timestamptz not null default now()
);

-- Registro fotográfico de evolución
create table if not exists public.pet_photos (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  storage_path text not null,
  caption      text,
  taken_at     timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- Línea de tiempo unificada (mezcla los 3 negocios: clínica + hotel + peluquería)
create table if not exists public.pet_events (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  kind         text not null,   -- hotel_checkin/hotel_checkout/grooming/vaccine/consultation/hospitalization/discharge/photo/appointment
  title        text not null,
  description  text,
  amount       numeric(10,2),
  occurred_at  timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- ───────────────────────── Índices ─────────────────────────
create index if not exists idx_pets_owner          on public.pets(owner_id);
create index if not exists idx_appointments_pet     on public.appointments(pet_id);
create index if not exists idx_appointments_when    on public.appointments(scheduled_at);
create index if not exists idx_records_pet          on public.medical_records(pet_id);
create index if not exists idx_vaccinations_pet     on public.vaccinations(pet_id);
create index if not exists idx_hospital_pet         on public.hospitalizations(pet_id);
create index if not exists idx_hospital_active      on public.hospitalizations(discharged_at);
create index if not exists idx_prescriptions_pet    on public.prescriptions(pet_id);
create index if not exists idx_photos_pet           on public.pet_photos(pet_id);
create index if not exists idx_events_pet           on public.pet_events(pet_id);
create index if not exists idx_events_when          on public.pet_events(occurred_at);

-- ───────────────────────── RLS ─────────────────────────
-- Modelo: clínica única, el personal autenticado comparte los datos.
-- anon → sin acceso; authenticated → acceso completo.

do $$
declare t text;
begin
  foreach t in array array[
    'owners','pets','appointments','medical_records','vaccinations',
    'hospitalizations','prescriptions','pet_photos','pet_events'
  ]
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on public.%I;', t);
    execute format(
      'create policy "auth_all" on public.%I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;

-- ───────────────────────── Storage ─────────────────────────
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

drop policy if exists "pet_photos_read"   on storage.objects;
drop policy if exists "pet_photos_insert" on storage.objects;
drop policy if exists "pet_photos_update" on storage.objects;
drop policy if exists "pet_photos_delete" on storage.objects;

create policy "pet_photos_read"   on storage.objects for select to public
  using (bucket_id = 'pet-photos');
create policy "pet_photos_insert" on storage.objects for insert to authenticated
  with check (bucket_id = 'pet-photos');
create policy "pet_photos_update" on storage.objects for update to authenticated
  using (bucket_id = 'pet-photos');
create policy "pet_photos_delete" on storage.objects for delete to authenticated
  using (bucket_id = 'pet-photos');
