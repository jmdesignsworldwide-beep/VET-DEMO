-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Throttle de login por usuario (anti fuerza bruta)
--  Cuenta intentos fallidos por usuario y aplica bloqueos crecientes.
--  Se gestiona SOLO desde el servidor con el rol service_role (que
--  ignora RLS). Nadie más puede leer ni escribir esta tabla.
--  Idempotente.
-- ════════════════════════════════════════════════════════════════

create table if not exists public.login_attempts (
  username        text primary key,
  fail_count      int  not null default 0,
  locked_until    timestamptz,
  last_failed_at  timestamptz,
  updated_at      timestamptz not null default now()
);

-- RLS estricto: se activa SIN políticas → ni 'anon' ni 'authenticated'
-- pueden ver ni tocar una sola fila. Solo el service_role (server-only,
-- salta RLS) la administra.
alter table public.login_attempts enable row level security;

-- Cinturón y tirantes: aunque algún día se desactivara RLS, revocamos
-- todo privilegio a los roles del cliente.
revoke all on public.login_attempts from anon, authenticated;
