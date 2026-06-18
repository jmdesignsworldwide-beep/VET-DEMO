-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Usuario demo + datos sembrados (realismo dominicano)
--  Idempotente: borra y reinserta el set demo.
-- ════════════════════════════════════════════════════════════════

-- ───────────────── Usuario demo (auth) ─────────────────
delete from auth.users where email = 'demo@clinicanido.do';

insert into auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_app_meta_data, raw_user_meta_data,
  confirmation_token, recovery_token, email_change_token_new, email_change
) values (
  '00000000-0000-0000-0000-000000000000',
  'd3000000-0000-4000-8000-000000000001',
  'authenticated', 'authenticated', 'demo@clinicanido.do',
  extensions.crypt('NidoDemo2026!', extensions.gen_salt('bf')),
  now(), now(), now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Admin Nido"}'::jsonb,
  '', '', '', ''
);

insert into auth.identities (
  id, user_id, provider_id, identity_data, provider,
  last_sign_in_at, created_at, updated_at
) values (
  gen_random_uuid(),
  'd3000000-0000-4000-8000-000000000001',
  'demo@clinicanido.do',
  '{"sub":"d3000000-0000-4000-8000-000000000001","email":"demo@clinicanido.do","email_verified":true}'::jsonb,
  'email', now(), now(), now()
);

-- ───────────────── Limpieza set demo ─────────────────
delete from public.owners where id in (
  '0a000000-0000-4000-8000-000000000001',
  '0a000000-0000-4000-8000-000000000002',
  '0a000000-0000-4000-8000-000000000003',
  '0a000000-0000-4000-8000-000000000004',
  '0a000000-0000-4000-8000-000000000005',
  '0a000000-0000-4000-8000-000000000006'
);

-- ───────────────── Dueños ─────────────────
insert into public.owners (id, full_name, cedula, phone, email, address, notes) values
('0a000000-0000-4000-8000-000000000001','Carlos Rodríguez','001-1234567-8','809-555-0142','carlos.rodriguez@gmail.com','C/ Duarte 45, Santiago','Cliente desde 2019'),
('0a000000-0000-4000-8000-000000000002','María Pérez','002-2345678-9','829-555-0173','maria.perez@hotmail.com','Av. 27 de Febrero 120, Santo Domingo',null),
('0a000000-0000-4000-8000-000000000003','José Santos','031-0987654-3','849-555-0119','jose.santos@gmail.com','C/ El Sol 8, Santiago','Prefiere citas en la tarde'),
('0a000000-0000-4000-8000-000000000004','Ana Díaz','001-7654321-0','809-555-0188','ana.diaz@gmail.com','Los Jardines, Santo Domingo',null),
('0a000000-0000-4000-8000-000000000005','Rosa Fernández','023-4567890-1','829-555-0156','rosa.fernandez@gmail.com','Gurabo, Santiago','Dos mascotas'),
('0a000000-0000-4000-8000-000000000006','Luis Mateo','001-3456789-2','849-555-0134','luis.mateo@gmail.com','Bella Vista, Santo Domingo',null);

-- ───────────────── Mascotas ─────────────────
insert into public.pets (id, owner_id, name, species, breed, sex, birthdate, weight_kg, color, allergies, microchip) values
('0e000000-0000-4000-8000-000000000001','0a000000-0000-4000-8000-000000000001','Max','Perro','Pastor Alemán','Macho','2019-03-10',32.5,'Negro y fuego',null,'729000111222333'),
('0e000000-0000-4000-8000-000000000002','0a000000-0000-4000-8000-000000000002','Luna','Perro','Sato dominicano','Hembra','2021-06-01',14.2,'Marrón',null,'729000444555666'),
('0e000000-0000-4000-8000-000000000003','0a000000-0000-4000-8000-000000000003','Rocky','Perro','Pitbull','Macho','2020-01-20',28.0,'Atigrado','Pollo','729000777888999'),
('0e000000-0000-4000-8000-000000000004','0a000000-0000-4000-8000-000000000004','Coco','Perro','Poodle Toy','Hembra','2022-09-15',4.1,'Blanco',null,null),
('0e000000-0000-4000-8000-000000000005','0a000000-0000-4000-8000-000000000005','Bella','Perro','Golden Retriever','Hembra','2018-11-05',30.3,'Dorado',null,'729000123123123'),
('0e000000-0000-4000-8000-000000000006','0a000000-0000-4000-8000-000000000006','Toby','Perro','Schnauzer','Macho','2020-07-22',8.4,'Sal y pimienta',null,null),
('0e000000-0000-4000-8000-000000000007','0a000000-0000-4000-8000-000000000006','Nina','Perro','Chihuahua','Hembra','2023-02-14',3.0,'Crema',null,null);

-- ───────────────── Hospitalizaciones (3 activas = "internadas ahora") ─────────────────
insert into public.hospitalizations (pet_id, reason, status, treatment, vet_name, admitted_at, discharged_at) values
('0e000000-0000-4000-8000-000000000001','Post-operatorio esterilización','recuperación','Analgésicos c/8h, reposo, curación diaria','Dra. Polanco', now() - interval '1 day', null),
('0e000000-0000-4000-8000-000000000002','Gastroenteritis aguda','en observación','Fluidoterapia IV, antieméticos','Dr. Castillo', now() - interval '2 day', null),
('0e000000-0000-4000-8000-000000000005','Curación de herida en pata','estable','Antibiótico c/12h, vendaje','Dra. Polanco', now() - interval '6 hour', null),
-- una hospitalización pasada (dada de alta) para la línea de tiempo
('0e000000-0000-4000-8000-000000000003','Observación post-pelea','estable','Sutura y antibiótico','Dr. Castillo', now() - interval '40 day', now() - interval '38 day');

-- ───────────────── Citas de HOY (alimentan "citas de hoy" del dashboard) ─────────────────
insert into public.appointments (pet_id, scheduled_at, reason, status, vet_name, price) values
('0e000000-0000-4000-8000-000000000004', date_trunc('day', now()) + interval '12 hours 15 minutes','Consulta general','programada','Dr. Castillo',1200),
('0e000000-0000-4000-8000-000000000006', date_trunc('day', now()) + interval '14 hours 30 minutes','Vacunación séxtuple','programada','Dra. Polanco',1500),
('0e000000-0000-4000-8000-000000000007', date_trunc('day', now()) + interval '16 hours','Desparasitación','programada','Dr. Castillo',650),
('0e000000-0000-4000-8000-000000000003', date_trunc('day', now()) + interval '17 hours 30 minutes','Control post-operatorio','programada','Dra. Polanco',900),
-- una cita futura
('0e000000-0000-4000-8000-000000000001', now() + interval '3 day','Retiro de puntos','programada','Dra. Polanco',800);

-- ───────────────── Vacunas ─────────────────
insert into public.vaccinations (pet_id, vaccine, applied_at, next_due, vet_name, lot) values
('0e000000-0000-4000-8000-000000000001','Rabia', current_date - 120, current_date + 245,'Dra. Polanco','RB-2291'),
('0e000000-0000-4000-8000-000000000001','Séxtuple', current_date - 120, current_date + 245,'Dra. Polanco','SX-1180'),
('0e000000-0000-4000-8000-000000000002','Parvovirus', current_date - 80, current_date + 285,'Dr. Castillo','PV-3340'),
('0e000000-0000-4000-8000-000000000005','Rabia', current_date - 30, current_date + 335,'Dra. Polanco','RB-2310'),
('0e000000-0000-4000-8000-000000000005','Moquillo', current_date - 200, current_date - 35,'Dra. Polanco','MQ-0091'),
('0e000000-0000-4000-8000-000000000004','Séxtuple', current_date - 15, current_date + 350,'Dr. Castillo','SX-1205');

-- ───────────────── Historia clínica ─────────────────
insert into public.medical_records (pet_id, type, title, description, diagnosis, treatment, vet_name, price, occurred_at) values
('0e000000-0000-4000-8000-000000000001','consulta','Chequeo pre-quirúrgico','Evaluación general previa a esterilización','Apto para cirugía','Programar esterilización','Dra. Polanco',1200, now() - interval '5 day'),
('0e000000-0000-4000-8000-000000000001','cirugía','Esterilización','Procedimiento sin complicaciones','—','Hospitalización 2 días','Dra. Polanco',8500, now() - interval '1 day'),
('0e000000-0000-4000-8000-000000000002','consulta','Vómitos y decaimiento','Presenta vómitos desde hace 2 días','Gastroenteritis aguda','Fluidoterapia y dieta blanda','Dr. Castillo',1500, now() - interval '2 day'),
('0e000000-0000-4000-8000-000000000005','consulta','Herida en pata trasera','Laceración por objeto cortante','Herida superficial','Limpieza, sutura y antibiótico','Dra. Polanco',2200, now() - interval '6 hour'),
('0e000000-0000-4000-8000-000000000003','consulta','Desparasitación rutinaria','Control trimestral','Sano','Antiparasitario oral','Dr. Castillo',650, now() - interval '60 day'),
('0e000000-0000-4000-8000-000000000004','consulta','Primera visita','Cachorra sana, plan de vacunación','Sana','Iniciar esquema de vacunas','Dr. Castillo',1200, now() - interval '90 day');

-- ───────────────── Recetas ─────────────────
insert into public.prescriptions (pet_id, vet_name, issued_at, items, instructions) values
('0e000000-0000-4000-8000-000000000001','Dra. Polanco', now() - interval '1 day',
  '[{"medication":"Meloxicam 1.5mg","dose":"1 tableta","frequency":"cada 24h","duration":"5 días"},{"medication":"Amoxicilina 250mg","dose":"1 tableta","frequency":"cada 12h","duration":"7 días"}]'::jsonb,
  'Administrar con comida. Mantener reposo. Volver para retiro de puntos.'),
('0e000000-0000-4000-8000-000000000002','Dr. Castillo', now() - interval '2 day',
  '[{"medication":"Metoclopramida","dose":"0.5 ml","frequency":"cada 8h","duration":"3 días"}]'::jsonb,
  'Dieta blanda. Hidratación abundante.');

-- ───────────────── Línea de tiempo (3 negocios = 1 organismo) ─────────────────
-- Bella: recorrido completo entre clínica, hotel y peluquería
insert into public.pet_events (pet_id, kind, title, description, amount, occurred_at) values
('0e000000-0000-4000-8000-000000000005','hotel_checkin','Llegada al hotel','Hospedaje fin de semana, suite premium',2400, now() - interval '120 day'),
('0e000000-0000-4000-8000-000000000005','hotel_checkout','Salida del hotel','Estancia de 2 noches', null, now() - interval '118 day'),
('0e000000-0000-4000-8000-000000000005','grooming','Baño y corte','Peluquería completa + corte de uñas',1800, now() - interval '95 day'),
('0e000000-0000-4000-8000-000000000005','vaccine','Vacuna Rabia','Refuerzo anual',900, now() - interval '30 day'),
('0e000000-0000-4000-8000-000000000005','consultation','Consulta','Herida en pata trasera',2200, now() - interval '6 hour'),
('0e000000-0000-4000-8000-000000000005','hospitalization','Hospitalización','Curación de herida, estable',null, now() - interval '6 hour'),
-- Max: pre-quirúrgico → cirugía → hospitalización
('0e000000-0000-4000-8000-000000000001','grooming','Baño','Baño medicado',800, now() - interval '20 day'),
('0e000000-0000-4000-8000-000000000001','vaccine','Vacuna Séxtuple','Refuerzo',1500, now() - interval '120 day'),
('0e000000-0000-4000-8000-000000000001','consultation','Chequeo pre-quirúrgico','Apto para cirugía',1200, now() - interval '5 day'),
('0e000000-0000-4000-8000-000000000001','hospitalization','Esterilización + hospitalización','Recuperación en curso',8500, now() - interval '1 day'),
-- Luna: hotel + gastroenteritis
('0e000000-0000-4000-8000-000000000002','hotel_checkin','Llegada al hotel','Hospedaje semanal',6000, now() - interval '15 day'),
('0e000000-0000-4000-8000-000000000002','consultation','Consulta','Gastroenteritis aguda',1500, now() - interval '2 day'),
('0e000000-0000-4000-8000-000000000002','hospitalization','Hospitalización','En observación',null, now() - interval '2 day'),
-- Rocky: pelea → alta
('0e000000-0000-4000-8000-000000000003','hospitalization','Observación post-pelea','Sutura y antibiótico',3500, now() - interval '40 day'),
('0e000000-0000-4000-8000-000000000003','discharge','Alta médica','Recuperación completa',null, now() - interval '38 day'),
('0e000000-0000-4000-8000-000000000003','grooming','Baño y corte','Peluquería completa',1800, now() - interval '10 day');
