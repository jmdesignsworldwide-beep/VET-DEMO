-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Bloque Administración — Esquema
--  Empleados, inventario, gastos, facturación NCF, WhatsApp,
--  auditoría, respaldos.  RLS en todas.  Idempotente.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.employees (
  id              uuid primary key default gen_random_uuid(),
  full_name       text not null,
  role            text not null,           -- Veterinario / Groomer / Cuidador / Recepción / Administración
  area            text not null,           -- Clínica / Hotel / Peluquería / General
  cedula          text,
  phone           text,
  email           text,
  salary          numeric(12,2),
  hired_on        date,
  vacation_total  int default 14,
  vacation_taken  int default 0,
  status          text default 'activo',
  created_at      timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  category    text not null,               -- Medicamento / Vacuna / Producto / Insumo
  unit        text default 'unidad',
  stock       numeric(10,2) not null default 0,
  min_stock   numeric(10,2) not null default 0,
  price       numeric(10,2),
  expiry_date date,
  supplier    text,
  created_at  timestamptz not null default now()
);

create table if not exists public.expenses (
  id          uuid primary key default gen_random_uuid(),
  category    text not null,               -- Nómina / Alquiler / Servicios / Insumos / Marketing
  area        text default 'General',
  description text,
  amount      numeric(12,2) not null,
  spent_on    date not null default current_date,
  created_at  timestamptz not null default now()
);

create table if not exists public.invoices (
  id            uuid primary key default gen_random_uuid(),
  ncf           text not null,
  ncf_type      text not null default 'B02',  -- B01 (crédito fiscal) / B02 (consumo)
  customer_name text not null,
  customer_rnc  text,
  area          text default 'Clínica',
  subtotal      numeric(12,2) not null,
  itbis         numeric(12,2) not null,        -- 18%
  total         numeric(12,2) not null,
  status        text default 'pagada',
  items         jsonb not null default '[]'::jsonb,
  issued_at     timestamptz not null default now()
);

create table if not exists public.whatsapp_log (
  id        uuid primary key default gen_random_uuid(),
  to_name   text not null,
  to_phone  text,
  message   text not null,
  kind      text default 'recordatorio',    -- recordatorio / reporte / factura / cumpleaños
  sent_at   timestamptz not null default now()
);

create table if not exists public.audit_log (
  id         uuid primary key default gen_random_uuid(),
  actor      text not null default 'Admin Nido',
  action     text not null,
  entity     text,
  detail     text,
  created_at timestamptz not null default now()
);

create table if not exists public.backups (
  id         uuid primary key default gen_random_uuid(),
  status     text not null default 'completado',
  size_mb    numeric(10,1),
  created_at timestamptz not null default now()
);

create index if not exists idx_expenses_when on public.expenses(spent_on);
create index if not exists idx_invoices_when on public.invoices(issued_at);
create index if not exists idx_inventory_cat on public.inventory_items(category);
create index if not exists idx_wa_when on public.whatsapp_log(sent_at);
create index if not exists idx_audit_when on public.audit_log(created_at);

-- RLS
do $$
declare t text;
begin
  foreach t in array array['employees','inventory_items','expenses','invoices','whatsapp_log','audit_log','backups']
  loop
    execute format('alter table public.%I enable row level security;', t);
    execute format('drop policy if exists "auth_all" on public.%I;', t);
    execute format('create policy "auth_all" on public.%I for all to authenticated using (true) with check (true);', t);
  end loop;
end $$;
