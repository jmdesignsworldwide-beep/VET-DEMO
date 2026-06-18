-- ════════════════════════════════════════════════════════════════
--  CLÍNICA NIDO · Peluquería — datos sembrados (realismo dominicano)
--  Idempotente: limpia grooming de las mascotas demo y reinserta.
-- ════════════════════════════════════════════════════════════════

do $$
declare ids uuid[] := array[
  '0e000000-0000-4000-8000-000000000001','0e000000-0000-4000-8000-000000000002',
  '0e000000-0000-4000-8000-000000000003','0e000000-0000-4000-8000-000000000004',
  '0e000000-0000-4000-8000-000000000005','0e000000-0000-4000-8000-000000000006',
  '0e000000-0000-4000-8000-000000000007'];
begin
  delete from public.grooming_appointments where pet_id = any(ids);
  delete from public.grooming_services where pet_id = any(ids);
  delete from public.grooming_preferences where pet_id = any(ids);
  delete from public.grooming_photos where pet_id = any(ids);
  delete from public.pet_events where kind = 'grooming' and title like 'Servicio de peluquería%';
end $$;

-- ───────────────── Preferencias de corte ─────────────────
insert into public.grooming_preferences (pet_id, cut_type, products, frequency_weeks, groomer_pref, notes) values
('0e000000-0000-4000-8000-000000000001','Corte higiénico','Shampoo hipoalergénico',8,'Yardel','Piel sensible, evitar secadora muy caliente'),
('0e000000-0000-4000-8000-000000000002','Baño y cepillado','Shampoo neutro',6,'Massiel','Le incomodan las uñas, hacerlo al final'),
('0e000000-0000-4000-8000-000000000003','Baño medicado','Shampoo antipulgas',5,'Yardel','Pelo corto, atención a orejas'),
('0e000000-0000-4000-8000-000000000004','Corte de raza (Poodle)','Shampoo blanco brillo',4,'Massiel','Corte tipo oso, pompón en la cola'),
('0e000000-0000-4000-8000-000000000005','Deslanado','Shampoo para pelo largo',6,'Yardel','Mucho subpelo, deslanar bien'),
('0e000000-0000-4000-8000-000000000006','Corte de raza (Schnauzer)','Shampoo texturizante',5,'Massiel','Cejas y barba marcadas');

-- ───────────────── Citas de grooming (agenda) ─────────────────
insert into public.grooming_appointments (pet_id, scheduled_at, service, groomer, status, price) values
('0e000000-0000-4000-8000-000000000004', date_trunc('day', now()) + interval '10 hours', 'Corte de raza (Poodle)','Massiel','en_proceso',1800),
('0e000000-0000-4000-8000-000000000006', date_trunc('day', now()) + interval '11 hours 30 minutes', 'Corte de raza (Schnauzer)','Massiel','programada',1800),
('0e000000-0000-4000-8000-000000000002', date_trunc('day', now()) + interval '13 hours', 'Baño y cepillado','Yardel','programada',1000),
('0e000000-0000-4000-8000-000000000005', date_trunc('day', now()) + interval '15 hours', 'Deslanado','Yardel','programada',1500),
('0e000000-0000-4000-8000-000000000001', now() + interval '4 day', 'Corte higiénico','Yardel','programada',1000),
('0e000000-0000-4000-8000-000000000003', now() + interval '6 day', 'Baño medicado','Yardel','programada',900);

-- ───────────────── Historial de servicios ─────────────────
insert into public.grooming_services (pet_id, service, groomer, price, performed_at, notes) values
('0e000000-0000-4000-8000-000000000005','Baño + corte completo','Yardel',2200, now() - interval '95 day','Quedó hermosa'),
('0e000000-0000-4000-8000-000000000005','Deslanado','Yardel',1500, now() - interval '40 day',null),
('0e000000-0000-4000-8000-000000000004','Corte de raza (Poodle)','Massiel',1800, now() - interval '28 day','Pompón impecable'),
('0e000000-0000-4000-8000-000000000003','Baño y corte','Yardel',1800, now() - interval '10 day',null),
('0e000000-0000-4000-8000-000000000001','Baño medicado','Yardel',800, now() - interval '20 day',null),
('0e000000-0000-4000-8000-000000000006','Corte de raza (Schnauzer)','Massiel',1800, now() - interval '33 day','Cejas marcadas');

-- ───────────────── Eventos en la línea de tiempo (✂️) ─────────────────
insert into public.pet_events (pet_id, kind, title, description, amount, occurred_at) values
('0e000000-0000-4000-8000-000000000005','grooming','Servicio de peluquería · Baño + corte','Quedó hermosa',2200, now() - interval '95 day'),
('0e000000-0000-4000-8000-000000000004','grooming','Servicio de peluquería · Corte de raza','Pompón impecable',1800, now() - interval '28 day'),
('0e000000-0000-4000-8000-000000000006','grooming','Servicio de peluquería · Corte Schnauzer','Cejas marcadas',1800, now() - interval '33 day');

-- ───────────────── Fotos antes / después (pares del mismo tamaño) ─────────────────
insert into public.grooming_photos (pet_id, service_label, before_path, after_path, caption) values
('0e000000-0000-4000-8000-000000000005','Baño + corte completo','https://placedog.net/900/700?id=200','https://placedog.net/900/700?id=201','¡Bella quedó irreconocible de lo linda!'),
('0e000000-0000-4000-8000-000000000004','Corte de raza (Poodle)','https://placedog.net/900/700?id=202','https://placedog.net/900/700?id=203','Coco con su corte tipo oso'),
('0e000000-0000-4000-8000-000000000006','Corte de raza (Schnauzer)','https://placedog.net/900/700?id=204','https://placedog.net/900/700?id=205','Toby con barba y cejas marcadas'),
('0e000000-0000-4000-8000-000000000003','Baño y corte','https://placedog.net/900/700?id=206','https://placedog.net/900/700?id=207','Rocky fresco y limpio');
