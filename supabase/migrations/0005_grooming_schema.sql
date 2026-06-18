-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Bloque Peluquería (Grooming) — Esquema
--  Reusa el bucket 'pet-photos' (subcarpeta grooming/).
--  Idempotente.
-- ════════════════════════════════════════════════════════════════

-- Citas de grooming (agenda)
create table if not exists public.grooming_appointments (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  scheduled_at timestamptz not null,
  service      text not null,
  groomer      text,
  status       text not null default 'programada', -- programada / en_proceso / completada / cancelada
  price        numeric(10,2),
  notes        text,
  created_at   timestamptz not null default now()
);

-- Servicios realizados (historial)
create table if not exists public.grooming_services (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  service      text not null,
  groomer      text,
  price        numeric(10,2),
  notes        text,
  performed_at timestamptz not null default now(),
  created_at   timestamptz not null default now()
);

-- Preferencias de corte (una por mascota)
create table if not exists public.grooming_preferences (
  pet_id          uuid primary key references public.pets(id) on delete cascade,
  cut_type        text,
  products        text,
  frequency_weeks int,
  groomer_pref    text,
  notes           text,
  updated_at      timestamptz not null default now()
);

-- Fotos antes / después
create table if not exists public.grooming_photos (
  id           uuid primary key default gen_random_uuid(),
  pet_id       uuid not null references public.pets(id) on delete cascade,
  service_label text,
  before_path  text not null,
  after_path   text not null,
  caption      text,
  created_at   timestamptz not null default now()
);

create index if not exists idx_gappt_pet   on public.grooming_appointments(pet_id);
create index if not exists idx_gappt_when  on public.grooming_appointments(scheduled_at);
create index if not exists idx_gserv_pet   on public.grooming_services(pet_id);
create index if not exists idx_gphotos_pet on public.grooming_photos(pet_id);

-- RLS
do $$
declare t text;
begin
  foreach t in array array['grooming_appointments','grooming_services','grooming_preferences','grooming_photos']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on public.%I;', t);
    execute format('create policy "auth_all" on public.%I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
