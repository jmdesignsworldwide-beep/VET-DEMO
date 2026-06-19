-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Cuentas iniciales (admin + cliente de muestra)
--  Login por usuario (email interno @nido.local). Idempotente.
-- ════════════════════════════════════════════════════════════════

create extension if not exists pgcrypto with schema extensions;

-- Limpia (cascada elimina identities y profiles)
delete from auth.users where email in ('admin@nido.local', 'clinica-demo@nido.local');

-- ───────────────── Usuario ADMIN (tú) ─────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'a0000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'admin@nido.local',
  extensions.crypt('NidoAdmin2026!', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"admin"}'::jsonb,
  '', '', '', ''
);
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'a0000000-0000-4000-8000-000000000001', 'admin@nido.local',
  '{"sub":"a0000000-0000-4000-8000-000000000001","email":"admin@nido.local","email_verified":true}'::jsonb,
  'email', now(), now(), now());

-- ───────────────── Cuenta CLIENTE de muestra (30 días) ─────────────────
insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'c1000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'clinica-demo@nido.local',
  extensions.crypt('ClienteDemo2026!', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"username":"clinica-demo"}'::jsonb,
  '', '', '', ''
);
insert into auth.identities (id, user_id, provider_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
values (gen_random_uuid(), 'c1000000-0000-4000-8000-000000000001', 'clinica-demo@nido.local',
  '{"sub":"c1000000-0000-4000-8000-000000000001","email":"clinica-demo@nido.local","email_verified":true}'::jsonb,
  'email', now(), now(), now());

-- ───────────────── Perfiles ─────────────────
insert into public.profiles (id, username, role, expires_at) values
('a0000000-0000-4000-8000-000000000001', 'admin', 'admin', null),
('c1000000-0000-4000-8000-000000000001', 'clinica-demo', 'cliente', now() + interval '30 day')
on conflict (id) do update set username = excluded.username, role = excluded.role, expires_at = excluded.expires_at;
