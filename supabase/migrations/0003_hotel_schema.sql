-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Bloque Hotel Canino — Esquema
--  Habitaciones, estadías y reportes diarios (tarjeta postal).
--  Idempotente.
-- ════════════════════════════════════════════════════════════════

-- Habitaciones / jaulas
create table if not exists public.rooms (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  type            text not null default 'Estándar',   -- Suite / Estándar / Familiar
  capacity        int not null default 1,
  price_per_night numeric(10,2) not null default 1200,
  status          text not null default 'disponible', -- disponible / mantenimiento
  notes           text,
  created_at      timestamptz not null default now()
);

-- Estadías / reservas
create table if not exists public.stays (
  id              uuid primary key default gen_random_uuid(),
  pet_id          uuid not null references public.pets(id) on delete cascade,
  room_id         uuid not null references public.rooms(id) on delete cascade,
  check_in        date not null,
  check_out       date not null,
  status          text not null default 'reservada',  -- reservada / en_curso / finalizada / cancelada
  price_per_night numeric(10,2) not null default 1200,
  notes           text,
  created_at      timestamptz not null default now()
);

-- Reporte diario al dueño (tarjeta postal)
create table if not exists public.daily_reports (
  id          uuid primary key default gen_random_uuid(),
  stay_id     uuid not null references public.stays(id) on delete cascade,
  pet_id      uuid not null references public.pets(id) on delete cascade,
  report_date date not null default current_date,
  mood        text not null,
  message     text not null,
  activities  jsonb not null default '[]'::jsonb,
  photo_path  text,
  created_at  timestamptz not null default now()
);

-- Índices
create index if not exists idx_stays_pet     on public.stays(pet_id);
create index if not exists idx_stays_room    on public.stays(room_id);
create index if not exists idx_stays_dates   on public.stays(check_in, check_out);
create index if not exists idx_stays_status  on public.stays(status);
create index if not exists idx_reports_stay  on public.daily_reports(stay_id);
create index if not exists idx_reports_pet   on public.daily_reports(pet_id);

-- RLS (mismo modelo: anon sin acceso, authenticated completo)
do $$
declare t text;
begin
  foreach t in array array['rooms','stays','daily_reports']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on public.%I;', t);
    execute format(
      'create policy "auth_all" on public.%I for all to authenticated using (true) with check (true);',
      t
    );
  end loop;
end $$;
